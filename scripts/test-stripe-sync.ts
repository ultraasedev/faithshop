#!/usr/bin/env tsx

import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

async function testStripeSync() {
  try {
    console.log('🔄 Test de synchronisation Stripe bi-directionnelle...\n')

    // Test 1: Vérifier les produits existants
    console.log('1️⃣ Vérification des produits synchronisés:')
    const localProducts = await prisma.product.findMany({
      where: { stripeProductId: { not: null } },
      select: { id: true, name: true, stripeProductId: true, price: true }
    })

    console.log(`   📦 ${localProducts.length} produits locaux avec Stripe ID`)

    for (const product of localProducts.slice(0, 3)) {
      try {
        const stripeProduct = await stripe.products.retrieve(product.stripeProductId!)
        const stripePrices = await stripe.prices.list({
          product: product.stripeProductId!,
          active: true,
          limit: 1
        })

        const stripePrice = stripePrices.data[0]?.unit_amount ? stripePrices.data[0].unit_amount / 100 : 0

        console.log(`   ✅ ${product.name}:`)
        console.log(`      Local: ${product.price}€ | Stripe: ${stripePrice}€`)

        if (Math.abs(Number(product.price) - stripePrice) > 0.01) {
          console.log(`      ⚠️  Prix différents détectés!`)
        }
      } catch (error) {
        console.log(`   ❌ Erreur produit ${product.name}: ${error}`)
      }
    }

    // Test 2: Vérifier la configuration webhook
    console.log('\n2️⃣ Vérification de la configuration webhook:')
    try {
      const webhookEndpoints = await stripe.webhookEndpoints.list()
      const ourWebhook = webhookEndpoints.data.find(wh =>
        wh.url.includes('webhook/stripe') || wh.url.includes(process.env.VERCEL_URL || '')
      )

      if (ourWebhook) {
        console.log(`   ✅ Webhook trouvé: ${ourWebhook.url}`)
        console.log(`   📋 Événements écoutés:`, ourWebhook.enabled_events.slice(0, 5))

        const requiredEvents = ['product.updated', 'product.deleted', 'price.updated', 'payment_intent.succeeded']
        const missingEvents = requiredEvents.filter(event =>
          !ourWebhook.enabled_events.includes(event)
        )

        if (missingEvents.length > 0) {
          console.log(`   ⚠️  Événements manquants:`, missingEvents)
        } else {
          console.log(`   ✅ Tous les événements requis sont configurés`)
        }
      } else {
        console.log(`   ❌ Aucun webhook configuré pour ce site`)
      }
    } catch (error) {
      console.log(`   ❌ Erreur webhook: ${error}`)
    }

    // Test 3: Simuler une mise à jour depuis Stripe
    console.log('\n3️⃣ Test de mise à jour depuis Stripe:')
    const testProduct = localProducts[0]
    if (testProduct) {
      try {
        // Récupérer le produit Stripe
        const stripeProduct = await stripe.products.retrieve(testProduct.stripeProductId!)

        console.log(`   📝 Produit test: ${testProduct.name}`)
        console.log(`   🔗 Stripe ID: ${testProduct.stripeProductId}`)
        console.log(`   💰 Prix actuel: ${testProduct.price}€`)

        // Afficher les images/vidéos
        if (stripeProduct.images && stripeProduct.images.length > 0) {
          const imageCount = stripeProduct.images.filter(url =>
            ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => url.toLowerCase().includes(ext))
          ).length
          console.log(`   🖼️  Images Stripe: ${imageCount}`)
        }

        // Vérifier les images locales (incluant vidéos)
        const localProductFull = await prisma.product.findUnique({
          where: { id: testProduct.id },
          select: { images: true }
        })

        if (localProductFull?.images) {
          const videoCount = localProductFull.images.filter(url =>
            ['.mp4', '.avi', '.mov', '.mkv'].some(ext => url.toLowerCase().includes(ext))
          ).length
          console.log(`   🎬 Vidéos locales: ${videoCount}`)
        }

      } catch (error) {
        console.log(`   ❌ Erreur test: ${error}`)
      }
    }

    console.log('\n✅ Test de synchronisation terminé!')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

if (require.main === module) {
  testStripeSync()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}