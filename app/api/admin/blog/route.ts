import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const [posts, count] = await Promise.all([
      prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.blogPost.count(),
    ])

    return NextResponse.json({ posts, count })
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      author,
      category,
      tags,
      isPublished,
      isFeatured,
      publishedAt,
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 })
    }

    const finalSlug = slug || generateSlug(title)

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findFirst({
      where: { slug: finalSlug },
    })

    if (existingPost) {
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 400 })
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: finalSlug,
        excerpt: excerpt || null,
        content: content || '',
        coverImage: coverImage || null,
        author: author || null,
        category: category || null,
        tags: tags || [],
        isPublished: isPublished ?? false,
        isFeatured: isFeatured ?? false,
        publishedAt: isPublished ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
