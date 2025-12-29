import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Get Meta connection
    const connection = await prisma.socialConnection.findUnique({
      where: { provider: 'meta' }
    })

    if (!connection || !connection.isActive) {
      return NextResponse.json({ error: 'Meta non connecté' }, { status: 400 })
    }

    if (!connection.catalogId) {
      return NextResponse.json({
        error: 'Aucun catalogue configuré',
        message: 'Veuillez créer un catalogue dans Meta Commerce Manager'
      }, { status: 400 })
    }

    // Get all active products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        collections: {
          include: { collection: true }
        }
      }
    })

    let synced = 0
    let errors = 0
    const syncErrors: string[] = []

    for (const product of products) {
      try {
        // Check if product already synced
        const existingSync = await prisma.socialProductSync.findUnique({
          where: {
            productId_provider: {
              productId: product.id,
              provider: 'meta'
            }
          }
        })

        // Build product data for Meta Catalog
        const productData = {
          retailer_id: product.id,
          name: product.name,
          description: product.description,
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://faith-shop.fr'}/products/${product.slug}`,
          image_url: product.images[0] || '',
          price: `${product.price.toNumber()} EUR`,
          availability: product.stock > 0 ? 'in stock' : 'out of stock',
          condition: 'new',
          brand: product.brand || 'Faith Shop',
          category: product.collections[0]?.collection.name || 'Vêtements'
        }

        // Sync to Meta Catalog API
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${connection.catalogId}/products`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: connection.accessToken,
              requests: [{
                method: existingSync ? 'UPDATE' : 'CREATE',
                retailer_id: product.id,
                data: productData
              }]
            })
          }
        )

        const result = await response.json()

        if (result.error) {
          throw new Error(result.error.message)
        }

        // Update sync record
        await prisma.socialProductSync.upsert({
          where: {
            productId_provider: {
              productId: product.id,
              provider: 'meta'
            }
          },
          update: {
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
            errorMessage: null
          },
          create: {
            productId: product.id,
            provider: 'meta',
            externalId: product.id, // Meta uses retailer_id
            syncStatus: 'synced',
            lastSyncedAt: new Date()
          }
        })

        synced++
      } catch (error) {
        errors++
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
        syncErrors.push(`${product.name}: ${errorMessage}`)

        // Update sync record with error
        await prisma.socialProductSync.upsert({
          where: {
            productId_provider: {
              productId: product.id,
              provider: 'meta'
            }
          },
          update: {
            syncStatus: 'error',
            errorMessage
          },
          create: {
            productId: product.id,
            provider: 'meta',
            externalId: product.id,
            syncStatus: 'error',
            errorMessage
          }
        })
      }
    }

    // Update connection last sync time
    await prisma.socialConnection.update({
      where: { provider: 'meta' },
      data: { lastSyncAt: new Date() }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'a synchronisé les produits vers Meta',
        details: `${synced} synchronisés, ${errors} erreurs`,
        resource: 'integration',
        resourceId: 'meta'
      }
    })

    return NextResponse.json({
      success: true,
      synced,
      errors,
      syncErrors: syncErrors.slice(0, 5) // Return first 5 errors
    })
  } catch (error) {
    console.error('Meta sync error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
