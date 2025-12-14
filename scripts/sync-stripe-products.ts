
import { PrismaClient } from '@prisma/client'
import { stripe } from '../lib/stripe'

const prisma = new PrismaClient()

async function main() {
  console.log('Syncing products to Stripe...')

  const products = await prisma.product.findMany({
    where: { isActive: true }
  })

  console.log(`Found ${products.length} active products to sync.`)

  for (const product of products) {
    console.log(`Processing: ${product.name}`)

    try {
      // 1. Check if product already exists in Stripe (by name, simplistic check)
      // Ideally we should store stripeProductId in DB, which we do.
      let stripeProductId = product.stripeProductId
      let stripePriceId = product.stripePriceId

      if (!stripeProductId) {
        // Create Product in Stripe
        const stripeProduct = await stripe.products.create({
          name: product.name,
          description: product.description.substring(0, 500), // Stripe limit
          images: product.images.map(img => img.startsWith('http') ? img : `https://faith-shop.fr${img}`).slice(0, 8),
          metadata: {
            dbId: product.id,
            slug: product.slug || ''
          }
        })
        stripeProductId = stripeProduct.id
        console.log(`  -> Created Stripe Product: ${stripeProductId}`)
      } else {
        console.log(`  -> Already has Stripe ID: ${stripeProductId}`)
        // Optional: Update product in Stripe
      }

      // 2. Create Price if needed
      if (!stripePriceId && stripeProductId) {
        const price = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: Math.round(Number(product.price) * 100), // cents
          currency: 'eur',
        })
        stripePriceId = price.id
        console.log(`  -> Created Stripe Price: ${stripePriceId}`)
      }

      // 3. Update DB
      if (product.stripeProductId !== stripeProductId || product.stripePriceId !== stripePriceId) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            stripeProductId,
            stripePriceId
          }
        })
        console.log(`  -> Updated DB record`)
      }

    } catch (error) {
      console.error(`  -> Error syncing ${product.name}:`, error)
    }
  }

  console.log('Sync finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
