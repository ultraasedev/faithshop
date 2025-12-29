import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

const META_APP_ID = process.env.META_APP_ID
const META_APP_SECRET = process.env.META_APP_SECRET
const META_REDIRECT_URI = process.env.META_REDIRECT_URI || 'https://faith-shop.fr/api/social/meta/callback'

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
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      console.error('Meta OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        new URL(`/admin/integrations?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/integrations?error=Code%20manquant', request.url)
      )
    }

    // Validate state token
    const cookieStore = await cookies()
    const storedState = cookieStore.get('meta_oauth_state')?.value

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/admin/integrations?error=État%20invalide%20(CSRF)', request.url)
      )
    }

    // Clear state cookie
    cookieStore.delete('meta_oauth_state')

    // Exchange code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id', META_APP_ID!)
    tokenUrl.searchParams.set('client_secret', META_APP_SECRET!)
    tokenUrl.searchParams.set('redirect_uri', META_REDIRECT_URI)
    tokenUrl.searchParams.set('code', code)

    const tokenResponse = await fetch(tokenUrl.toString())
    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('Meta token error:', tokenData.error)
      return NextResponse.redirect(
        new URL(`/admin/integrations?error=${encodeURIComponent(tokenData.error.message || 'Erreur token')}`, request.url)
      )
    }

    const { access_token, expires_in } = tokenData

    // Exchange for long-lived token (60 days instead of ~2 hours)
    const longLivedUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token')
    longLivedUrl.searchParams.set('client_id', META_APP_ID!)
    longLivedUrl.searchParams.set('client_secret', META_APP_SECRET!)
    longLivedUrl.searchParams.set('fb_exchange_token', access_token)

    const longLivedResponse = await fetch(longLivedUrl.toString())
    const longLivedData = await longLivedResponse.json()

    const finalToken = longLivedData.access_token || access_token
    const expiresIn = longLivedData.expires_in || expires_in

    // Get user info and pages
    const meResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${finalToken}`
    )
    const meData = await meResponse.json()

    // Get Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${finalToken}`
    )
    const pagesData = await pagesResponse.json()

    // Get catalogs
    const businessesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/businesses?access_token=${finalToken}`
    )
    const businessesData = await businessesResponse.json()

    let catalogId: string | null = null
    let pageId: string | null = null
    let pageAccessToken: string | null = null

    // Get first page info
    if (pagesData.data && pagesData.data.length > 0) {
      pageId = pagesData.data[0].id
      pageAccessToken = pagesData.data[0].access_token
    }

    // Try to get catalog from first business
    if (businessesData.data && businessesData.data.length > 0) {
      const businessId = businessesData.data[0].id
      const catalogsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${businessId}/owned_product_catalogs?access_token=${finalToken}`
      )
      const catalogsData = await catalogsResponse.json()

      if (catalogsData.data && catalogsData.data.length > 0) {
        catalogId = catalogsData.data[0].id
      }
    }

    // Calculate expiration date
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // Default 60 days

    // Store or update connection
    await prisma.socialConnection.upsert({
      where: { provider: 'meta' },
      update: {
        accessToken: pageAccessToken || finalToken,
        refreshToken: finalToken, // Store user token as refresh
        expiresAt,
        accountId: meData.id,
        accountName: meData.name,
        pageId,
        catalogId,
        isActive: true,
        config: JSON.stringify({
          userId: meData.id,
          userName: meData.name,
          pages: pagesData.data || [],
          businesses: businessesData.data || []
        })
      },
      create: {
        provider: 'meta',
        accessToken: pageAccessToken || finalToken,
        refreshToken: finalToken,
        expiresAt,
        accountId: meData.id,
        accountName: meData.name,
        pageId,
        catalogId,
        isActive: true,
        syncEnabled: true,
        config: JSON.stringify({
          userId: meData.id,
          userName: meData.name,
          pages: pagesData.data || [],
          businesses: businessesData.data || []
        })
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'a connecté Meta (Facebook/Instagram)',
        details: `Compte: ${meData.name}`,
        resource: 'integration',
        resourceId: 'meta'
      }
    })

    return NextResponse.redirect(new URL('/admin/integrations?success=meta', request.url))
  } catch (error) {
    console.error('Meta OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/admin/integrations?error=Erreur%20lors%20de%20la%20connexion', request.url)
    )
  }
}
