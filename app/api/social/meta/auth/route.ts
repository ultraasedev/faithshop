import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import crypto from 'crypto'
import { cookies } from 'next/headers'

// Meta OAuth configuration
const META_APP_ID = process.env.META_APP_ID
const META_REDIRECT_URI = process.env.META_REDIRECT_URI || 'https://faith-shop.fr/api/social/meta/callback'

// Permissions needed for Facebook/Instagram Commerce
const SCOPES = [
  'pages_read_engagement',
  'pages_show_list',
  'business_management',
  'catalog_management',
  'instagram_basic',
  'instagram_content_publish',
  'instagram_shopping_tag_products'
].join(',')

export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Check if Meta App ID is configured
    if (!META_APP_ID) {
      return NextResponse.json({
        error: 'Meta App non configurée',
        message: 'Veuillez configurer META_APP_ID dans les variables d\'environnement'
      }, { status: 500 })
    }

    // Generate state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex')

    // Store state in cookie for validation on callback
    const cookieStore = await cookies()
    cookieStore.set('meta_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    })

    // Build Meta OAuth URL
    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
    authUrl.searchParams.set('client_id', META_APP_ID)
    authUrl.searchParams.set('redirect_uri', META_REDIRECT_URI)
    authUrl.searchParams.set('scope', SCOPES)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('response_type', 'code')

    return NextResponse.json({ authUrl: authUrl.toString() })
  } catch (error) {
    console.error('Erreur Meta OAuth init:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
