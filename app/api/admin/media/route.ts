import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put, del } from '@vercel/blob'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder')

    const media = await prisma.media.findMany({
      where: folder ? { folder } : undefined,
      orderBy: { createdAt: 'desc' }
    })

    // Get folder stats
    const folders = await prisma.media.groupBy({
      by: ['folder'],
      _count: { id: true },
      _sum: { size: true }
    })

    return NextResponse.json({
      success: true,
      media,
      folders: folders.map(f => ({
        name: f.folder || 'Non classé',
        count: f._count.id,
        size: f._sum.size || 0
      }))
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'
    const alt = formData.get('alt') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 })
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10MB)' }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
      access: 'public',
    })

    // Save to database
    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url: blob.url,
        mimeType: file.type,
        size: file.size,
        folder,
        alt
      }
    })

    return NextResponse.json({
      success: true,
      media,
      message: 'Fichier uploadé avec succès'
    })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) {
      return NextResponse.json({ error: 'Média non trouvé' }, { status: 404 })
    }

    // Delete from Vercel Blob
    try {
      await del(media.url)
    } catch (e) {
      console.error('Error deleting from blob:', e)
    }

    // Delete from database
    await prisma.media.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Média supprimé' })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
