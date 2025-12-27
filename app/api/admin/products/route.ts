import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        variants: true,
        collections: {
          include: { collection: true }
        },
        videos: true,
        variantAttributes: true
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      price,
      comparePrice,
      sku,
      isActive,
      isFeatured,
      productType,
      printProvider,
      stock,
      trackQuantity,
      lowStockThreshold,
      images,
      videos,
      hasVariants,
      variantAttributes,
      variants,
      collections,
      tags,
      metaTitle,
      metaDescription,
      slug
    } = body

    // Create product in Stripe first
    let stripeProductId: string | undefined
    let stripePriceId: string | undefined

    try {
      // Create Stripe product
      const stripeProduct = await stripe.products.create({
        name,
        description: description || undefined,
        active: isActive,
        images: images.slice(0, 8), // Stripe allows max 8 images
        metadata: {
          source: 'faith-shop-admin',
          productType
        }
      })
      stripeProductId = stripeProduct.id

      // Create Stripe price (only if no variants, or base price)
      if (!hasVariants && price > 0) {
        const stripePrice = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: Math.round(price * 100), // Convert to cents
          currency: 'eur',
          metadata: {
            source: 'faith-shop-admin'
          }
        })
        stripePriceId = stripePrice.id
      }
    } catch (stripeError) {
      console.error('Stripe sync error:', stripeError)
      // Continue without Stripe sync
    }

    // Create product in database
    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price,
        images,
        stock: hasVariants ? 0 : (stock || 0),
        isActive,
        isFeatured,
        sku,
        productType,
        printProvider,
        trackQuantity,
        lowStockThreshold,
        hasVariants,
        tags,
        metaTitle,
        metaDescription,
        slug,
        stripeProductId,
        stripePriceId,
        // Create variant attributes
        variantAttributes: hasVariants && variantAttributes?.length > 0 ? {
          create: variantAttributes.map((attr: any, index: number) => ({
            name: attr.name,
            values: attr.values,
            sortOrder: index
          }))
        } : undefined,
        // Create product videos
        videos: videos?.length > 0 ? {
          create: videos.map((video: any, index: number) => ({
            type: video.type,
            url: video.url,
            thumbnail: video.thumbnail,
            title: video.title,
            sortOrder: index
          }))
        } : undefined,
        // Create collection associations
        collections: collections?.length > 0 ? {
          create: collections.map((collectionId: string, index: number) => ({
            collectionId,
            sortOrder: index
          }))
        } : undefined
      },
      include: {
        variants: true,
        collections: true,
        videos: true,
        variantAttributes: true
      }
    })

    // Create variants if applicable
    if (hasVariants && variants?.length > 0) {
      for (const variant of variants) {
        let variantStripePriceId: string | undefined

        // Create Stripe price for variant
        if (stripeProductId && variant.price > 0) {
          try {
            const stripeVariantPrice = await stripe.prices.create({
              product: stripeProductId,
              unit_amount: Math.round(variant.price * 100),
              currency: 'eur',
              metadata: {
                variantTitle: variant.title,
                variantSku: variant.sku,
                source: 'faith-shop-admin'
              }
            })
            variantStripePriceId = stripeVariantPrice.id
          } catch (error) {
            console.error('Error creating variant price in Stripe:', error)
          }
        }

        await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: variant.sku,
            title: variant.title,
            color: variant.attributes?.color || variant.attributes?.Couleur,
            size: variant.attributes?.size || variant.attributes?.Taille,
            material: variant.attributes?.material || variant.attributes?.Tissu,
            style: variant.attributes?.style || variant.attributes?.Style,
            customAttributes: JSON.stringify(variant.attributes),
            price: variant.price,
            comparePrice: variant.comparePrice,
            stock: variant.stock || 0,
            images: variant.images || [],
            stripePriceId: variantStripePriceId,
            isActive: true,
            sortOrder: variants.indexOf(variant)
          }
        })
      }

      // Update total stock
      const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: totalStock }
      })
    }

    // Fetch complete product
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        variants: true,
        collections: { include: { collection: true } },
        videos: true,
        variantAttributes: true
      }
    })

    return NextResponse.json(completeProduct, { status: 201 })
  } catch (error: any) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du produit' },
      { status: 500 }
    )
  }
}
