import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { OrdersClient } from './OrdersClient'
import { Skeleton } from '@/components/ui/skeleton'

async function getOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true, images: true } }
        }
      },
      shipping: true,
      refunds: true
    }
  })

  return orders.map(order => ({
    ...order,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discountAmount: Number(order.discountAmount),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    customerName: order.user?.name || order.guestName || 'Client anonyme',
    customerEmail: order.user?.email || order.guestEmail || '-',
    hasRefund: order.refunds.length > 0,
    refundAmount: order.refunds.reduce((sum, r) => sum + Number(r.amount), 0)
  }))
}

async function getStats() {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    total,
    pending,
    processing,
    shipped,
    delivered,
    cancelled,
    refunded,
    todayOrders,
    monthlyRevenue
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.order.count({ where: { status: 'SHIPPED' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.order.count({ where: { status: 'CANCELLED' } }),
    prisma.order.count({ where: { status: 'REFUNDED' } }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startOfMonth }
      },
      _sum: { total: true }
    })
  ])

  return {
    total,
    pending,
    processing,
    shipped,
    delivered,
    cancelled,
    refunded,
    todayOrders,
    monthlyRevenue: Number(monthlyRevenue._sum.total || 0)
  }
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}

async function OrdersContent() {
  const [orders, stats] = await Promise.all([
    getOrders(),
    getStats()
  ])

  return <OrdersClient orders={orders} stats={stats} />
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <OrdersContent />
    </Suspense>
  )
}
