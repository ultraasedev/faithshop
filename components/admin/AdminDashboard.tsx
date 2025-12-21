'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Filter,
  Download
} from 'lucide-react'

interface AdminDashboardProps {
  data: {
    products: any[]
    orders: any[]
    users: any[]
  }
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const [timeRange, setTimeRange] = useState('7d')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    calculateStats()
  }, [data, timeRange])

  const calculateStats = () => {
    const now = new Date()
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1

    // Période actuelle
    const currentPeriodStart = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    const currentOrders = data.orders.filter(order =>
      new Date(order.createdAt) >= currentPeriodStart
    )

    // Période précédente pour comparaison
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

    const averageOrderValue = currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0

    setStats({
      revenue: currentRevenue,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      orders: currentOrders.length,
      ordersGrowth: Math.round(ordersGrowth * 100) / 100,
      totalProducts: data.products.length,
      totalCustomers: data.users.length,
      averageOrderValue,
      pendingOrders: data.orders.filter(o => o.status === 'PENDING').length,
      recentOrders: data.orders.slice(0, 5),
      topProducts: getTopProducts(),
      statusCounts: getStatusCounts()
    })
  }

  const getTopProducts = () => {
    const productSales = new Map()
    data.orders.forEach(order => {
      order.items?.forEach((item: any) => {
        const productName = item.product?.name || 'Produit inconnu'
        const current = productSales.get(productName) || { quantity: 0, revenue: 0 }
        productSales.set(productName, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + (item.price * item.quantity)
        })
      })
    })

    return Array.from(productSales.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }

  const getStatusCounts = () => {
    const counts = { PENDING: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 }
    data.orders.forEach(order => {
      counts[order.status as keyof typeof counts] = (counts[order.status as keyof typeof counts] || 0) + 1
    })
    return counts
  }

  const timeRanges = [
    { value: '1d', label: "Aujourd'hui" },
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' }
  ]

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    const colorClass = isPositive ? 'text-emerald-600' : 'text-red-600'

    return (
      <div className={`flex items-center text-xs ${colorClass}`}>
        <Icon className="h-3 w-3 mr-1" />
        {Math.abs(growth).toFixed(1)}%
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      PROCESSING: { label: 'Traitement', color: 'bg-blue-100 text-blue-800' },
      SHIPPED: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800' },
      DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING

    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tableau de bord
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Vue d'ensemble de votre boutique Faith Shop
          </p>
        </div>

        {/* Filtres temporels */}
        <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
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

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              {formatGrowth(stats.revenueGrowth)}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                €{stats.revenue.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chiffre d'affaires
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              {formatGrowth(stats.ordersGrowth)}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.orders}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Commandes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                €{stats.averageOrderValue.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Panier moyen
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.totalCustomers}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Clients
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Commandes récentes */}
        <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border-0 shadow-lg">
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
              {stats.recentOrders.map((order: any) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Commande #{order.orderNumber}
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
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides et statistiques */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Button className="w-full justify-start bg-gray-900 hover:bg-gray-800 text-white">
                <Package className="h-4 w-4 mr-3" />
                Ajouter un produit
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-3" />
                Gérer les commandes
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-3" />
                Voir les clients
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold">Statut des commandes</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {Object.entries(stats.statusCounts).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {status === 'PENDING' ? 'En attente' :
                     status === 'PROCESSING' ? 'Traitement' :
                     status === 'SHIPPED' ? 'Expédiées' :
                     status === 'DELIVERED' ? 'Livrées' :
                     'Annulées'}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {count as number}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Produits populaires */}
      {stats.topProducts.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="text-lg font-semibold">Produits populaires</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {stats.topProducts.map((product: any, index: number) => (
                <div key={index} className="group cursor-pointer">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.quantity} vendu{product.quantity > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    €{product.revenue.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}