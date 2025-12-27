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
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Calculs des stats
    const [
      totalOrders,
      totalCustomers,
      pendingOrders,
      newCustomers,
      monthlyRevenue,
      previousMonthRevenue
    ] = await Promise.all([
      // Total des commandes
      prisma.order.count(),

      // Total des clients
      prisma.user.count({
        where: { role: 'USER' }
      }),

      // Commandes en attente
      prisma.order.count({
        where: { status: 'PENDING' }
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

      // Revenus du mois courant
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: currentMonth
          },
          status: {
            not: 'CANCELLED'
          }
        },
        _sum: {
          total: true
        }
      }),

      // Revenus du mois précédent
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: currentMonth
          },
          status: {
            not: 'CANCELLED'
          }
        },
        _sum: {
          total: true
        }
      })
    ])

    const currentRevenue = Number(monthlyRevenue._sum.total || 0)
    const previousRevenue = Number(previousMonthRevenue._sum.total || 0)
    const revenueGrowth = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0

    // Calcul du taux de conversion approximatif
    const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0

    const stats = {
      monthlyRevenue: currentRevenue,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      totalOrders,
      pendingOrders,
      totalCustomers,
      newCustomers,
      conversionRate: Math.round(conversionRate * 100) / 100,
      conversionGrowth: 0 // Placeholder, nécessiterait plus de calculs
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}