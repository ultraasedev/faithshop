import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

async function syncProductsToStripe() {
  console.log('🔄 Synchronisation des produits avec Stripe...')

  const products = await prisma.product.findMany({
    where: { isActive: true }
  })

  console.log(`📦 ${products.length} produits trouvés dans la base`)

  for (const product of products) {
    try {
      let stripeProduct

      // Vérifier si le produit existe déjà dans Stripe
      if (product.stripeProductId) {
        try {
          stripeProduct = await stripe.products.retrieve(product.stripeProductId)
          console.log(`✅ Produit trouvé dans Stripe: ${product.name}`)
        } catch (error) {
          console.log(`❌ Produit non trouvé dans Stripe, création...`)
          stripeProduct = null
        }
      }

      // Créer le produit dans Stripe s'il n'existe pas
      if (!stripeProduct) {
        stripeProduct = await stripe.products.create({
          name: product.name,
          description: product.description,
          images: product.images.filter(img => img.startsWith('http')), // Seulement les URLs valides
          metadata: {
            productId: product.id,
            sizes: product.sizes.join(','),
            colors: product.colors.join(',')
          }
        })
        console.log(`✅ Produit créé dans Stripe: ${product.name}`)
      }

      // Créer ou mettre à jour le prix
      let stripePrice
      if (product.stripePriceId) {
        try {
          stripePrice = await stripe.prices.retrieve(product.stripePriceId)
        } catch (error) {
          stripePrice = null
        }
      }

      if (!stripePrice) {
        stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(Number(product.price) * 100), // Convertir en centimes
          currency: 'eur',
          metadata: {
            productId: product.id
          }
        })
        console.log(`💰 Prix créé dans Stripe: ${Number(product.price)}€`)
      }

      // Mettre à jour la base de données avec les IDs Stripe
      await prisma.product.update({
        where: { id: product.id },
        data: {
          stripeProductId: stripeProduct.id,
          stripePriceId: stripePrice.id
        }
      })

      console.log(`🔄 ${product.name} synchronisé avec succès`)

    } catch (error) {
      console.error(`❌ Erreur pour ${product.name}:`, error)
    }
  }

  console.log('🎉 Synchronisation terminée!')
}

syncProductsToStripe()
  .catch(console.error)
  .finally(() => prisma.$disconnect())