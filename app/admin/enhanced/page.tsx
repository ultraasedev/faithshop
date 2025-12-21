import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export const dynamic = 'force-dynamic'

async function getAdminData() {
  try {
    const [products, orders, users] = await Promise.all([
      prisma.product.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.user.findMany({
        where: { role: 'USER' },
        take: 100,
        orderBy: { createdAt: 'desc' }
      })
    ])

    return { products, orders, users }
  } catch (error) {
    console.error('Erreur chargement données admin:', error)
    return { products: [], orders: [], users: [] }
  }
}

export default async function AdminPage() {
  const data = await getAdminData()

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminLayout initialData={data} />
    </Suspense>
  )
}