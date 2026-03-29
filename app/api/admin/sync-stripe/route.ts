import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    let created = 0
    let skipped = 0
    let failed = 0

    // Fetch ALL PaymentIntents from Stripe (succeeded + failed + canceled)
    const allPaymentIntents: Stripe.PaymentIntent[] = []
    let hasMore = true
    let startingAfter: string | undefined

    while (hasMore) {
      const params: Stripe.PaymentIntentListParams = { limit: 100 }
      if (startingAfter) params.starting_after = startingAfter
      const result = await stripe.paymentIntents.list(params)
      allPaymentIntents.push(...result.data)
      hasMore = result.has_more
      if (result.data.length > 0) {
        startingAfter = result.data[result.data.length - 1].id
      }
    }

    for (const pi of allPaymentIntents) {
      // Skip incomplete/requires_action intents
      if (!['succeeded', 'canceled', 'requires_payment_method'].includes(pi.status)) {
        continue
      }

      // Check if order already exists
      const existing = await prisma.order.findFirst({
        where: { stripePaymentIntentId: pi.id }
      })
      if (existing) {
        // Update status if needed
        const newStatus = pi.status === 'succeeded' ? 'COMPLETED'
          : pi.status === 'canceled' ? 'FAILED'
          : 'FAILED'
        if (existing.paymentStatus !== newStatus) {
          await prisma.order.update({
            where: { id: existing.id },
            data: {
              paymentStatus: newStatus,
              status: pi.status === 'succeeded' ? 'PAID' : 'CANCELLED'
            }
          })
        }
        skipped++
        continue
      }

      try {
        // Get customer info
        let customerEmail = pi.receipt_email || ''
        let customerName = pi.shipping?.name || ''

        if ((!customerEmail || !customerName) && pi.latest_charge) {
          try {
            const charge = await stripe.charges.retrieve(pi.latest_charge as string)
            if (!customerEmail) customerEmail = charge.billing_details?.email || ''
            if (!customerName) customerName = charge.billing_details?.name || ''
          } catch {}
        }

        // Try to get customer from Stripe Customer object
        if ((!customerEmail || !customerName) && pi.customer) {
          try {
            const customer = await stripe.customers.retrieve(pi.customer as string)
            if ('email' in customer) {
              if (!customerEmail) customerEmail = customer.email || ''
              if (!customerName) customerName = customer.name || ''
            }
          } catch {}
        }

        const total = pi.amount / 100
        const paymentStatus = pi.status === 'succeeded' ? 'COMPLETED' : 'FAILED'
        const orderStatus = pi.status === 'succeeded' ? 'PAID' : 'CANCELLED'
        const shippingDetails = pi.shipping
        const orderNumber = `CMD-${pi.created}-${Math.floor(Math.random() * 1000)}`

        // Parse items from metadata
        let orderItems: any[] | undefined
        try {
          const items = JSON.parse(pi.metadata?.items || '[]')
          if (items.length > 0) {
            const validItems = []
            for (const item of items) {
              const product = await prisma.product.findUnique({ where: { id: item.id } })
              if (product) {
                validItems.push({
                  productId: item.id,
                  quantity: item.quantity || 1,
                  price: item.price || 0,
                  productName: item.name || 'Produit',
                  productImage: item.image || null,
                  color: item.color || null,
                  size: item.size || null,
                })
              }
            }
            if (validItems.length > 0) orderItems = validItems
          }
        } catch {}

        await prisma.order.create({
          data: {
            orderNumber,
            total,
            subtotal: total,
            taxAmount: 0,
            shippingCost: 0,
            status: orderStatus,
            paymentStatus,
            paymentMethod: 'STRIPE',
            stripePaymentIntentId: pi.id,
            guestName: customerName || 'Client',
            guestEmail: customerEmail || `stripe-${pi.created}@faith-shop.fr`,
            shippingAddress: [
              shippingDetails?.address?.line1,
              shippingDetails?.address?.line2,
              shippingDetails?.address?.postal_code,
              shippingDetails?.address?.city,
              shippingDetails?.address?.country,
            ].filter(Boolean).join(', ') || 'Non renseignée',
            shippingCity: shippingDetails?.address?.city || '',
            shippingZip: shippingDetails?.address?.postal_code || '',
            shippingCountry: shippingDetails?.address?.country || 'FR',
            createdAt: new Date(pi.created * 1000),
            ...(orderItems ? { items: { create: orderItems } } : {}),
            ...(paymentStatus === 'COMPLETED' ? {
              shipping: { create: { status: 'PENDING', carrier: 'Standard' } }
            } : {}),
          }
        })
        created++
      } catch (err: any) {
        console.error(`Error syncing PI ${pi.id}:`, err.message)
        failed++
      }
    }

    // Sync refunds
    let refundsCreated = 0
    const allRefunds: Stripe.Refund[] = []
    hasMore = true
    startingAfter = undefined

    while (hasMore) {
      const params: Stripe.RefundListParams = { limit: 100 }
      if (startingAfter) params.starting_after = startingAfter
      const result = await stripe.refunds.list(params)
      allRefunds.push(...result.data)
      hasMore = result.has_more
      if (result.data.length > 0) {
        startingAfter = result.data[result.data.length - 1].id
      }
    }

    for (const refund of allRefunds) {
      const existingRefund = await prisma.refund.findFirst({
        where: { stripeRefundId: refund.id }
      })
      if (existingRefund) continue

      const piId = typeof refund.payment_intent === 'string'
        ? refund.payment_intent
        : refund.payment_intent?.id
      if (!piId) continue

      const order = await prisma.order.findFirst({
        where: { stripePaymentIntentId: piId }
      })
      if (!order) continue

      try {
        const amount = (refund.amount || 0) / 100
        const isFullRefund = amount >= Number(order.total)

        await prisma.refund.create({
          data: {
            orderId: order.id,
            amount,
            currency: (refund.currency || 'eur').toUpperCase(),
            type: isFullRefund ? 'FULL' : 'PARTIAL',
            status: refund.status === 'succeeded' ? 'COMPLETED' : refund.status === 'failed' ? 'FAILED' : 'PENDING',
            reason: refund.reason || 'Remboursement Stripe',
            stripeRefundId: refund.id,
            failureReason: refund.failure_reason || null,
            createdAt: new Date(refund.created * 1000),
          }
        })

        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: isFullRefund ? 'REFUNDED' : order.status,
            paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          }
        })
        refundsCreated++
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `Sync terminée: ${created} transactions importées, ${skipped} déjà existantes, ${failed} erreurs, ${refundsCreated} remboursements`,
      stats: {
        totalStripe: allPaymentIntents.length,
        created,
        skipped,
        failed,
        refundsCreated,
      }
    })
  } catch (error: any) {
    console.error('Stripe sync error:', error)
    return NextResponse.json({ error: error.message || 'Erreur de synchronisation' }, { status: 500 })
  }
}
