'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calendar,
  Filter
} from 'lucide-react'

interface AdminDashboardProps {
  data: {
    products: any[]
    orders: any[]
    users: any[]
  }
}

export default function AdminDashboard({ data }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>({})
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    calculateStats()
  }, [data, timeRange])

  const calculateStats = () => {
    const now = new Date()
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1

    // Calculs pour la période actuelle
    const currentPeriodStart = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    const currentOrders = data.orders.filter(order =>
      new Date(order.createdAt) >= currentPeriodStart
    )

    // Calculs pour la période précédente (pour comparaison)
    const previousPeriodStart = new Date(currentPeriodStart.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    const previousOrders = data.orders.filter(order =>
      new Date(order.createdAt) >= previousPeriodStart &&
      new Date(order.createdAt) < currentPeriodStart
    )

    const currentRevenue = currentOrders.reduce((sum, order) => sum + Number(order.total || 0), 0)
    const previousRevenue = previousOrders.reduce((sum, order) => sum + Number(order.total || 0), 0)

    const revenueGrowth = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0

    const ordersGrowth = previousOrders.length > 0
      ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100
      : 0

    setStats({
      revenue: currentRevenue,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      orders: currentOrders.length,
      ordersGrowth: Math.round(ordersGrowth * 100) / 100,
      totalProducts: data.products.length,
      totalCustomers: data.users.length,
      averageOrderValue: currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0,
      pendingOrders: data.orders.filter(o => o.status === 'PENDING').length
    })
  }

  const metrics = [
    {
      title: 'Ventes totales',
      value: `€${stats.revenue?.toFixed(2) || '0.00'}`,
      growth: stats.revenueGrowth || 0,
      icon: DollarSign,
      color: 'emerald'
    },
    {
      title: 'Commandes',
      value: stats.orders || 0,
      growth: stats.ordersGrowth || 0,
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      title: 'Panier moyen',
      value: `€${stats.averageOrderValue?.toFixed(2) || '0.00'}`,
      growth: 0,
      icon: TrendingUp,
      color: 'violet'
    },
    {
      title: 'Clients',
      value: stats.totalCustomers || 0,
      growth: 0,
      icon: Users,
      color: 'orange'
    }
  ]

  const timeRanges = [
    { value: '1d', label: 'Aujourd\'hui' },
    { value: '7d', label: '7 derniers jours' },
    { value: '30d', label: '30 derniers jours' }
  ]

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    return (
      <div className={`flex items-center text-xs ${
        isPositive ? 'text-emerald-600' : 'text-red-600'
      }`}>
        {isPositive ? (
          <ArrowUpRight className="h-3 w-3 mr-1" />
        ) : (
          <ArrowDownRight className="h-3 w-3 mr-1" />
        )}
        {Math.abs(growth).toFixed(1)}%
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Tableau de bord
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Vue d'ensemble de votre boutique Faith Shop
          </p>
        </div>

        {/* Time Range Filter - Style Shopify */}
        <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                timeRange === range.value
                  ? 'bg-gray-900 dark:bg-gray-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards - Style Shopify */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index} className="border-0 shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-10 w-10 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900 flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                  </div>
                  {metric.growth !== 0 && formatGrowth(metric.growth)}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {metric.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders - Style Shopify */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Commandes récentes</CardTitle>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Eye className="h-4 w-4 mr-2" />
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.orders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          #{order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.user?.name || 'Client'} • {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        €{Number(order.total).toFixed(2)}
                      </p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'PENDING' ? 'En attente' :
                         order.status === 'PROCESSING' ? 'Traitement' :
                         order.status === 'SHIPPED' ? 'Expédiée' :
                         order.status === 'DELIVERED' ? 'Livrée' : order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats - Style Shopify */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Button
                className="w-full justify-start bg-gray-900 hover:bg-gray-800 text-white"
                onClick={() => {}}
              >
                <Package className="h-4 w-4 mr-3" />
                Ajouter un produit
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {}}
              >
                <Calendar className="h-4 w-4 mr-3" />
                Gérer les commandes
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {}}
              >
                <Users className="h-4 w-4 mr-3" />
                Voir les clients
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Commandes en attente</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.pendingOrders || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Produits actifs</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {data.products.filter(p => p.isActive).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Clients totaux</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {data.users.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Products */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700">
          <CardTitle className="text-lg font-semibold">Produits populaires</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.products.slice(0, 4).map((product: any) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url || product.images[0].src}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {product.name}
                </h4>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  €{Number(product.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}