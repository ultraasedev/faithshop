import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getOrderStats } from '@/app/actions/admin/orders'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const stats = await getOrderStats()
    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}