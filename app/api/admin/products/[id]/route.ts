import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        collections: {
          include: { collection: true }
        },
        videos: true,
        variants: true,
        variantAttributes: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    // Delete existing relations first
    await Promise.all([
      prisma.productCollection.deleteMany({ where: { productId: id } }),
      prisma.productVideo.deleteMany({ where: { productId: id } }),
      prisma.variantAttribute.deleteMany({ where: { productId: id } }),
    ])

    // Safely parse numeric values
    const price = typeof data.price === 'string' ? parseFloat(data.price) : data.price
    const stock = typeof data.stock === 'string' ? parseInt(data.stock) : (data.stock || 0)
    const lowStockThreshold = typeof data.lowStockThreshold === 'string' ? parseInt(data.lowStockThreshold) : (data.lowStockThreshold || 5)

    // Mise à jour dans la base de données locale
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || '',
        price,
        sku: data.sku || null,
        images: data.images || [],
        colors: data.colors || [],
        sizes: data.sizes || [],
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        stock,
        trackQuantity: data.trackQuantity ?? true,
        lowStockThreshold,
        productType: data.productType || 'IN_STOCK',
        printProvider: data.printProvider,
        tags: data.tags || [],
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        slug: data.slug,
        hasVariants: data.hasVariants ?? false,
        // Recreate collection associations
        collections: data.collections?.length > 0 ? {
          create: data.collections.map((collectionId: string, index: number) => ({
            collectionId,
            sortOrder: index
          }))
        } : undefined,
        // Recreate videos
        videos: data.videos?.length > 0 ? {
          create: data.videos.map((video: any, index: number) => ({
            type: video.type,
            url: video.url,
            thumbnail: video.thumbnail,
            title: video.title,
            sortOrder: index
          }))
        } : undefined,
        // Recreate variant attributes
        variantAttributes: data.variantAttributes?.length > 0 ? {
          create: data.variantAttributes.map((attr: any, index: number) => ({
            name: attr.name,
            values: attr.values,
            sortOrder: index
          }))
        } : undefined
      },
      include: {
        collections: { include: { collection: true } },
        videos: true,
        variants: true,
        variantAttributes: true
      }
    })

    // Synchronisation avec Stripe
    if (updatedProduct.stripeProductId) {
      try {
        await stripe.products.update(updatedProduct.stripeProductId, {
          name: data.name,
          description: data.description || '',
          images: data.images?.slice(0, 8) || [],
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
              where: { id },
              data: { stripePriceId: newPrice.id }
            })
          }
        }
      } catch (stripeError) {
        console.error('Erreur synchronisation Stripe:', stripeError)
      }
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Produit mis à jour avec succès'
    })

  } catch (error: any) {
    console.error('Product update error:', error?.message || error)

    // Specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json({
        error: 'Un produit avec ce SKU ou slug existe déjà'
      }, { status: 400 })
    }

    if (error.code === 'P2025') {
      return NextResponse.json({
        error: 'Produit non trouvé'
      }, { status: 404 })
    }

    return NextResponse.json({
      error: error.message || 'Erreur serveur lors de la mise à jour'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    // Delete product collections first
    await prisma.productCollection.deleteMany({
      where: { productId: id }
    })

    // Get product to check for Stripe ID
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    // Archive in Stripe if exists
    if (product.stripeProductId) {
      try {
        await stripe.products.update(product.stripeProductId, {
          active: false
        })
      } catch (stripeError) {
        console.error('Erreur archivage Stripe:', stripeError)
      }
    }

    // Delete product
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error)
    return NextResponse.json({
      error: 'Erreur serveur lors de la suppression'
    }, { status: 500 })
  }
}