import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
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

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/admin/integrations?error=Non%20autorisé', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/integrations?error=Code%20manquant', request.url)
      )
    }

    // Validate state token
    const cookieStore = await cookies()
    const storedState = cookieStore.get('tiktok_oauth_state')?.value

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/admin/integrations?error=État%20invalide%20(CSRF)', request.url)
      )
    }

    // Clear state cookie
    cookieStore.delete('tiktok_oauth_state')

    // Exchange code for access token
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const path = '/api/v2/token/get'

    const params: Record<string, string> = {
      app_key: TIKTOK_APP_KEY!,
      auth_code: code,
      grant_type: 'authorized_code',
      timestamp
    }

    const sign = generateSignature(path, params, TIKTOK_APP_SECRET!)

    const tokenUrl = new URL(`https://open-api.tiktokglobalshop.com${path}`)
    tokenUrl.searchParams.set('app_key', TIKTOK_APP_KEY!)
    tokenUrl.searchParams.set('sign', sign)
    tokenUrl.searchParams.set('timestamp', timestamp)

    const tokenResponse = await fetch(tokenUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_code: code,
        grant_type: 'authorized_code'
      })
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.code !== 0) {
      console.error('TikTok token error:', tokenData)
      return NextResponse.redirect(
        new URL(`/admin/integrations?error=${encodeURIComponent(tokenData.message || 'Erreur token')}`, request.url)
      )
    }

    const {
      access_token,
      refresh_token,
      access_token_expire_in,
      open_id,
      seller_name
    } = tokenData.data

    // Get shop info
    const shopPath = '/api/v2/seller/get'
    const shopTimestamp = Math.floor(Date.now() / 1000).toString()
    const shopParams: Record<string, string> = {
      app_key: TIKTOK_APP_KEY!,
      timestamp: shopTimestamp,
      access_token
    }
    const shopSign = generateSignature(shopPath, shopParams, TIKTOK_APP_SECRET!)

    const shopUrl = new URL(`https://open-api.tiktokglobalshop.com${shopPath}`)
    shopUrl.searchParams.set('app_key', TIKTOK_APP_KEY!)
    shopUrl.searchParams.set('sign', shopSign)
    shopUrl.searchParams.set('timestamp', shopTimestamp)
    shopUrl.searchParams.set('access_token', access_token)

    const shopResponse = await fetch(shopUrl.toString())
    const shopData = await shopResponse.json()

    let shopId: string | null = null
    let shopName = seller_name

    if (shopData.code === 0 && shopData.data) {
      shopId = shopData.data.shop_id
      shopName = shopData.data.shop_name || seller_name
    }

    // Calculate expiration date
    const expiresAt = new Date(Date.now() + access_token_expire_in * 1000)

    // Store or update connection
    await prisma.socialConnection.upsert({
      where: { provider: 'tiktok_shop' },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
        accountId: open_id,
        accountName: shopName,
        shopId,
        isActive: true,
        config: JSON.stringify({
          openId: open_id,
          sellerName: seller_name,
          shopData: shopData.data || null
        })
      },
      create: {
        provider: 'tiktok_shop',
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
        accountId: open_id,
        accountName: shopName,
        shopId,
        isActive: true,
        syncEnabled: true,
        config: JSON.stringify({
          openId: open_id,
          sellerName: seller_name,
          shopData: shopData.data || null
        })
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'a connecté TikTok Shop',
        details: `Boutique: ${shopName}`,
        resource: 'integration',
        resourceId: 'tiktok_shop'
      }
    })

    return NextResponse.redirect(new URL('/admin/integrations?success=tiktok', request.url))
  } catch (error) {
    console.error('TikTok OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/admin/integrations?error=Erreur%20lors%20de%20la%20connexion', request.url)
    )
  }
}
