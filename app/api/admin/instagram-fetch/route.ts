import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { url } = await request.json()

    if (!url || !url.includes('instagram.com')) {
      return NextResponse.json({ error: 'URL Instagram invalide' }, { status: 400 })
    }

    // Try to fetch the Instagram page and extract og:image
    const imageUrl = await extractInstagramImage(url)

    if (!imageUrl) {
      return NextResponse.json({
        error: 'Impossible de récupérer l\'image. Essayez de télécharger l\'image manuellement.'
      }, { status: 422 })
    }

    // Download the image
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FaithShopBot/1.0)',
      }
    })

    if (!imageResponse.ok) {
      return NextResponse.json({
        error: 'Impossible de télécharger l\'image Instagram'
      }, { status: 422 })
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const imageBuffer = await imageResponse.arrayBuffer()

    // Upload to Vercel Blob for permanent storage
    const filename = `instagram/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
    const blob = await put(filename, imageBuffer, {
      access: 'public',
      contentType,
    })

    return NextResponse.json({
      success: true,
      imageUrl: blob.url
    })
  } catch (error) {
    console.error('Instagram fetch error:', error)
    return NextResponse.json({
      error: 'Erreur lors de la récupération de l\'image Instagram'
    }, { status: 500 })
  }
}

async function extractInstagramImage(postUrl: string): Promise<string | null> {
  try {
    // Method 1: Try Instagram oEmbed (public, no token needed for thumbnail)
    const oembedUrl = `https://www.instagram.com/p/${extractShortcode(postUrl)}/media/?size=l`
    const oembedRes = await fetch(oembedUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    })

    // If we get redirected to the actual image
    if (oembedRes.ok && oembedRes.headers.get('content-type')?.startsWith('image/')) {
      return oembedRes.url
    }

    // Method 2: Fetch the page HTML and extract og:image
    const pageRes = await fetch(postUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      }
    })

    if (!pageRes.ok) return null

    const html = await pageRes.text()

    // Extract og:image from meta tags
    const ogImageMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i)
      || html.match(/content="([^"]+)"\s+(?:property|name)="og:image"/i)

    if (ogImageMatch?.[1]) {
      return ogImageMatch[1].replace(/&amp;/g, '&')
    }

    return null
  } catch {
    return null
  }
}

function extractShortcode(url: string): string {
  // Extract shortcode from URLs like:
  // https://www.instagram.com/p/ABC123/
  // https://www.instagram.com/reel/ABC123/
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)
  return match?.[1] || ''
}
