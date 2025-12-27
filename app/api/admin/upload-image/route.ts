import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Check if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not configured')
      return NextResponse.json({
        error: 'Storage non configuré. Contactez l\'administrateur.'
      }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file || !type) {
      return NextResponse.json({ error: 'Fichier et type requis' }, { status: 400 })
    }

    // Valider le type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Seuls les fichiers image sont autorisés' }, { status: 400 })
    }

    // Valider la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Le fichier est trop volumineux (max 5MB)' }, { status: 400 })
    }

    // Upload vers Vercel Blob
    const filename = `images/${type}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: blob.pathname
    })

  } catch (error: any) {
    console.error('=== UPLOAD IMAGE ERROR ===')
    console.error('Error name:', error?.name)
    console.error('Error message:', error?.message)
    console.error('Error code:', error?.code)
    console.error('Error stack:', error?.stack)
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))

    // Check for common Vercel Blob errors
    if (error.message?.includes('BLOB_READ_WRITE_TOKEN') || error.message?.includes('token')) {
      return NextResponse.json({
        error: 'Token Blob invalide ou expiré. Vérifiez BLOB_READ_WRITE_TOKEN.'
      }, { status: 500 })
    }

    if (error.message?.includes('network') || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return NextResponse.json({
        error: 'Erreur réseau vers Vercel Blob.'
      }, { status: 500 })
    }

    if (error.message?.includes('size') || error.message?.includes('too large')) {
      return NextResponse.json({
        error: 'Fichier trop volumineux pour Vercel Blob.'
      }, { status: 500 })
    }

    return NextResponse.json({
      error: error.message || 'Erreur inconnue lors de l\'upload'
    }, { status: 500 })
  }
}