import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { put } from '@vercel/blob'

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
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'product'

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
    }

    // Valider le type de fichier
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Format non supporté. Formats acceptés: MP4, WebM, MOV, AVI, MKV, OGG'
      }, { status: 400 })
    }

    // Valider la taille
    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({
        error: `Le fichier est trop volumineux (max ${MAX_VIDEO_SIZE / 1024 / 1024}MB). Veuillez compresser la vidéo.`
      }, { status: 400 })
    }

    // Générer un nom de fichier unique
    const extension = file.name.split('.').pop() || 'mp4'
    const filename = `videos/${type}-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`

    // Upload vers Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type
    })

    // Générer une URL de thumbnail (placeholder pour l'instant)
    // Dans un vrai projet, on utiliserait un service comme Mux ou Cloudinary
    const thumbnailUrl = null

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      type: file.type,
      thumbnail: thumbnailUrl
    })

  } catch (error) {
    console.error('Erreur upload vidéo:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}
