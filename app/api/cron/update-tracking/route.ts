import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLaPosteApiKey } from '@/lib/carriers/credentials'
import { trackShipment } from '@/lib/carriers/laposte-tracking'
import type { ShippingStatusType } from '@/lib/carriers/types'

/**
 * Cron endpoint - Met à jour le tracking de tous les colis actifs
 * Configuré pour tourner toutes les 4h via Vercel Cron
 *
 * GET /api/cron/update-tracking
 */
export async function GET(request: NextRequest) {
  // Vérifier le secret cron (Vercel envoie Authorization header)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = await getLaPosteApiKey()
  if (!apiKey) {
    return NextResponse.json({ error: 'La Poste API key not configured' }, { status: 500 })
  }

  // Récupérer tous les colis actifs avec tracking (Colissimo/Chronopost)
  const activeShipments = await prisma.shipping.findMany({
    where: {
      trackingNumber: { not: null },
      status: { notIn: ['DELIVERED', 'RETURNED'] },
      carrier: { in: ['Colissimo', 'colissimo', 'Chronopost', 'chronopost'] }
    },
    include: {
      order: { select: { id: true, orderNumber: true, guestEmail: true, guestName: true, status: true } },
      events: { orderBy: { timestamp: 'desc' } }
    },
    take: 50 // Limiter pour respecter le rate limit
  })

  let updated = 0
  let errors = 0
  const trackingUpdates: Array<{ orderNumber: string; customerName: string; status: string; carrier: string }> = []

  for (const shipment of activeShipments) {
    try {
      // Pause entre chaque appel (rate limiting)
      if (updated > 0 || errors > 0) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      const result = await trackShipment(shipment.trackingNumber!, apiKey)

      // Insérer les nouveaux événements
      const existingDescriptions = new Set(
        shipment.events.map(e => `${e.timestamp.toISOString().slice(0, 16)}|${e.description}`)
      )

      const newEvents = result.events.filter(evt => {
        const key = `${evt.date.toISOString().slice(0, 16)}|${evt.description}`
        return !existingDescriptions.has(key)
      })

      if (newEvents.length > 0) {
        await prisma.shippingEvent.createMany({
          data: newEvents.map(evt => ({
            shippingId: shipment.id,
            status: result.status as any,
            description: evt.description,
            location: evt.location || null,
            timestamp: evt.date
          }))
        })
      }

      // Mettre à jour le statut du shipping si changé
      if (result.status !== shipment.status) {
        const updateData: any = { status: result.status }

        if (result.status === 'DELIVERED') {
          updateData.deliveredAt = new Date()
        }
        if (result.status === 'PICKED_UP' || result.status === 'IN_TRANSIT') {
          if (!shipment.shippedAt) updateData.shippedAt = new Date()
        }

        await prisma.shipping.update({
          where: { id: shipment.id },
          data: updateData
        })

        // Mettre à jour le statut de la commande
        const orderStatusMap: Record<string, string> = {
          'PICKED_UP': 'SHIPPED',
          'IN_TRANSIT': 'SHIPPED',
          'OUT_FOR_DELIVERY': 'SHIPPED',
          'DELIVERED': 'DELIVERED'
        }
        const newOrderStatus = orderStatusMap[result.status]
        if (newOrderStatus && shipment.order.status !== newOrderStatus) {
          await prisma.order.update({
            where: { id: shipment.order.id },
            data: { status: newOrderStatus as any }
          })
        }

        // Envoyer email de notification si expédié ou livré
        if (result.status === 'PICKED_UP' || result.status === 'IN_TRANSIT') {
          try {
            const { sendShippingEmail } = await import('@/lib/email')
            await sendShippingEmail(
              shipment.order.guestEmail || '',
              shipment.order.guestName || 'Client',
              shipment.order.orderNumber,
              shipment.trackingNumber!,
              shipment.trackingUrl || '',
              shipment.carrier
            )
          } catch (emailErr) {
            console.error(`[Cron] Email error for ${shipment.order.orderNumber}:`, emailErr)
          }
        }

        if (result.status === 'DELIVERED') {
          try {
            const { sendDeliveryConfirmationEmail } = await import('@/lib/email')
            await sendDeliveryConfirmationEmail(
              shipment.order.guestEmail || '',
              shipment.order.guestName || 'Client',
              shipment.order.orderNumber
            )
          } catch (emailErr) {
            console.error(`[Cron] Delivery email error for ${shipment.order.orderNumber}:`, emailErr)
          }
        }

        // Notification admin pour chaque changement de statut
        const lastEvent = newEvents[0]?.description || result.status
        trackingUpdates.push({
          orderNumber: shipment.order.orderNumber,
          customerName: shipment.order.guestName || 'Client',
          status: result.status,
          carrier: shipment.carrier
        })

        try {
          const { sendAdminTrackingUpdateEmail } = await import('@/lib/email')
          await sendAdminTrackingUpdateEmail(
            shipment.order.orderNumber,
            shipment.order.guestName || 'Client',
            shipment.trackingNumber!,
            shipment.carrier,
            result.status,
            lastEvent
          )
        } catch (emailErr) {
          console.error(`[Cron] Admin email error for ${shipment.order.orderNumber}:`, emailErr)
        }

        updated++
      }
    } catch (error) {
      console.error(`[Cron] Error tracking ${shipment.trackingNumber}:`, error)
      errors++
    }
  }

  // Envoyer le résumé admin si des mises à jour ont eu lieu
  if (trackingUpdates.length > 0) {
    try {
      const { sendAdminTrackingSummaryEmail } = await import('@/lib/email')
      await sendAdminTrackingSummaryEmail(trackingUpdates)
    } catch (emailErr) {
      console.error('[Cron] Admin summary email error:', emailErr)
    }
  }

  console.log(`[Cron] Tracking update: ${activeShipments.length} checked, ${updated} updated, ${errors} errors`)

  return NextResponse.json({
    checked: activeShipments.length,
    updated,
    errors,
    timestamp: new Date().toISOString()
  })
}
