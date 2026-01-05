import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

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

// Taille max: 500MB (Vercel Blob limite)
const MAX_VIDEO_SIZE = 500 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json() as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate file extension
        const extension = pathname.split('.').pop()?.toLowerCase()
        const validExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'ogg']

        if (!extension || !validExtensions.includes(extension)) {
          throw new Error('Format non supporté. Formats acceptés: MP4, WebM, MOV, AVI, MKV, OGG')
        }

        return {
          allowedContentTypes: ALLOWED_VIDEO_TYPES,
          maximumSizeInBytes: MAX_VIDEO_SIZE,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            uploadedAt: new Date().toISOString(),
          }),
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Video upload completed:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error: any) {
    console.error('Video upload error:', error)
    return NextResponse.json({
      error: error?.message || 'Erreur lors de l\'upload',
    }, { status: 400 })
  }
}
