import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateOrderStatus } from '@/app/actions/admin/orders'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { status } = await request.json()
    const updatedOrder = await updateOrderStatus(params.id, status)

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