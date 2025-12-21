import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const data = await request.json()

    // Mise à jour dans la base de données locale
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        images: data.images || [],
        colors: data.colors || [],
        sizes: data.sizes || [],
        isActive: data.isActive ?? true,
        stock: data.stock || 0
      }
    })

    // Synchronisation avec Stripe
    if (updatedProduct.stripeProductId) {
      try {
        await stripe.products.update(updatedProduct.stripeProductId, {
          name: data.name,
          description: data.description,
          images: data.images?.slice(0, 8) || [], // Stripe limite à 8 images
          active: data.isActive ?? true
        })

        // Gestion du prix si changé
        if (updatedProduct.stripePriceId) {
          const oldPrice = await stripe.prices.retrieve(updatedProduct.stripePriceId)
          if (oldPrice.unit_amount !== Math.round(data.price * 100)) {
            const newPrice = await stripe.prices.create({
              product: updatedProduct.stripeProductId,
              unit_amount: Math.round(data.price * 100),
              currency: 'eur',
            })

            await prisma.product.update({
              where: { id: params.id },
              data: { stripePriceId: newPrice.id }
            })
          }
        }
      } catch (stripeError) {
        console.error('Erreur synchronisation Stripe:', stripeError)
        // On continue même si Stripe échoue
      }
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Produit mis à jour et synchronisé avec Stripe'
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error)
    return NextResponse.json({
      error: 'Erreur serveur lors de la mise à jour'
    }, { status: 500 })
  }
}