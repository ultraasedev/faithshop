import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    const folder = searchParams.get('folder') || 'uploads'

    if (!filename) {
      return NextResponse.json(
        { error: 'Nom de fichier requis' },
        { status: 400 }
      )
    }

    if (!request.body) {
      return NextResponse.json(
        { error: 'Fichier requis' },
        { status: 400 }
      )
    }

    // Générer un nom unique pour éviter les conflits
    const timestamp = Date.now()
    const extension = filename.split('.').pop()
    const uniqueFilename = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`

    // Upload vers Vercel Blob
    const blob = await put(uniqueFilename, request.body, {
      access: 'public',
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: uniqueFilename
    })

  } catch (error) {
    console.error('Erreur upload Vercel Blob:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'upload',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}