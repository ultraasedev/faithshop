import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'

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
    const { amount, reason, isPartial } = body

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        refunds: true,
        user: { select: { name: true, email: true } }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    if (!order.stripePaymentIntentId) {
      return NextResponse.json({ error: 'Pas de paiement Stripe associé' }, { status: 400 })
    }

    // Calculate total already refunded
    const alreadyRefunded = order.refunds.reduce((sum, r) => sum + Number(r.amount), 0)
    const maxRefundable = Number(order.total) - alreadyRefunded

    if (amount > maxRefundable) {
      return NextResponse.json({
        error: `Montant maximum remboursable: ${maxRefundable.toFixed(2)} €`
      }, { status: 400 })
    }

    // Process refund via Stripe
    let stripeRefund
    try {
      stripeRefund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        amount: Math.round(amount * 100), // Convert to cents
        reason: reason === 'duplicate' ? 'duplicate'
              : reason === 'fraudulent' ? 'fraudulent'
              : 'requested_by_customer'
      })
    } catch (stripeError: unknown) {
      console.error('Erreur Stripe:', stripeError)
      const message = stripeError instanceof Error ? stripeError.message : 'Erreur Stripe'
      return NextResponse.json({ error: `Erreur Stripe: ${message}` }, { status: 500 })
    }

    // Record refund in database
    const refund = await prisma.refund.create({
      data: {
        orderId,
        amount,
        reason: reason || 'Remboursement demandé par l\'admin',
        stripeRefundId: stripeRefund.id,
        status: stripeRefund.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
        processedById: session.user.id
      }
    })

    // Update order status if full refund
    const totalRefunded = alreadyRefunded + amount
    const isFullRefund = totalRefunded >= Number(order.total) - 0.01

    if (isFullRefund) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'REFUNDED',
          paymentStatus: 'REFUNDED'
        }
      })
    } else if (totalRefunded > 0) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PARTIALLY_REFUNDED' }
      })
    }

    // Send refund email notification
    try {
      const customerEmail = order.user?.email || order.guestEmail
      const customerName = order.user?.name || order.guestName || 'Client'

      if (customerEmail) {
        const { sendRefundEmail } = await import('@/lib/email')
        await sendRefundEmail(
          customerEmail,
          customerName,
          order.orderNumber,
          amount,
          isFullRefund ? 'total' : 'partiel'
        )
      }
    } catch (emailError) {
      console.error('Erreur envoi email remboursement:', emailError)
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)

    return NextResponse.json({
      success: true,
      refund,
      stripeRefundId: stripeRefund.id,
      message: isFullRefund
        ? 'Remboursement total effectué'
        : `Remboursement partiel de ${amount.toFixed(2)} € effectué`
    })
  } catch (error) {
    console.error('Erreur lors du remboursement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Get refund history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: orderId } = await params

    const refunds = await prisma.refund.findMany({
      where: { orderId },
      include: {
        processedBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(refunds)
  } catch (error) {
    console.error('Erreur lors de la récupération des remboursements:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
