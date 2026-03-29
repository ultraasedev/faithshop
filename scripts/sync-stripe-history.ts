import 'dotenv/config'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function main() {
  console.log('=== Stripe History Sync ===\n')

  // Step 1: Clean mock/seed orders (ones without real stripePaymentIntentId)
  console.log('--- Step 1: Cleaning mock/seed data ---')
  const mockOrders = await prisma.order.findMany({
    where: {
      OR: [
        { stripePaymentIntentId: null },
        { stripePaymentIntentId: '' },
        { orderNumber: { startsWith: 'FS-2024-' } },
      ]
    },
    select: { id: true, orderNumber: true, stripePaymentIntentId: true }
  })

  if (mockOrders.length > 0) {
    console.log(`Found ${mockOrders.length} mock/seed orders to clean:`)
    for (const o of mockOrders) {
      console.log(`  - ${o.orderNumber} (stripe: ${o.stripePaymentIntentId || 'none'})`)
    }

    // Delete related records first, then orders
    const mockIds = mockOrders.map(o => o.id)
    await prisma.shippingEvent.deleteMany({ where: { shipping: { orderId: { in: mockIds } } } })
    await prisma.shipping.deleteMany({ where: { orderId: { in: mockIds } } })
    await prisma.refund.deleteMany({ where: { orderId: { in: mockIds } } })
    await prisma.orderItem.deleteMany({ where: { orderId: { in: mockIds } } })
    await prisma.order.deleteMany({ where: { id: { in: mockIds } } })
    console.log(`Cleaned ${mockOrders.length} mock orders.\n`)
  } else {
    console.log('No mock orders to clean.\n')
  }

  // Also clean test users (keep real admin accounts)
  const testUsers = await prisma.user.findMany({
    where: {
      email: { in: ['client@test.com', 'test1765747065725@example.com', 'test-client@example.com'] }
    },
    select: { id: true, email: true }
  })
  if (testUsers.length > 0) {
    console.log(`Cleaning ${testUsers.length} test users:`)
    for (const u of testUsers) {
      console.log(`  - ${u.email}`)
    }
    await prisma.user.deleteMany({
      where: { id: { in: testUsers.map(u => u.id) } }
    })
    console.log('')
  }

  // Step 2: Fetch all succeeded PaymentIntents from Stripe
  console.log('--- Step 2: Fetching Stripe PaymentIntents ---')
  const allPaymentIntents: Stripe.PaymentIntent[] = []
  let hasMore = true
  let startingAfter: string | undefined

  while (hasMore) {
    const params: Stripe.PaymentIntentListParams = {
      limit: 100,
    }
    if (startingAfter) params.starting_after = startingAfter

    const result = await stripe.paymentIntents.list(params)
    allPaymentIntents.push(...result.data)
    hasMore = result.has_more
    if (result.data.length > 0) {
      startingAfter = result.data[result.data.length - 1].id
    }
  }

  console.log(`Found ${allPaymentIntents.length} total PaymentIntents in Stripe`)

  // Filter to succeeded ones
  const succeededPIs = allPaymentIntents.filter(pi => pi.status === 'succeeded')
  console.log(`  - ${succeededPIs.length} succeeded`)
  console.log(`  - ${allPaymentIntents.length - succeededPIs.length} other statuses\n`)

  // Step 3: Sync succeeded PaymentIntents as orders
  console.log('--- Step 3: Syncing orders ---')
  let created = 0
  let skipped = 0
  let errors = 0

  for (const pi of succeededPIs) {
    // Check if order already exists
    const existing = await prisma.order.findFirst({
      where: { stripePaymentIntentId: pi.id }
    })
    if (existing) {
      skipped++
      continue
    }

    try {
      // Parse items from metadata
      let items: any[] = []
      try {
        items = JSON.parse(pi.metadata?.items || '[]')
      } catch {
        // No items metadata - create a generic order item
      }

      // Get customer info
      let customerEmail = pi.receipt_email || ''
      let customerName = pi.shipping?.name || ''

      if (!customerEmail && pi.latest_charge) {
        try {
          const charge = await stripe.charges.retrieve(pi.latest_charge as string)
          customerEmail = charge.billing_details?.email || ''
          if (!customerName) customerName = charge.billing_details?.name || ''
        } catch {
          // ignore
        }
      }

      const total = pi.amount / 100
      const shippingDetails = pi.shipping
      const orderNumber = `CMD-${pi.created}-${Math.floor(Math.random() * 1000)}`

      // Build order items
      const orderItems = items.length > 0
        ? items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity || 1,
            price: item.price || 0,
            productName: item.name || 'Produit',
            productImage: item.image || null,
            color: item.color || null,
            size: item.size || null,
          }))
        : undefined

      // Verify product IDs exist before creating order items
      let validItems: any[] | undefined
      if (orderItems) {
        validItems = []
        for (const item of orderItems) {
          const product = await prisma.product.findUnique({ where: { id: item.productId } })
          if (product) {
            validItems.push(item)
          } else {
            // Product doesn't exist, create item without productId relation
            console.log(`  Warning: Product ${item.productId} not found for PI ${pi.id}, skipping item`)
          }
        }
      }

      const order = await prisma.order.create({
        data: {
          orderNumber,
          total,
          subtotal: total,
          taxAmount: 0,
          shippingCost: 0,
          status: 'PAID',
          paymentStatus: 'COMPLETED',
          paymentMethod: 'STRIPE',
          stripePaymentIntentId: pi.id,
          guestName: customerName || 'Client',
          guestEmail: customerEmail || `guest-${pi.created}@faith-shop.fr`,
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
          ...(validItems && validItems.length > 0 ? {
            items: { create: validItems }
          } : {}),
          shipping: {
            create: {
              status: 'PENDING',
              carrier: 'Standard',
            }
          }
        }
      })

      console.log(`  Created: ${order.orderNumber} | ${total}€ | ${customerEmail || 'no email'} | ${new Date(pi.created * 1000).toLocaleDateString('fr-FR')}`)
      created++
    } catch (err: any) {
      console.error(`  Error syncing PI ${pi.id}: ${err.message}`)
      errors++
    }
  }

  console.log(`\nOrders: ${created} created, ${skipped} already existed, ${errors} errors\n`)

  // Step 4: Sync refunds from Stripe
  console.log('--- Step 4: Syncing refunds ---')
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

  console.log(`Found ${allRefunds.length} refunds in Stripe`)

  let refundsCreated = 0
  let refundsSkipped = 0

  for (const refund of allRefunds) {
    // Check if already exists
    const existing = await prisma.refund.findFirst({
      where: { stripeRefundId: refund.id }
    })
    if (existing) {
      refundsSkipped++
      continue
    }

    // Find the associated order
    const piId = typeof refund.payment_intent === 'string'
      ? refund.payment_intent
      : refund.payment_intent?.id

    if (!piId) {
      console.log(`  Skipping refund ${refund.id}: no payment_intent`)
      continue
    }

    const order = await prisma.order.findFirst({
      where: { stripePaymentIntentId: piId }
    })

    if (!order) {
      console.log(`  Skipping refund ${refund.id}: no matching order for PI ${piId}`)
      continue
    }

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

      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: isFullRefund ? 'REFUNDED' : order.status,
          paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        }
      })

      console.log(`  Refund: ${amount}€ for order ${order.orderNumber} (${isFullRefund ? 'FULL' : 'PARTIAL'})`)
      refundsCreated++
    } catch (err: any) {
      console.error(`  Error syncing refund ${refund.id}: ${err.message}`)
    }
  }

  console.log(`\nRefunds: ${refundsCreated} created, ${refundsSkipped} already existed\n`)

  // Step 5: Summary
  console.log('--- Final Summary ---')
  const totalOrders = await prisma.order.count()
  const totalRefunds = await prisma.refund.count()
  const paidOrders = await prisma.order.count({ where: { paymentStatus: 'COMPLETED' } })
  const refundedOrders = await prisma.order.count({ where: { status: 'REFUNDED' } })

  console.log(`Total orders in DB: ${totalOrders}`)
  console.log(`  - Paid: ${paidOrders}`)
  console.log(`  - Refunded: ${refundedOrders}`)
  console.log(`Total refunds in DB: ${totalRefunds}`)
  console.log('\nSync complete!')
}

main()
  .catch(e => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
