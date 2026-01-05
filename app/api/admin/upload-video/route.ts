import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'

// For App Router - increase timeout for video uploads
export const maxDuration = 60

// Formats vidéo acceptés
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/x-matroska', // .mkv
  'video/ogg'
]

// Taille max: 100MB (Vercel Blob Pro permet jusqu'à 500MB)
const MAX_VIDEO_SIZE = 100 * 1024 * 1024

export async function POST(request: NextRequest) {
  console.log('=== Video Upload Start ===')

  try {
    // Check authentication
    const session = await auth()
    console.log('Session:', session?.user?.email, 'Role:', session?.user?.role)

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      console.log('Auth failed - returning 401')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Check if BLOB token is configured
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    console.log('BLOB token configured:', blobToken ? 'Yes (length: ' + blobToken.length + ')' : 'NO!')

    if (!blobToken) {
      return NextResponse.json({
        error: 'Configuration error: BLOB_READ_WRITE_TOKEN is not set'
      }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'product'

    if (!file) {
      console.log('No file provided')
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
    }

    console.log('File info:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Valider le type de fichier
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      console.log('Invalid file type:', file.type)
      return NextResponse.json({
        error: 'Format non supporté. Formats acceptés: MP4, WebM, MOV, AVI, MKV, OGG'
      }, { status: 400 })
    }

    // Valider la taille
    if (file.size > MAX_VIDEO_SIZE) {
      console.log('File too large:', file.size)
      return NextResponse.json({
        error: `Le fichier est trop volumineux (max ${MAX_VIDEO_SIZE / 1024 / 1024}MB). Veuillez compresser la vidéo.`
      }, { status: 400 })
    }

    // Générer un nom de fichier unique
    const extension = file.name.split('.').pop() || 'mp4'
    const filename = `videos/${type}-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`

    console.log('Uploading to Vercel Blob:', filename)

    // Upload vers Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type
    })

    console.log('Upload successful:', blob.url)

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      type: file.type,
      thumbnail: null
    })

  } catch (error: any) {
    console.error('=== Video Upload Error ===')
    console.error('Error name:', error?.name)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)

    // Check for specific Vercel Blob errors
    const errorMessage = error?.message || ''

    if (errorMessage.includes('BLOB_READ_WRITE_TOKEN')) {
      return NextResponse.json({
        error: 'Erreur de configuration: BLOB_READ_WRITE_TOKEN invalide ou manquant',
        details: errorMessage
      }, { status: 500 })
    }

    if (errorMessage.includes('413') || errorMessage.includes('too large')) {
      return NextResponse.json({
        error: 'Fichier trop volumineux. Max 4.5MB pour les uploads via API Vercel.',
        details: errorMessage
      }, { status: 413 })
    }

    return NextResponse.json({
      error: 'Erreur lors de l\'upload',
      details: errorMessage
    }, { status: 500 })
  }
}
