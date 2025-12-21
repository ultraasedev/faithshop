import { prisma } from '@/lib/prisma'
import { AnalyticsManagement } from '@/components/admin/AnalyticsManagement'

async function getAnalyticsData() {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
      recentOrders,
      topProducts,
      customerGrowth,
      revenueByDay
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true }
      }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.product.count(),
      prisma.order.count({
        where: { createdAt: { gte: yesterday } }
      }),
      prisma.order.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      prisma.order.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { quantity: true, price: true } }
        }
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10
      }),
      prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          role: 'USER',
          createdAt: { gte: thirtyDaysAgo }
        },
        _count: { id: true }
      }),
      prisma.order.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _sum: { total: true },
        _count: { id: true }
      })
    ])

    const topProductsWithDetails = await prisma.product.findMany({
      where: {
        id: { in: topProducts.map(p => p.productId) }
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true
      }
    })

    const topProductsData = topProducts.map(item => {
      const product = topProductsWithDetails.find(p => p.id === item.productId)
      return {
        ...item,
        product: product ? {
          ...product,
          price: Number(product.price)
        } : null
      }
    })

    return {
      overview: {
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.total || 0),
        totalCustomers,
        totalProducts,
        ordersToday,
        ordersThisWeek,
        ordersThisMonth
      },
      recentOrders: recentOrders.map(order => ({
        ...order,
        total: Number(order.total),
        items: order.items.map(item => ({
          ...item,
          price: Number(item.price)
        }))
      })),
      topProducts: topProductsData,
      customerGrowth,
      revenueByDay: revenueByDay.map(day => ({
        ...day,
        _sum: { total: Number(day._sum.total || 0) }
      }))
    }
  } catch (error) {
    console.error('Erreur chargement analytics:', error)
    return {
      overview: {
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        ordersToday: 0,
        ordersThisWeek: 0,
        ordersThisMonth: 0
      },
      recentOrders: [],
      topProducts: [],
      customerGrowth: [],
      revenueByDay: []
    }
  }
}

export default async function AnalyticsPage() {
  const analyticsData = await getAnalyticsData()

  return <AnalyticsManagement data={analyticsData} />
}