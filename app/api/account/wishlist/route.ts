'use server'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })

  // Récupérer les produits correspondants
  const productIds = wishlistItems.map(item => item.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true }
  })

  // Combiner les données
  const wishlist = wishlistItems.map(item => {
    const product = products.find(p => p.id === item.productId)
    return {
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt,
      product: product || null
    }
  }).filter(item => item.product !== null)

  return NextResponse.json(wishlist)
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { productId } = await req.json()

  if (!productId) {
    return NextResponse.json({ error: 'productId requis' }, { status: 400 })
  }

  // Vérifier que le produit existe
  const product = await prisma.product.findUnique({
    where: { id: productId }
  })

  if (!product) {
    return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
  }

  // Ajouter à la wishlist (upsert pour éviter les doublons)
  const wishlistItem = await prisma.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId
      }
    },
    update: {},
    create: {
      userId: session.user.id,
      productId
    }
  })

  return NextResponse.json(wishlistItem)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')

  if (!productId) {
    return NextResponse.json({ error: 'productId requis' }, { status: 400 })
  }

  await prisma.wishlistItem.deleteMany({
    where: {
      userId: session.user.id,
      productId
    }
  })

  return NextResponse.json({ success: true })
}
