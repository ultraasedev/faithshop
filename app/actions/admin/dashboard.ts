'use server'

import { prisma } from '@/lib/prisma'

export async function getDashboardStats() {
  const [
    totalRevenue,
    totalOrders,
    totalCustomers,
    recentOrders,
    salesData
  ] = await Promise.all([
    // Total Revenue (sum of paid orders)
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'COMPLETED' }
    }),
    
    // Total Orders
    prisma.order.count(),
    
    // Total Customers
    prisma.user.count({ where: { role: 'USER' } }),
    
    // Recent Orders
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    }),

    // Sales Data (last 7 months - simplified for now)
    // Note: In a real app, we'd use a raw query or more complex logic to group by month
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
        }
      },
      select: {
        createdAt: true,
        total: true
      }
    })
  ])

  // Process sales data for the chart
  const monthlySales = salesData.reduce((acc: any, order) => {
    const month = order.createdAt.toLocaleString('default', { month: 'short' })
    acc[month] = (acc[month] || 0) + Number(order.total)
    return acc
  }, {})

  const chartData = Object.entries(monthlySales).map(([name, total]) => ({
    name,
    total
  }))

  return {
    revenue: totalRevenue._sum.total || 0,
    orders: totalOrders,
    customers: totalCustomers,
    recentOrders,
    chartData
  }
}
