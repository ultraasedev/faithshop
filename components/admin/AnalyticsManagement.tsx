'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalOrders: number
    totalRevenue: number
    totalCustomers: number
    totalProducts: number
    ordersToday: number
    ordersThisWeek: number
    ordersThisMonth: number
  }
  recentOrders: Array<{
    id: string
    total: number
    status: string
    createdAt: Date
    user: { name: string | null; email: string }
    items: Array<{ quantity: number; price: number }>
  }>
  topProducts: Array<{
    productId: string
    _sum: { quantity: number | null }
    product: {
      id: string
      name: string
      price: number
      images: string[]
    } | null
  }>
  customerGrowth: Array<{
    createdAt: Date
    _count: { id: number }
  }>
  revenueByDay: Array<{
    createdAt: Date
    _sum: { total: number }
    _count: { id: number }
  }>
}

interface AnalyticsManagementProps {
  data: AnalyticsData
}

export function AnalyticsManagement({ data }: AnalyticsManagementProps) {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  const revenueChartData = useMemo(() => {
    return data.revenueByDay
      .slice(-30)
      .map(day => ({
        date: new Date(day.createdAt).toLocaleDateString('fr-FR', {
          month: 'short',
          day: 'numeric'
        }),
        revenue: day._sum.total,
        orders: day._count.id
      }))
  }, [data.revenueByDay])

  const topProductsChartData = useMemo(() => {
    return data.topProducts
      .slice(0, 5)
      .map((item, index) => ({
        name: item.product?.name || 'Produit inconnu',
        sales: item._sum.quantity || 0,
        revenue: (item._sum.quantity || 0) * (item.product?.price || 0),
        color: chartColors[index % chartColors.length]
      }))
  }, [data.topProducts])

  const orderStatusData = useMemo(() => {
    const statusCounts = data.recentOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(statusCounts).map(([status, count], index) => ({
      name: status,
      value: count,
      color: chartColors[index % chartColors.length]
    }))
  }, [data.recentOrders])

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const exportData = async (format: 'csv' | 'pdf') => {
    console.log(`Exporting analytics data as ${format}...`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics & Rapports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analyse détaillée des performances de la boutique
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
          </select>
          <Button
            variant="outline"
            onClick={() => exportData('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportData('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Commandes</p>
                <p className="text-2xl font-bold">{data.overview.totalOrders.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8.2%</span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clients</p>
                <p className="text-2xl font-bold">{data.overview.totalCustomers.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15.3%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Produits</p>
                <p className="text-2xl font-bold">{data.overview.totalProducts.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">-2.1%</span>
                </div>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Commandes</span>
                <span className="font-semibold">{data.overview.ordersToday}</span>
              </div>
              <div className="flex justify-between">
                <span>Cette semaine</span>
                <span className="font-semibold">{data.overview.ordersThisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span>Ce mois</span>
                <span className="font-semibold">{data.overview.ordersThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Taux conversion</span>
                <span className="font-semibold text-green-600">3.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Panier moyen</span>
                <span className="font-semibold">
                  {formatCurrency(data.overview.totalRevenue / (data.overview.totalOrders || 1))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Visiteurs uniques</span>
                <span className="font-semibold">2,847</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Croissance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ventes vs hier</span>
                <span className="font-semibold text-green-600">+15%</span>
              </div>
              <div className="flex justify-between">
                <span>Nouveaux clients</span>
                <span className="font-semibold text-blue-600">+8%</span>
              </div>
              <div className="flex justify-between">
                <span>Trafic organique</span>
                <span className="font-semibold text-purple-600">+23%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Revenus
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produits
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Commandes
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clients
          </TabsTrigger>
        </TabsList>

        {/* Revenue Analytics */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution du chiffre d'affaires</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(Number(value)) : value,
                      name === 'revenue' ? 'Revenus' : 'Commandes'
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Revenus"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Commandes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Analytics */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Produits</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProductsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(Number(value)) : value,
                        name === 'revenue' ? 'Revenus' : 'Ventes'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="#3b82f6" name="Ventes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produits les plus vendus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topProducts.slice(0, 5).map((item, index) => (
                    <div key={item.productId} className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">
                          {item.product?.name || 'Produit inconnu'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item._sum.quantity || 0} vendus
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency((item._sum.quantity || 0) * (item.product?.price || 0))}
                        </p>
                        <p className="text-sm text-gray-600">
                          #{index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Analytics */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des statuts</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commandes récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">#{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {order.user.name || order.user.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(order.total)}</p>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Analytics */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Croissance des clients</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={data.customerGrowth.map(item => ({
                      date: new Date(item.createdAt).toLocaleDateString('fr-FR'),
                      customers: item._count.id
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="customers"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segmentation clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Clients VIP (&gt;500€)</span>
                    <Badge variant="outline">23</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Clients fidèles (3+ commandes)</span>
                    <Badge variant="outline">156</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Clients actifs (30j)</span>
                    <Badge variant="outline">89</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Nouveaux clients (7j)</span>
                    <Badge variant="outline">12</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}