import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLaPosteApiKey } from '@/lib/carriers/credentials'
import { trackShipment } from '@/lib/carriers/laposte-tracking'

/**
 * POST /api/admin/orders/[id]/track
 * Rafraîchit le tracking d'une commande manuellement
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params

  const shipping = await prisma.shipping.findFirst({
    where: { orderId: id },
    include: {
      events: { orderBy: { timestamp: 'desc' } },
      order: { select: { id: true, orderNumber: true, guestEmail: true, guestName: true, status: true } }
    }
  })

  if (!shipping || !shipping.trackingNumber) {
    return NextResponse.json({ error: 'Pas de numéro de suivi' }, { status: 400 })
  }

  // Vérifier si le transporteur est supporté par La Poste API
  const laPosteCarriers = ['colissimo', 'chronopost']
  const isLaPoste = laPosteCarriers.includes(shipping.carrier.toLowerCase())

  if (!isLaPoste) {
    return NextResponse.json({ error: `Tracking auto non disponible pour ${shipping.carrier}` }, { status: 400 })
  }

  const apiKey = await getLaPosteApiKey()
  if (!apiKey) {
    return NextResponse.json({ error: 'Clé API La Poste non configurée' }, { status: 500 })
  }

  try {
    const result = await trackShipment(shipping.trackingNumber, apiKey)

    // Insérer les nouveaux événements
    const existingDescriptions = new Set(
      shipping.events.map(e => `${e.timestamp.toISOString().slice(0, 16)}|${e.description}`)
    )

    const newEvents = result.events.filter(evt => {
      const key = `${evt.date.toISOString().slice(0, 16)}|${evt.description}`
      return !existingDescriptions.has(key)
    })

    if (newEvents.length > 0) {
      await prisma.shippingEvent.createMany({
        data: newEvents.map(evt => ({
          shippingId: shipping.id,
          status: result.status as any,
          description: evt.description,
          location: evt.location || null,
          timestamp: evt.date
        }))
      })
    }

    // Mettre à jour le statut
    const updateData: any = {}
    if (result.status !== shipping.status) {
      updateData.status = result.status
      if (result.status === 'DELIVERED') updateData.deliveredAt = new Date()
      if ((result.status === 'PICKED_UP' || result.status === 'IN_TRANSIT') && !shipping.shippedAt) {
        updateData.shippedAt = new Date()
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.shipping.update({
        where: { id: shipping.id },
        data: updateData
      })

      // Mettre à jour le statut commande
      const orderStatusMap: Record<string, string> = {
        'PICKED_UP': 'SHIPPED',
        'IN_TRANSIT': 'SHIPPED',
        'OUT_FOR_DELIVERY': 'SHIPPED',
        'DELIVERED': 'DELIVERED'
      }
      const newOrderStatus = orderStatusMap[result.status]
      if (newOrderStatus && shipping.order.status !== newOrderStatus) {
        await prisma.order.update({
          where: { id: shipping.order.id },
          data: { status: newOrderStatus as any }
        })
      }
    }

    // Retourner le shipping mis à jour
    const updatedShipping = await prisma.shipping.findFirst({
      where: { orderId: id },
      include: { events: { orderBy: { timestamp: 'desc' } } }
    })

    return NextResponse.json({
      shipping: updatedShipping,
      newEventsCount: newEvents.length,
      statusChanged: result.status !== shipping.status
    })
  } catch (error: any) {
    console.error(`[Track] Error for order ${id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
