import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalCustomers,
      newThisMonth,
      activeCustomers,
      averageSpent
    ] = await Promise.all([
      // Total des clients
      prisma.user.count({
        where: { role: 'USER' }
      }),

      // Nouveaux clients ce mois
      prisma.user.count({
        where: {
          role: 'USER',
          createdAt: {
            gte: currentMonth
          }
        }
      }),

      // Clients actifs (ayant passé au moins une commande)
      prisma.user.count({
        where: {
          role: 'USER',
          orders: {
            some: {
              status: {
                not: 'CANCELLED'
              }
            }
          }
        }
      }),

      // Panier moyen
      prisma.order.aggregate({
        where: {
          status: {
            not: 'CANCELLED'
          }
        },
        _avg: {
          total: true
        }
      })
    ])

    const stats = {
      totalCustomers,
      newThisMonth,
      activeCustomers,
      averageSpent: Math.round(Number(averageSpent._avg.total || 0) * 100) / 100
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erreur lors de la récupération des stats clients:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}