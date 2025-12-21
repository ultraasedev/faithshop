'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Euro,
  Eye,
  Package,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Percent,
  Target
} from 'lucide-react'

interface AnalyticsData {
  revenue: {
    current: number
    previous: number
    growth: number
  }
  orders: {
    current: number
    previous: number
    growth: number
  }
  customers: {
    current: number
    previous: number
    growth: number
  }
  conversion: {
    current: number
    previous: number
    growth: number
  }
  topProducts: Array<{
    id: string
    name: string
    revenue: number
    quantity: number
  }>
  revenueChart: Array<{
    date: string
    revenue: number
    orders: number
  }>
  customerSegments: Array<{
    segment: string
    count: number
    percentage: number
  }>
  traffic: {
    sessions: number
    pageViews: number
    bounceRate: number
    avgSessionDuration: number
  }
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState<string>('30')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Erreur chargement analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = () => {
    // Générer un rapport CSV/PDF
    const csvContent = [
      ['Métrique', 'Valeur actuelle', 'Période précédente', 'Croissance'].join(','),
      ['Revenus', data?.revenue.current, data?.revenue.previous, `${data?.revenue.growth}%`].join(','),
      ['Commandes', data?.orders.current, data?.orders.previous, `${data?.orders.growth}%`].join(','),
      ['Clients', data?.customers.current, data?.customers.previous, `${data?.customers.growth}%`].join(','),
      ['Conversion', `${data?.conversion.current}%`, `${data?.conversion.previous}%`, `${data?.conversion.growth}%`].join(',')
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rapport-analytics-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span className="text-xs font-medium">
          {isPositive ? '+' : ''}{growth.toFixed(1)}%
        </span>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Rapports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Vue d'ensemble des performances de votre boutique
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">3 derniers mois</SelectItem>
              <SelectItem value="365">12 derniers mois</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(data.revenue.current)}
                </p>
                {formatGrowth(data.revenue.growth)}
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Euro className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commandes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {data.orders.current}
                </p>
                {formatGrowth(data.orders.growth)}
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nouveaux clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {data.customers.current}
                </p>
                {formatGrowth(data.customers.growth)}
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de conversion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {data.conversion.current.toFixed(1)}%
                </p>
                {formatGrowth(data.conversion.growth)}
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Évolution des revenus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Graphique des revenus sur {period} jours</p>
                <p className="text-sm">(Intégration graphique à venir)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produits populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.quantity} vendus</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segments */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Segments clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.customerSegments.map((segment) => (
                <div key={segment.segment} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                    <span className="font-medium">{segment.segment}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{segment.count}</span>
                    <span className="text-sm text-gray-500 ml-2">({segment.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Stats */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Statistiques de trafic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.traffic.sessions.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sessions</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.traffic.pageViews.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pages vues</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.traffic.bounceRate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Taux de rebond</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(data.traffic.avgSessionDuration / 60)}:{String(data.traffic.avgSessionDuration % 60).padStart(2, '0')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Durée moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Insights et recommandations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">Performance</span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Vos revenus ont augmenté de {data.revenue.growth.toFixed(1)}% ce mois-ci. Excellent travail !
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900 dark:text-green-100">Conversion</span>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200">
                Votre taux de conversion de {data.conversion.current.toFixed(1)}% est {data.conversion.growth >= 0 ? 'en hausse' : 'en baisse'}.
              </p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-900 dark:text-orange-100">Acquisition</span>
              </div>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                {data.customers.current} nouveaux clients acquis cette période.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}