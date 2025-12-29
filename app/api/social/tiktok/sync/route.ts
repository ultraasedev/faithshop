import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const TIKTOK_APP_KEY = process.env.TIKTOK_APP_KEY
const TIKTOK_APP_SECRET = process.env.TIKTOK_APP_SECRET

// Generate TikTok API signature
function generateSignature(path: string, params: Record<string, string>, secret: string): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}${params[key]}`)
    .join('')

  const signString = `${secret}${path}${sortedParams}${secret}`
  return crypto.createHmac('sha256', secret).update(signString).digest('hex')
}

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Get TikTok connection
    const connection = await prisma.socialConnection.findUnique({
      where: { provider: 'tiktok_shop' }
    })

    if (!connection || !connection.isActive) {
      return NextResponse.json({ error: 'TikTok Shop non connecté' }, { status: 400 })
    }

    if (!connection.shopId) {
      return NextResponse.json({
        error: 'Aucune boutique configurée',
        message: 'Veuillez reconnecter votre TikTok Shop'
      }, { status: 400 })
    }

    // Get all active products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        collections: {
          include: { collection: true }
        },
        variants: true
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
              provider: 'tiktok_shop'
            }
          }
        })

        // Build product data for TikTok Shop
        const productData = {
          product_name: product.name,
          description: product.description,
          category_id: '0', // Will need proper category mapping
          brand_id: '',
          images: product.images.map(url => ({ url })),
          package_weight: product.weight ? product.weight.toString() : '0.5',
          skus: product.variants.length > 0
            ? product.variants.map(v => ({
                outer_sku_id: v.sku || v.id,
                original_price: v.price.toString(),
                stock_infos: [{
                  warehouse_id: 'default',
                  available_stock: v.stock
                }]
              }))
            : [{
                outer_sku_id: product.sku || product.id,
                original_price: product.price.toString(),
                stock_infos: [{
                  warehouse_id: 'default',
                  available_stock: product.stock
                }]
              }]
        }

        const path = existingSync
          ? '/api/products/edit'
          : '/api/products'

        const timestamp = Math.floor(Date.now() / 1000).toString()
        const params: Record<string, string> = {
          app_key: TIKTOK_APP_KEY!,
          timestamp,
          access_token: connection.accessToken,
          shop_id: connection.shopId
        }

        if (existingSync) {
          params.product_id = existingSync.externalId
        }

        const sign = generateSignature(path, params, TIKTOK_APP_SECRET!)

        const apiUrl = new URL(`https://open-api.tiktokglobalshop.com${path}`)
        apiUrl.searchParams.set('app_key', TIKTOK_APP_KEY!)
        apiUrl.searchParams.set('sign', sign)
        apiUrl.searchParams.set('timestamp', timestamp)
        apiUrl.searchParams.set('access_token', connection.accessToken)
        apiUrl.searchParams.set('shop_id', connection.shopId)

        const response = await fetch(apiUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })

        const result = await response.json()

        if (result.code !== 0) {
          throw new Error(result.message || 'Erreur API TikTok')
        }

        const externalId = result.data?.product_id || existingSync?.externalId || product.id

        // Update sync record
        await prisma.socialProductSync.upsert({
          where: {
            productId_provider: {
              productId: product.id,
              provider: 'tiktok_shop'
            }
          },
          update: {
            externalId,
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
            errorMessage: null
          },
          create: {
            productId: product.id,
            provider: 'tiktok_shop',
            externalId,
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
              provider: 'tiktok_shop'
            }
          },
          update: {
            syncStatus: 'error',
            errorMessage
          },
          create: {
            productId: product.id,
            provider: 'tiktok_shop',
            externalId: product.id,
            syncStatus: 'error',
            errorMessage
          }
        })
      }
    }

    // Update connection last sync time
    await prisma.socialConnection.update({
      where: { provider: 'tiktok_shop' },
      data: { lastSyncAt: new Date() }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'a synchronisé les produits vers TikTok Shop',
        details: `${synced} synchronisés, ${errors} erreurs`,
        resource: 'integration',
        resourceId: 'tiktok_shop'
      }
    })

    return NextResponse.json({
      success: true,
      synced,
      errors,
      syncErrors: syncErrors.slice(0, 5)
    })
  } catch (error) {
    console.error('TikTok sync error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
