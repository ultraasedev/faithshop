import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { TransactionsClient } from './TransactionsClient'
import { Skeleton } from '@/components/ui/skeleton'

async function getTransactions() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      paymentMethod: true,
      paymentStatus: true,
      stripePaymentIntentId: true,
      paypalOrderId: true,
      total: true,
      subtotal: true,
      shippingCost: true,
      discountAmount: true,
      taxAmount: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { name: true, email: true } },
      guestName: true,
      guestEmail: true,
      refunds: {
        select: {
          id: true,
          amount: true,
          type: true,
          status: true,
          reason: true,
          stripeRefundId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  return orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    stripePaymentIntentId: order.stripePaymentIntentId,
    paypalOrderId: order.paypalOrderId,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discountAmount: Number(order.discountAmount),
    taxAmount: Number(order.taxAmount),
    customerName: order.user?.name || order.guestName || 'Client anonyme',
    customerEmail: order.user?.email || order.guestEmail || '-',
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    refunds: order.refunds.map(r => ({
      ...r,
      amount: Number(r.amount),
    })),
    totalRefunded: order.refunds
      .filter(r => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + Number(r.amount), 0),
  }))
}

async function getStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    totalCompleted,
    totalFailed,
    totalPending,
    totalRefunded,
    monthRevenue,
    lastMonthRevenue,
    totalRefundAmount,
    totalCount,
  ] = await Promise.all([
    prisma.order.count({ where: { paymentStatus: 'COMPLETED' } }),
    prisma.order.count({ where: { paymentStatus: 'FAILED' } }),
    prisma.order.count({ where: { paymentStatus: 'PENDING' } }),
    prisma.order.count({
      where: { paymentStatus: { in: ['REFUNDED', 'PARTIALLY_REFUNDED'] } }
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'COMPLETED', createdAt: { gte: startOfMonth } },
      _sum: { total: true }
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startOfLastMonth, lt: startOfMonth }
      },
      _sum: { total: true }
    }),
    prisma.refund.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    }),
    prisma.order.count(),
  ])

  return {
    totalCount,
    totalCompleted,
    totalFailed,
    totalPending,
    totalRefunded,
    monthRevenue: Number(monthRevenue._sum.total || 0),
    lastMonthRevenue: Number(lastMonthRevenue._sum.total || 0),
    totalRefundAmount: Number(totalRefundAmount._sum.amount || 0),
  }
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-[500px]" />
    </div>
  )
}

async function TransactionsContent() {
  const [transactions, stats] = await Promise.all([
    getTransactions(),
    getStats()
  ])

  return <TransactionsClient transactions={transactions} stats={stats} />
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TransactionsContent />
    </Suspense>
  )
}
