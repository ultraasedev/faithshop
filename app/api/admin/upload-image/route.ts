import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
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
    const filename = `${type}-${Date.now()}-${file.name}`
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: blob.pathname
    })

  } catch (error) {
    console.error('Erreur upload image:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}