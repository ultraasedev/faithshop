import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            }
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedOrders = orders.map(order => ({
      id: order.id,
      customerName: order.user?.name || 'Client anonyme',
      products: order.items.map(item => item.product?.name || 'Produit inconnu'),
      totalAmount: order.total,
      currentStatus: order.status.toLowerCase(),
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      isUrgent: order.priority === 'HIGH',
      timeline: [
        {
          id: '1',
          status: 'pending',
          timestamp: order.createdAt,
          description: 'Commande reçue'
        },
        ...(order.confirmedAt ? [{
          id: '2',
          status: 'confirmed',
          timestamp: order.confirmedAt,
          description: 'Paiement confirmé'
        }] : []),
        ...(order.shippedAt ? [{
          id: '3',
          status: 'shipped',
          timestamp: order.shippedAt,
          description: 'Commande expédiée'
        }] : []),
        ...(order.deliveredAt ? [{
          id: '4',
          status: 'delivered',
          timestamp: order.deliveredAt,
          description: 'Commande livrée'
        }] : [])
      ]
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const { orderId, status, location, notifyCustomer } = await request.json()

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status.toUpperCase(),
        ...(status === 'shipped' && { shippedAt: new Date() }),
        ...(status === 'delivered' && { deliveredAt: new Date() })
      }
    })

    // Si demandé, envoyer une notification au client
    if (notifyCustomer) {
      // Logique de notification (email, SMS, push)
      // await sendOrderStatusNotification(updatedOrder)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}