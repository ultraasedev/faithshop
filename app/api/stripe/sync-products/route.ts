import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

// Cette route synchronise les produits avec Stripe
// Appelez GET /api/stripe/sync-products après avoir créé des produits
export async function GET() {
  try {
    console.log('🔄 Synchronisation des produits avec Stripe...')

    // Récupérer tous les produits qui n'ont pas encore d'ID Stripe
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { stripeProductId: null },
          { stripePriceId: null },
        ],
      },
    })

    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tous les produits sont déjà synchronisés avec Stripe',
        synced: 0,
      })
    }

    let synced = 0

    for (const product of products) {
      try {
        // Créer le produit dans Stripe
        const stripeProduct = await stripe.products.create({
          name: product.name,
          description: product.description,
          images: product.images.filter(img => img.startsWith('http')), // Stripe n'accepte que les URLs absolues
          metadata: {
            productId: product.id,
            slug: product.slug || '',
          },
        })

        // Créer le prix dans Stripe (en centimes)
        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(Number(product.price) * 100),
          currency: 'eur',
          metadata: {
            productId: product.id,
          },
        })

        // Mettre à jour le produit avec les IDs Stripe
        await prisma.product.update({
          where: { id: product.id },
          data: {
            stripeProductId: stripeProduct.id,
            stripePriceId: stripePrice.id,
          },
        })

        console.log(`✅ Produit synchronisé: ${product.name}`)
        synced++
      } catch (productError) {
        console.error(`❌ Erreur pour ${product.name}:`, productError)
      }
    }

    console.log(`🎉 Synchronisation terminée: ${synced}/${products.length} produits`)

    return NextResponse.json({
      success: true,
      message: `${synced} produits synchronisés avec Stripe`,
      synced,
      total: products.length,
    })
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
