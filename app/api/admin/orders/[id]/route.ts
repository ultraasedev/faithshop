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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            product: {
              select: { name: true, images: true, slug: true }
            },
            variant: true
          }
        },
        shipping: {
          include: {
            events: { orderBy: { timestamp: 'desc' } }
          }
        },
        refunds: { orderBy: { createdAt: 'desc' } },
        discountCode: true,
        giftCard: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error)
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
    const { adminNote, ...updateData } = body

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(adminNote !== undefined && { adminNote }),
        ...updateData
      }
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${id}`)

    return NextResponse.json({
      success: true,
      order,
      message: 'Commande mise à jour'
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
