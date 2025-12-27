import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
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

    const {
      name,
      description,
      slug,
      image,
      isActive,
      isFeatured,
      sortOrder,
      metaTitle,
      metaDescription,
      productIds
    } = body

    // Check if slug is unique (if changed)
    if (slug) {
      const existing = await prisma.collection.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Ce slug est déjà utilisé par une autre collection' },
          { status: 400 }
        )
      }
    }

    // Handle product assignments if provided
    if (productIds !== undefined) {
      // Delete existing product associations
      await prisma.productCollection.deleteMany({
        where: { collectionId: id }
      })

      // Create new associations with sort order
      if (productIds.length > 0) {
        await prisma.productCollection.createMany({
          data: productIds.map((p: { id: string; sortOrder: number }) => ({
            productId: p.id,
            collectionId: id,
            sortOrder: p.sortOrder
          }))
        })
      }
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(slug !== undefined && { slug }),
        ...(image !== undefined && { image }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription })
      }
    })

    return NextResponse.json({
      success: true,
      collection,
      message: 'Collection mise à jour'
    })
  } catch (error) {
    console.error('Erreur mise à jour collection:', error)
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

    // Delete collection (product associations will be cascade deleted)
    await prisma.collection.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Collection supprimée'
    })
  } catch (error) {
    console.error('Erreur suppression collection:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

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

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                price: true,
                isActive: true
              }
            }
          }
        }
      }
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collection non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ success: true, collection })
  } catch (error) {
    console.error('Erreur récupération collection:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
