import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
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
    const { status } = await request.json()

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === 'DELIVERED' && { deliveredAt: new Date() })
      }
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Statut mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Also support PUT for backwards compatibility
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context)
}