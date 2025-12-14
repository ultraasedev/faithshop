'use server'

import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function forceStripeSync() {
  try {
    console.log('🔄 Démarrage synchronisation manuelle depuis Stripe...')

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

    let updatedCount = 0
    const results: string[] = []

    for (const localProduct of localProducts) {
      try {
        // Récupérer le produit depuis Stripe
        const stripeProduct = await stripe.products.retrieve(localProduct.stripeProductId!)

        // Préparer les données de mise à jour
        const updateData: any = {
          name: stripeProduct.name,
          description: stripeProduct.description || undefined,
          isActive: stripeProduct.active
        }

        let hasChanges = false

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
            hasChanges = true
            results.push(`${localProduct.name}: Images mises à jour (${stripeImages.length} nouvelles)`)
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
            hasChanges = true
            results.push(`${localProduct.name}: Prix mis à jour (${localPriceNum}€ → ${stripePrice}€)`)
          }
        }

        // Vérifier le nom
        if (localProduct.name !== stripeProduct.name) {
          hasChanges = true
          results.push(`${localProduct.name}: Nom mis à jour vers "${stripeProduct.name}"`)
        }

        // Mettre à jour si des changements sont détectés
        if (hasChanges) {
          await prisma.product.update({
            where: { id: localProduct.id },
            data: updateData
          })

          updatedCount++
        }

      } catch (error) {
        console.error(`Erreur pour ${localProduct.name}:`, error)
        results.push(`${localProduct.name}: Erreur - ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      }
    }

    // Revalider les pages produits
    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath('/shop')

    console.log(`Synchronisation terminée: ${updatedCount}/${localProducts.length} produits mis à jour`)

    return {
      success: true,
      message: `Synchronisation réussie: ${updatedCount} produit(s) mis à jour`,
      details: results,
      stats: {
        total: localProducts.length,
        updated: updatedCount,
        errors: results.filter(r => r.includes('Erreur')).length
      }
    }

  } catch (error) {
    console.error('Erreur lors de la synchronisation Stripe:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur lors de la synchronisation',
      details: [],
      stats: { total: 0, updated: 0, errors: 1 }
    }
  }
}

export async function getStripeSyncStatus() {
  try {
    // Vérifier le statut de la synchronisation
    const productsWithStripe = await prisma.product.count({
      where: { stripeProductId: { not: null } }
    })

    const totalProducts = await prisma.product.count({
      where: { isActive: true }
    })

    return {
      success: true,
      productsWithStripe,
      totalProducts,
      syncPercentage: totalProducts > 0 ? Math.round((productsWithStripe / totalProducts) * 100) : 0
    }

  } catch (error) {
    return {
      success: false,
      productsWithStripe: 0,
      totalProducts: 0,
      syncPercentage: 0
    }
  }
}