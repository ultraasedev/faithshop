import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const post = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 })
    }

    // If publishing for the first time, set publishedAt
    const data: Record<string, unknown> = { ...body }
    if (body.isPublished && !existingPost.publishedAt && !body.publishedAt) {
      data.publishedAt = new Date()
    }
    if (body.publishedAt) {
      data.publishedAt = new Date(body.publishedAt)
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data,
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 })
    }

    await prisma.blogPost.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Article supprimé' })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
