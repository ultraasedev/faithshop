'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/admin/common/StatusBadge'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  kpis: {
    totalRevenue: number
    thisMonthRevenue: number
    revenueGrowth: number
    totalOrders: number
    thisMonthOrders: number
    ordersGrowth: number
    totalCustomers: number
    newCustomersThisMonth: number
    avgOrderValue: number
    totalProducts: number
    activeProducts: number
  }
  chartData: Array<{ month: string; revenue: number; orders: number }>
  dailyChartData: Array<{ day: string; revenue: number; orders: number }>
  topProducts: Array<{
    name: string
    image: string
    price: number
    sold: number
    orders: number
  }>
  latestOrders: Array<{
    id: string
    orderNumber: string
    customer: string
    email: string
    total: number
    status: string
    paymentStatus: string
    createdAt: Date
  }>
  statusDistribution: Array<{ status: string; count: number }>
}

interface AnalyticsClientProps {
  data: AnalyticsData
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#fbbf24',
  PAID: '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED: '#6366f1',
  DELIVERED: '#22c55e',
  CANCELLED: '#ef4444',
  REFUNDED: '#6b7280'
}

export function AnalyticsClient({ data }: AnalyticsClientProps) {
  const [chartPeriod, setChartPeriod] = useState<'monthly' | 'daily'>('monthly')
  const { kpis, chartData, dailyChartData, topProducts, latestOrders, statusDistribution } = data

  const kpiCards = [
    {
      title: 'Chiffre d\'affaires',
      value: `${kpis.totalRevenue.toLocaleString('fr-FR')} €`,
      subValue: `${kpis.thisMonthRevenue.toLocaleString('fr-FR')} € ce mois`,
      change: kpis.revenueGrowth,
      icon: DollarSign,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Commandes',
      value: kpis.totalOrders.toLocaleString('fr-FR'),
      subValue: `${kpis.thisMonthOrders} ce mois`,
      change: kpis.ordersGrowth,
      icon: ShoppingCart,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Clients',
      value: kpis.totalCustomers.toLocaleString('fr-FR'),
      subValue: `+${kpis.newCustomersThisMonth} ce mois`,
      change: null,
      icon: Users,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Panier moyen',
      value: `${kpis.avgOrderValue.toFixed(2)} €`,
      subValue: `${kpis.activeProducts}/${kpis.totalProducts} produits actifs`,
      change: null,
      icon: Package,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Statistiques et performances de votre boutique
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Ce mois
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-lg", kpi.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {kpi.change !== null && (
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      kpi.change >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {kpi.change >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {Math.abs(kpi.change)}%
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {kpi.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {kpi.title}
                  </p>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {kpi.subValue}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Évolution du chiffre d'affaires</CardTitle>
                <CardDescription>Revenus et commandes sur la période</CardDescription>
              </div>
              <Tabs value={chartPeriod} onValueChange={(v) => setChartPeriod(v as 'monthly' | 'daily')}>
                <TabsList>
                  <TabsTrigger value="monthly">Mensuel</TabsTrigger>
                  <TabsTrigger value="daily">30 jours</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartPeriod === 'monthly' ? chartData : dailyChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" />
                <XAxis
                  dataKey={chartPeriod === 'monthly' ? 'month' : 'day'}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  tickFormatter={(value) => `${value} €`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, white)',
                    border: '1px solid var(--tooltip-border, #e5e7eb)',
                    borderRadius: '8px',
                    color: 'var(--tooltip-color, #111827)'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? `${value.toFixed(2)} €` : value,
                    name === 'revenue' ? 'Revenus' : 'Commandes'
                  ]}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenus"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  name="Commandes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des commandes</CardTitle>
            <CardDescription>Par statut</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="status"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || '#6b7280'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [value, getStatusLabel(name)]}
                />
                <Legend
                  formatter={(value) => getStatusLabel(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produits les plus vendus</CardTitle>
            <CardDescription>Top 5 des meilleures ventes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.sold} vendus • {product.orders} commandes
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{product.price.toFixed(2)} €</p>
                  </div>
                </div>
              ))}

              {topProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucune vente enregistrée
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Dernières commandes</CardTitle>
              <CardDescription>10 commandes les plus récentes</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/orders">
                Voir tout
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {order.customer.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customer}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.total.toFixed(2)} €</p>
                    <StatusBadge status={order.status} type="order" size="sm" />
                  </div>
                </Link>
              ))}

              {latestOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucune commande
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    PAID: 'Payée',
    PROCESSING: 'En préparation',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée',
    REFUNDED: 'Remboursée'
  }
  return labels[status] || status
}
