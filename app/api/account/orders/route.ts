import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id

    // Vérifier que l'utilisateur accède à ses propres commandes ou est admin
    if (userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: userId
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber || `FS-${order.id.slice(-6).toUpperCase()}`,
      date: order.createdAt.toISOString().split('T')[0],
      status: order.status.toLowerCase(),
      total: order.total,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery?.toISOString().split('T')[0],
      items: order.items.map(item => ({
        id: item.id,
        name: item.product?.name || 'Produit supprimé',
        quantity: item.quantity,
        price: item.product?.price || item.price || 0,
        image: item.product?.images?.[0] || '/api/placeholder/100/100'
      }))
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes client:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
