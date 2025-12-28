import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const page = await prisma.pageContent.findUnique({
      where: { id }
    })

    if (!page) {
      return NextResponse.json({ error: 'Page non trouvée' }, { status: 404 })
    }

    // Transform to expected format
    return NextResponse.json({
      ...page,
      status: page.isPublished ? 'PUBLISHED' : 'DRAFT',
      isHomepage: page.slug === 'home',
      template: null,
      versions: []
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de la page:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { content, status, metaTitle, metaDescription, title, slug } = body

    // Get current page
    const currentPage = await prisma.pageContent.findUnique({
      where: { id }
    })

    if (!currentPage) {
      return NextResponse.json({ error: 'Page non trouvée' }, { status: 404 })
    }

    // Check if slug changed and if new slug already exists
    if (slug && slug !== currentPage.slug) {
      const existingPage = await prisma.pageContent.findFirst({
        where: { slug, id: { not: id } }
      })

      if (existingPage) {
        return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 400 })
      }
    }

    // Update page
    const page = await prisma.pageContent.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(status && { isPublished: status === 'PUBLISHED' }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(content && { content: typeof content === 'string' ? content : JSON.stringify(content) }),
        updatedAt: new Date()
      }
    })

    revalidatePath('/admin/pages')
    revalidatePath(`/admin/pages/${page.slug}/edit`)
    revalidatePath(`/${page.slug}`)

    return NextResponse.json({
      success: true,
      page: {
        ...page,
        status: page.isPublished ? 'PUBLISHED' : 'DRAFT',
        isHomepage: page.slug === 'home'
      },
      message: status === 'PUBLISHED' ? 'Page publiée' : 'Page enregistrée'
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la page:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    // Check if page is homepage
    const page = await prisma.pageContent.findUnique({ where: { id } })

    if (!page) {
      return NextResponse.json({ error: 'Page non trouvée' }, { status: 404 })
    }

    if (page.slug === 'home') {
      return NextResponse.json({ error: 'Impossible de supprimer la page d\'accueil' }, { status: 400 })
    }

    // Delete page
    await prisma.pageContent.delete({ where: { id } })

    revalidatePath('/admin/pages')

    return NextResponse.json({
      success: true,
      message: 'Page supprimée'
    })
  } catch (error) {
    console.error('Erreur lors de la suppression de la page:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
