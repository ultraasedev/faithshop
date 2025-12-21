import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { prisma } from '@/lib/prisma'
import { getProducts } from '@/app/actions/admin/products'
import { getOrders } from '@/app/actions/admin/orders'

// Interface simplifiée et épurée - style Stripe
import AdminDashboard from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

async function fetchRealData() {
  try {
    const [products, ordersResult] = await Promise.all([
      getProducts(),
      getOrders({})
    ])
    return { products, orders: ordersResult.orders || [] }
  } catch (error) {
    console.error('Error fetching real data:', error)
    return { products: [], orders: [] }
  }
}

export default async function EnhancedAdminPage() {
  const { products, orders } = await fetchRealData()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Faith Shop Admin</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Interface de gestion e-commerce
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Activé
          </Badge>
        </div>

        <AdminDashboard products={products} orders={orders} />
      </div>
    </div>
  )
}