#!/usr/bin/env tsx

import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

async function forceStripeSync() {
  console.log('🔄 Synchronisation forcée depuis Stripe...\n')

  try {
    // Récupérer tous les produits locaux avec Stripe ID
    const localProducts = await prisma.product.findMany({
      where: {
        stripeProductId: { not: null },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        stripeProductId: true,
        images: true,
        price: true
      }
    })

    console.log(`📦 ${localProducts.length} produits à synchroniser...\n`)

    let updatedCount = 0

    for (const localProduct of localProducts) {
      try {
        console.log(`🔍 Sync: ${localProduct.name}`)

        // Récupérer le produit depuis Stripe
        const stripeProduct = await stripe.products.retrieve(localProduct.stripeProductId!)

        // Préparer les données de mise à jour
        const updateData: any = {
          name: stripeProduct.name,
          description: stripeProduct.description || undefined,
          isActive: stripeProduct.active
        }

        // Gérer les images (préserver les vidéos locales)
        if (stripeProduct.images && stripeProduct.images.length > 0) {
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
          const stripeImages = stripeProduct.images.filter(url =>
            imageExtensions.some(ext => url.toLowerCase().includes(ext))
          )

          // Conserver les vidéos existantes
          const existingVideos = localProduct.images.filter(url =>
            !imageExtensions.some(ext => url.toLowerCase().includes(ext))
          )

          const newImages = [...stripeImages, ...existingVideos]

          // Vérifier si les images ont changé
          const imagesChanged = JSON.stringify(localProduct.images.sort()) !== JSON.stringify(newImages.sort())

          if (imagesChanged) {
            updateData.images = newImages
            console.log(`   📸 Images mises à jour: ${stripeImages.length} nouvelles images`)
          }
        }

        // Vérifier le prix
        const stripePrices = await stripe.prices.list({
          product: localProduct.stripeProductId!,
          active: true,
          limit: 1
        })

        if (stripePrices.data[0]) {
          const stripePrice = stripePrices.data[0].unit_amount ? stripePrices.data[0].unit_amount / 100 : 0
          const localPriceNum = Number(localProduct.price)

          if (Math.abs(localPriceNum - stripePrice) > 0.01) {
            updateData.price = stripePrice
            console.log(`   💰 Prix mis à jour: ${localPriceNum}€ → ${stripePrice}€`)
          }
        }

        // Mettre à jour si des changements sont détectés
        if (Object.keys(updateData).length > 3) { // Plus que name, description, isActive
          await prisma.product.update({
            where: { id: localProduct.id },
            data: updateData
          })

          updatedCount++
          console.log(`   ✅ Produit synchronisé`)
        } else {
          console.log(`   ⚪ Aucun changement détecté`)
        }

      } catch (error) {
        console.error(`   ❌ Erreur pour ${localProduct.name}:`, error)
      }

      console.log('') // Ligne vide
    }

    console.log(`🎉 Synchronisation terminée!`)
    console.log(`📊 ${updatedCount}/${localProducts.length} produits mis à jour`)

    // Afficher un résumé des images
    console.log('\n📸 Résumé des médias:')
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: { name: true, images: true }
    })

    let totalImages = 0
    let totalVideos = 0

    allProducts.forEach(product => {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      const images = product.images.filter(url =>
        imageExtensions.some(ext => url.toLowerCase().includes(ext))
      )
      const videos = product.images.filter(url =>
        !imageExtensions.some(ext => url.toLowerCase().includes(ext))
      )

      totalImages += images.length
      totalVideos += videos.length
    })

    console.log(`   🖼️  Total images: ${totalImages}`)
    console.log(`   🎬 Total vidéos: ${totalVideos}`)

  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  forceStripeSync()
    .then(() => {
      console.log('\n✅ Script terminé avec succès')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script échoué:', error)
      process.exit(1)
    })
}