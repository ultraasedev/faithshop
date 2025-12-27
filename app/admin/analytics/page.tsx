import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { AnalyticsClient } from './AnalyticsClient'
import { Skeleton } from '@/components/ui/skeleton'

async function getAnalyticsData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Get all completed orders for revenue calculation
  const completedOrders = await prisma.order.findMany({
    where: {
      paymentStatus: 'COMPLETED',
      createdAt: { gte: startOfYear }
    },
    select: {
      id: true,
      total: true,
      createdAt: true,
      items: {
        select: {
          quantity: true,
          price: true,
          product: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  // Group orders by month for chart
  const monthlyData: Record<string, { revenue: number; orders: number }> = {}
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

  for (let i = 0; i <= now.getMonth(); i++) {
    monthlyData[months[i]] = { revenue: 0, orders: 0 }
  }

  completedOrders.forEach(order => {
    const month = months[order.createdAt.getMonth()]
    if (monthlyData[month]) {
      monthlyData[month].revenue += Number(order.total)
      monthlyData[month].orders += 1
    }
  })

  const chartData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    revenue: Math.round(data.revenue * 100) / 100,
    orders: data.orders
  }))

  // Daily data for last 30 days
  const dailyData: Record<string, { revenue: number; orders: number }> = {}

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = `${date.getDate()}/${date.getMonth() + 1}`
    dailyData[key] = { revenue: 0, orders: 0 }
  }

  const recentOrders = completedOrders.filter(o => o.createdAt >= thirtyDaysAgo)
  recentOrders.forEach(order => {
    const key = `${order.createdAt.getDate()}/${order.createdAt.getMonth() + 1}`
    if (dailyData[key]) {
      dailyData[key].revenue += Number(order.total)
      dailyData[key].orders += 1
    }
  })

  const dailyChartData = Object.entries(dailyData).map(([day, data]) => ({
    day,
    revenue: Math.round(data.revenue * 100) / 100,
    orders: data.orders
  }))

  // KPIs
  const [
    totalRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    totalOrders,
    thisMonthOrders,
    lastMonthOrders,
    totalCustomers,
    newCustomersThisMonth,
    totalProducts,
    activeProducts
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'COMPLETED' }
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'COMPLETED', createdAt: { gte: startOfMonth } }
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'COMPLETED', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }
    }),
    prisma.order.count({ where: { paymentStatus: 'COMPLETED' } }),
    prisma.order.count({ where: { paymentStatus: 'COMPLETED', createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { paymentStatus: 'COMPLETED', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({ where: { role: 'USER', createdAt: { gte: startOfMonth } } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } })
  ])

  // Top products
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    _count: true,
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5
  })

  const topProductsWithDetails = await Promise.all(
    topProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true, images: true, price: true }
      })
      return {
        name: product?.name || 'Produit inconnu',
        image: product?.images?.[0] || '',
        price: Number(product?.price) || 0,
        sold: item._sum.quantity || 0,
        orders: item._count
      }
    })
  )

  // Recent orders
  const latestOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } }
    }
  })

  // Order status distribution
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: true
  })

  const statusDistribution = ordersByStatus.map(item => ({
    status: item.status,
    count: item._count
  }))

  // Calculate growth percentages
  const revenueGrowth = Number(lastMonthRevenue._sum.total) > 0
    ? ((Number(thisMonthRevenue._sum.total) - Number(lastMonthRevenue._sum.total)) / Number(lastMonthRevenue._sum.total) * 100).toFixed(1)
    : '0'

  const ordersGrowth = lastMonthOrders > 0
    ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1)
    : '0'

  // Average order value
  const avgOrderValue = totalOrders > 0
    ? Number(totalRevenue._sum.total) / totalOrders
    : 0

  return {
    kpis: {
      totalRevenue: Number(totalRevenue._sum.total) || 0,
      thisMonthRevenue: Number(thisMonthRevenue._sum.total) || 0,
      revenueGrowth: parseFloat(revenueGrowth),
      totalOrders,
      thisMonthOrders,
      ordersGrowth: parseFloat(ordersGrowth),
      totalCustomers,
      newCustomersThisMonth,
      avgOrderValue,
      totalProducts,
      activeProducts
    },
    chartData,
    dailyChartData,
    topProducts: topProductsWithDetails,
    latestOrders: latestOrders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user?.name || order.guestName || 'Client',
      email: order.user?.email || order.guestEmail || '',
      total: Number(order.total),
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt
    })),
    statusDistribution
  }
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-80" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}

async function AnalyticsContent() {
  const data = await getAnalyticsData()
  return <AnalyticsClient data={data} />
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AnalyticsContent />
    </Suspense>
  )
}
