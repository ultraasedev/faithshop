import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOrders } from '@/app/actions/admin/orders'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined

    const result = await getOrders({ page, limit, status: status as any, search })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}