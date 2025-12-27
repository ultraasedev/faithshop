import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CustomerDetailClient } from './CustomerDetailClient'

export const dynamic = 'force-dynamic'

export default async function CustomerDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const { id } = await params

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true
        }
      },
      addresses: true,
      reviews: {
        include: {
          product: { select: { name: true, images: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      _count: {
        select: {
          orders: true,
          reviews: true
        }
      }
    }
  })

  if (!customer) {
    notFound()
  }

  // Calculate customer stats
  const orders = await prisma.order.findMany({
    where: { userId: id },
    select: { total: true, status: true, createdAt: true }
  })

  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
    completedOrders: orders.filter(o => o.status === 'DELIVERED').length,
    lastOrderDate: orders.length > 0 ? orders[0].createdAt : null
  }

  return <CustomerDetailClient customer={customer} stats={stats} />
}
