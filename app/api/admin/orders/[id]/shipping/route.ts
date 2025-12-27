import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ShippingStatus } from '@prisma/client'

// Create or update shipping
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: orderId } = await params
    const body = await request.json()
    const {
      carrier,
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
      weightKg,
      lengthCm,
      widthCm,
      heightCm
    } = body

    // Check if shipping already exists
    const existingShipping = await prisma.shipping.findFirst({
      where: { orderId }
    })

    let shipping
    if (existingShipping) {
      // Update existing shipping
      shipping = await prisma.shipping.update({
        where: { id: existingShipping.id },
        data: {
          carrier,
          trackingNumber,
          trackingUrl,
          estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
          weightKg,
          lengthCm,
          widthCm,
          heightCm
        }
      })
    } else {
      // Create new shipping
      shipping = await prisma.shipping.create({
        data: {
          orderId,
          carrier,
          trackingNumber,
          trackingUrl,
          estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
          weightKg,
          lengthCm,
          widthCm,
          heightCm,
          status: 'PENDING'
        }
      })

      // Update order status to processing if it was pending
      const order = await prisma.order.findUnique({ where: { id: orderId } })
      if (order?.status === 'PENDING') {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PROCESSING' }
        })
      }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)

    return NextResponse.json({
      success: true,
      shipping,
      message: existingShipping ? 'Expédition mise à jour' : 'Expédition créée'
    })
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour de l\'expédition:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Update shipping status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: orderId } = await params
    const { status, location, description } = await request.json()

    const shipping = await prisma.shipping.findFirst({
      where: { orderId }
    })

    if (!shipping) {
      return NextResponse.json({ error: 'Expédition non trouvée' }, { status: 404 })
    }

    // Update shipping status
    const updatedShipping = await prisma.shipping.update({
      where: { id: shipping.id },
      data: {
        status: status as ShippingStatus,
        ...(status === 'PICKED_UP' && { shippedAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() })
      }
    })

    // Create shipping event
    await prisma.shippingEvent.create({
      data: {
        shippingId: shipping.id,
        status: status as ShippingStatus,
        location,
        description: description || getStatusDescription(status as ShippingStatus)
      }
    })

    // Update order status
    if (['PICKED_UP', 'IN_TRANSIT'].includes(status)) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'SHIPPED' }
      })
    } else if (status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'DELIVERED' }
      })
    }

    // Send notification email if shipped
    if (status === 'PICKED_UP' || status === 'IN_TRANSIT') {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { user: true }
        })

        const customerEmail = order?.user?.email || order?.guestEmail
        const customerName = order?.user?.name || order?.guestName || 'Client'

        if (customerEmail && shipping.trackingNumber) {
          const { sendShippingEmail } = await import('@/lib/email')
          await sendShippingEmail(
            customerEmail,
            customerName,
            order!.orderNumber,
            shipping.trackingNumber,
            shipping.trackingUrl || '',
            shipping.carrier
          )
        }
      } catch (emailError) {
        console.error('Erreur envoi email expédition:', emailError)
      }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)

    return NextResponse.json({
      success: true,
      shipping: updatedShipping,
      message: 'Statut d\'expédition mis à jour'
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function getStatusDescription(status: ShippingStatus): string {
  const descriptions: Record<ShippingStatus, string> = {
    PENDING: 'Colis en attente de préparation',
    LABEL_CREATED: 'Étiquette d\'expédition créée',
    PICKED_UP: 'Colis pris en charge par le transporteur',
    IN_TRANSIT: 'Colis en transit',
    OUT_FOR_DELIVERY: 'Colis en cours de livraison',
    DELIVERED: 'Colis livré',
    RETURNED: 'Colis retourné'
  }
  return descriptions[status]
}
