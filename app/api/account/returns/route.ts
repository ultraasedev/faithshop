import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Get user's returns
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const returns = await prisma.return.findMany({
      where: {
        order: { userId: session.user.id }
      },
      include: {
        order: {
          select: { orderNumber: true, createdAt: true }
        },
        items: {
          include: {
            orderItem: {
              include: {
                product: { select: { name: true, images: true } },
                variant: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(returns)
  } catch (error) {
    console.error('Erreur lors de la récupération des retours:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Create a return request
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, items, reason, comments } = body

    // Validate order belongs to user and is eligible for return
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        status: 'DELIVERED'
      },
      include: {
        items: true
      }
    })

    if (!order) {
      return NextResponse.json({
        error: 'Commande non trouvée ou non éligible au retour'
      }, { status: 400 })
    }

    // Check return window (30 days)
    const deliveryDate = order.updatedAt // Approximate delivery date
    const returnWindow = 30 * 24 * 60 * 60 * 1000 // 30 days in ms
    if (Date.now() - deliveryDate.getTime() > returnWindow) {
      return NextResponse.json({
        error: 'La période de retour de 30 jours est dépassée'
      }, { status: 400 })
    }

    // Check if return already exists for this order
    const existingReturn = await prisma.return.findFirst({
      where: {
        orderId,
        status: { not: 'REJECTED' }
      }
    })

    if (existingReturn) {
      return NextResponse.json({
        error: 'Une demande de retour existe déjà pour cette commande'
      }, { status: 400 })
    }

    // Validate items
    const orderItemIds = order.items.map(i => i.id)
    const validItems = items.filter((item: { orderItemId: string }) =>
      orderItemIds.includes(item.orderItemId)
    )

    if (validItems.length === 0) {
      return NextResponse.json({
        error: 'Aucun article valide sélectionné'
      }, { status: 400 })
    }

    // Calculate refund amount
    let refundAmount = 0
    for (const item of validItems) {
      const orderItem = order.items.find(i => i.id === item.orderItemId)
      if (orderItem) {
        refundAmount += Number(orderItem.price) * (item.quantity || 1)
      }
    }

    // Generate return number
    const returnNumber = `RET-${Date.now().toString(36).toUpperCase()}`

    // Create return with items
    const returnRequest = await prisma.return.create({
      data: {
        orderId,
        returnNumber,
        reason,
        customerComments: comments,
        refundAmount,
        status: 'REQUESTED',
        items: {
          create: validItems.map((item: { orderItemId: string; quantity?: number; reason?: string }) => ({
            orderItemId: item.orderItemId,
            quantity: item.quantity || 1,
            reason: item.reason || reason
          }))
        }
      },
      include: {
        items: {
          include: {
            orderItem: {
              include: {
                product: { select: { name: true } }
              }
            }
          }
        }
      }
    })

    // Send notification email
    try {
      const { sendReturnRequestEmail } = await import('@/lib/email')
      if (session.user.email) {
        await sendReturnRequestEmail(
          session.user.email,
          session.user.name || 'Client',
          order.orderNumber,
          returnNumber
        )
      }
    } catch (emailError) {
      console.error('Erreur envoi email retour:', emailError)
    }

    revalidatePath('/account/returns')

    return NextResponse.json({
      success: true,
      return: returnRequest,
      message: 'Demande de retour créée avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la création du retour:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
