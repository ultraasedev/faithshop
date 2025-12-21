import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '30')

    const now = new Date()
    const periodStart = new Date(now.getTime() - period * 24 * 60 * 60 * 1000)
    const previousPeriodStart = new Date(periodStart.getTime() - period * 24 * 60 * 60 * 1000)

    // Calculs pour la période actuelle
    const [
      currentRevenue,
      currentOrders,
      currentCustomers,
      previousRevenue,
      previousOrders,
      previousCustomers,
      topProducts,
      customerSegments
    ] = await Promise.all([
      // Revenus période actuelle
      prisma.order.aggregate({
        where: {
          createdAt: { gte: periodStart },
          status: { not: 'CANCELLED' }
        },
        _sum: { total: true },
        _count: true
      }),

      // Commandes période actuelle
      prisma.order.count({
        where: {
          createdAt: { gte: periodStart },
          status: { not: 'CANCELLED' }
        }
      }),

      // Nouveaux clients période actuelle
      prisma.user.count({
        where: {
          createdAt: { gte: periodStart },
          role: 'USER'
        }
      }),

      // Revenus période précédente
      prisma.order.aggregate({
        where: {
          createdAt: { gte: previousPeriodStart, lt: periodStart },
          status: { not: 'CANCELLED' }
        },
        _sum: { total: true },
        _count: true
      }),

      // Commandes période précédente
      prisma.order.count({
        where: {
          createdAt: { gte: previousPeriodStart, lt: periodStart },
          status: { not: 'CANCELLED' }
        }
      }),

      // Nouveaux clients période précédente
      prisma.user.count({
        where: {
          createdAt: { gte: previousPeriodStart, lt: periodStart },
          role: 'USER'
        }
      }),

      // Top produits (simulé pour l'exemple)
      prisma.product.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          price: true
        }
      }),

      // Segments de clients (simulé)
      Promise.resolve([
        { segment: 'Nouveaux clients', count: 45, percentage: 30 },
        { segment: 'Clients fidèles', count: 67, percentage: 45 },
        { segment: 'Clients VIP', count: 23, percentage: 15 },
        { segment: 'Inactifs', count: 15, percentage: 10 }
      ])
    ])

    // Calculs des croissances
    const revenueGrowth = previousRevenue._sum.total
      ? ((Number(currentRevenue._sum.total || 0) - Number(previousRevenue._sum.total)) / Number(previousRevenue._sum.total)) * 100
      : 0

    const ordersGrowth = previousOrders > 0
      ? ((currentOrders - previousOrders) / previousOrders) * 100
      : 0

    const customersGrowth = previousCustomers > 0
      ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
      : 0

    // Simulation du taux de conversion
    const conversionRate = Math.random() * 5 + 2 // 2-7%
    const previousConversionRate = Math.random() * 5 + 2
    const conversionGrowth = ((conversionRate - previousConversionRate) / previousConversionRate) * 100

    // Simulation de produits populaires avec revenus
    const topProductsWithStats = topProducts.map((product, index) => ({
      id: product.id,
      name: product.name,
      revenue: Number(product.price) * (50 - index * 5), // Simulation
      quantity: 50 - index * 5
    }))

    // Simulation des données de graphique
    const revenueChart = Array.from({ length: Math.min(period, 30) }, (_, i) => {
      const date = new Date(periodStart.getTime() + i * 24 * 60 * 60 * 1000)
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.random() * 1000 + 500,
        orders: Math.floor(Math.random() * 20 + 5)
      }
    })

    // Simulation du trafic
    const traffic = {
      sessions: Math.floor(Math.random() * 10000 + 5000),
      pageViews: Math.floor(Math.random() * 50000 + 20000),
      bounceRate: Math.random() * 30 + 40, // 40-70%
      avgSessionDuration: Math.floor(Math.random() * 300 + 120) // 2-7 minutes
    }

    const analyticsData = {
      revenue: {
        current: Number(currentRevenue._sum.total || 0),
        previous: Number(previousRevenue._sum.total || 0),
        growth: Math.round(revenueGrowth * 100) / 100
      },
      orders: {
        current: currentOrders,
        previous: previousOrders,
        growth: Math.round(ordersGrowth * 100) / 100
      },
      customers: {
        current: currentCustomers,
        previous: previousCustomers,
        growth: Math.round(customersGrowth * 100) / 100
      },
      conversion: {
        current: Math.round(conversionRate * 100) / 100,
        previous: Math.round(previousConversionRate * 100) / 100,
        growth: Math.round(conversionGrowth * 100) / 100
      },
      topProducts: topProductsWithStats,
      revenueChart,
      customerSegments,
      traffic
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}