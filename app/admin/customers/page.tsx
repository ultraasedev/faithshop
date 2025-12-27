import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CustomersClient } from './CustomersClient'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  // Get customers with stats
  const customers = await prisma.user.findMany({
    where: {
      role: 'USER'
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      zipCode: true,
      country: true,
      createdAt: true,
      emailVerified: true,
      image: true,
      orders: {
        select: {
          id: true,
          total: true,
          createdAt: true,
          status: true
        },
        where: {
          status: { not: 'CANCELLED' }
        }
      },
      reviews: {
        select: { id: true }
      },
      wishlist: {
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate stats
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const stats = {
    totalCustomers: customers.length,
    newThisMonth: customers.filter(c => new Date(c.createdAt) >= currentMonth).length,
    activeCustomers: customers.filter(c => c.orders.length > 0).length,
    averageSpent: customers.length > 0
      ? customers.reduce((sum, c) => sum + c.orders.reduce((t, o) => t + Number(o.total), 0), 0) / customers.filter(c => c.orders.length > 0).length || 0
      : 0
  }

  // Format customers data
  const formattedCustomers = customers.map(customer => ({
    id: customer.id,
    name: customer.name || 'Client',
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
    zipCode: customer.zipCode,
    country: customer.country || 'France',
    image: customer.image,
    emailVerified: !!customer.emailVerified,
    createdAt: customer.createdAt,
    totalOrders: customer.orders.length,
    totalSpent: customer.orders.reduce((total, order) => total + Number(order.total), 0),
    lastOrderDate: customer.orders.length > 0
      ? customer.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
      : null,
    reviewCount: customer.reviews.length,
    wishlistCount: customer.wishlist.length
  }))

  return <CustomersClient customers={formattedCustomers} stats={stats} />
}
