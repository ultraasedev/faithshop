import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Get user's reviews
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const reviews = await prisma.review.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: { id: true, name: true, slug: true, images: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, rating, title, content, images } = body

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Note invalide (1-5)' }, { status: 400 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    // Check if user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: 'DELIVERED'
        }
      }
    })

    if (!hasPurchased) {
      return NextResponse.json({
        error: 'Vous devez avoir acheté ce produit pour laisser un avis'
      }, { status: 400 })
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        productId
      }
    })

    if (existingReview) {
      return NextResponse.json({
        error: 'Vous avez déjà laissé un avis pour ce produit'
      }, { status: 400 })
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        title,
        content,
        images: images || [],
        isVerifiedPurchase: true,
        isApproved: false // Requires moderation
      }
    })

    revalidatePath(`/products/${product.slug}`)

    return NextResponse.json({
      success: true,
      review,
      message: 'Avis soumis et en attente de modération'
    })
  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
