import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ShoppingCart,
  Package,
  Users,
  Euro,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

async function getStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalOrders,
    monthlyOrders,
    lastMonthOrders,
    totalRevenue,
    monthlyRevenue,
    lastMonthRevenue,
    totalProducts,
    activeProducts,
    totalCustomers,
    newCustomers,
    pendingOrders,
    processingOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { createdAt: { gte: startOfMonth } }
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      }
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _sum: { total: true }
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startOfMonth }
      },
      _sum: { total: true }
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { total: true }
    }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({
      where: {
        role: 'USER',
        createdAt: { gte: startOfMonth }
      }
    }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
  ])

  const orderGrowth = lastMonthOrders > 0
    ? ((monthlyOrders - lastMonthOrders) / lastMonthOrders) * 100
    : 100

  const currentMonthlyRevenue = Number(monthlyRevenue._sum.total || 0)
  const previousMonthlyRevenue = Number(lastMonthRevenue._sum.total || 0)
  const revenueGrowth = previousMonthlyRevenue > 0
    ? ((currentMonthlyRevenue - previousMonthlyRevenue) / previousMonthlyRevenue) * 100
    : 100

  return {
    totalOrders,
    monthlyOrders,
    orderGrowth,
    totalRevenue: Number(totalRevenue._sum.total || 0),
    monthlyRevenue: currentMonthlyRevenue,
    revenueGrowth,
    totalProducts,
    activeProducts,
    totalCustomers,
    newCustomers,
    pendingOrders,
    processingOrders,
  }
}

async function getRecentOrders() {
  return prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } }
    }
  })
}

async function getLowStockProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      trackQuantity: true,
      stock: { lte: prisma.product.fields.lowStockThreshold }
    },
    take: 5,
    orderBy: { stock: 'asc' }
  })
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  description,
  href
}: {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  description?: string
  href?: string
}) {
  const content = (
    <Card className={cn(href && "hover:shadow-lg transition-shadow cursor-pointer")}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            {(trendValue || description) && (
              <div className="mt-2 flex items-center gap-2">
                {trend && trendValue && (
                  <span className={cn(
                    "inline-flex items-center gap-1 text-sm font-medium",
                    trend === 'up' && "text-green-600 dark:text-green-400",
                    trend === 'down' && "text-red-600 dark:text-red-400",
                    trend === 'neutral' && "text-gray-500"
                  )}>
                    {trend === 'up' && <TrendingUp className="h-4 w-4" />}
                    {trend === 'down' && <TrendingDown className="h-4 w-4" />}
                    {trendValue}
                  </span>
                )}
                {description && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{description}</span>
                )}
              </div>
            )}
          </div>
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
            <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function DashboardStats() {
  const stats = await getStats()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Chiffre d'affaires"
        value={`${stats.monthlyRevenue.toLocaleString('fr-FR')} €`}
        icon={Euro}
        trend={stats.revenueGrowth >= 0 ? 'up' : 'down'}
        trendValue={`${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth.toFixed(1)}%`}
        description="vs mois dernier"
        href="/admin/analytics"
      />
      <StatCard
        title="Commandes"
        value={stats.monthlyOrders}
        icon={ShoppingCart}
        trend={stats.orderGrowth >= 0 ? 'up' : 'down'}
        trendValue={`${stats.orderGrowth >= 0 ? '+' : ''}${stats.orderGrowth.toFixed(1)}%`}
        description="ce mois"
        href="/admin/orders"
      />
      <StatCard
        title="Produits actifs"
        value={`${stats.activeProducts} / ${stats.totalProducts}`}
        icon={Package}
        description="produits en ligne"
        href="/admin/products"
      />
      <StatCard
        title="Clients"
        value={stats.totalCustomers}
        icon={Users}
        trend={stats.newCustomers > 0 ? 'up' : 'neutral'}
        trendValue={stats.newCustomers > 0 ? `+${stats.newCustomers}` : undefined}
        description={stats.newCustomers > 0 ? 'nouveaux ce mois' : undefined}
        href="/admin/customers"
      />
    </div>
  )
}

async function RecentOrdersTable() {
  const orders = await getRecentOrders()

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      PROCESSING: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      SHIPPED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    }
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      PAID: 'Payée',
      PROCESSING: 'En préparation',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
      REFUNDED: 'Remboursée',
    }
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[status])}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Commandes récentes</CardTitle>
        <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
          Voir tout &rarr;
        </Link>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Aucune commande récente</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.user?.name || order.guestName || order.guestEmail || 'Client anonyme'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(order.status)}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Number(order.total).toLocaleString('fr-FR')} €
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

async function QuickActions() {
  const stats = await getStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions requises</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.pendingOrders > 0 && (
          <Link
            href="/admin/orders?status=PENDING"
            className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                Commandes en attente
              </span>
            </div>
            <span className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
              {stats.pendingOrders}
            </span>
          </Link>
        )}

        {stats.processingOrders > 0 && (
          <Link
            href="/admin/orders?status=PROCESSING"
            className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-purple-800 dark:text-purple-200">
                À expédier
              </span>
            </div>
            <span className="px-3 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
              {stats.processingOrders}
            </span>
          </Link>
        )}

        {stats.pendingOrders === 0 && stats.processingOrders === 0 && (
          <div className="flex items-center justify-center gap-3 p-8 text-gray-500">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Tout est à jour !</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tableau de bord
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Bienvenue dans votre espace d'administration
        </p>
      </div>

      {/* Stats Grid */}
      <Suspense fallback={<StatsLoading />}>
        <DashboardStats />
      </Suspense>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <RecentOrdersTable />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<Skeleton className="h-96" />}>
            <QuickActions />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
