import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import crypto from 'crypto'
import { cookies } from 'next/headers'

// TikTok Shop OAuth configuration
const TIKTOK_APP_KEY = process.env.TIKTOK_APP_KEY
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || 'https://faith-shop.fr/api/social/tiktok/callback'

export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Check if TikTok App is configured
    if (!TIKTOK_APP_KEY) {
      return NextResponse.json({
        error: 'TikTok App non configurée',
        message: 'Veuillez configurer TIKTOK_APP_KEY dans les variables d\'environnement'
      }, { status: 500 })
    }

    // Generate state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex')

    // Store state in cookie for validation on callback
    const cookieStore = await cookies()
    cookieStore.set('tiktok_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    })

    // Build TikTok Shop OAuth URL
    // TikTok Shop uses a different OAuth endpoint than regular TikTok
    const authUrl = new URL('https://auth.tiktok-shops.com/oauth/authorize')
    authUrl.searchParams.set('app_key', TIKTOK_APP_KEY)
    authUrl.searchParams.set('redirect_uri', TIKTOK_REDIRECT_URI)
    authUrl.searchParams.set('state', state)

    return NextResponse.json({ authUrl: authUrl.toString() })
  } catch (error) {
    console.error('Erreur TikTok OAuth init:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
