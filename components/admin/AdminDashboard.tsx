'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Package,
  ShoppingCart,
  CreditCard,
  Settings,
  Users,
  Palette,
  TrendingUp,
  DollarSign,
  Eye,
  Zap,
  FileText,
  Gift,
  Truck,
  RefreshCw,
  Bell
} from 'lucide-react'

// Composants avancés
import AdvancedProductManager from '@/components/admin/AdvancedProductManager'
import AdvancedOrderManager from '@/components/admin/AdvancedOrderManager'
import AdvancedDiscountManager from '@/components/admin/AdvancedDiscountManager'
import SiteCustomizer from '@/components/admin/SiteCustomizer'
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'
import CustomerManager from '@/components/admin/CustomerManager'

type AdminSection = 'dashboard' | 'orders' | 'products' | 'customers' | 'discounts' | 'analytics' | 'customize' | 'settings'

interface AdminDashboardProps {
  products: any[]
  orders: any[]
}

export default function AdminDashboard({ products, orders }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard')
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    }
  }

  const navigation = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: BarChart3,
      description: 'Vue d\'ensemble et métriques'
    },
    {
      id: 'orders',
      label: 'Commandes',
      icon: ShoppingCart,
      description: 'Gestion complète des commandes',
      badge: orders.filter(o => o.status === 'PENDING').length
    },
    {
      id: 'products',
      label: 'Produits',
      icon: Package,
      description: 'Catalogue et inventaire',
      badge: products.length
    },
    {
      id: 'customers',
      label: 'Clients',
      icon: Users,
      description: 'Base clients et profils'
    },
    {
      id: 'discounts',
      label: 'Promotions',
      icon: Gift,
      description: 'Codes promo et réductions'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Rapports et analyses'
    },
    {
      id: 'customize',
      label: 'Personnaliser',
      icon: Palette,
      description: 'Design et contenu du site'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      description: 'Configuration générale'
    }
  ]

  const quickStats = [
    {
      title: 'Revenus du mois',
      value: `€${stats.monthlyRevenue || 0}`,
      change: `+${stats.revenueGrowth || 0}%`,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Commandes',
      value: stats.totalOrders || 0,
      change: `${stats.pendingOrders || 0} en attente`,
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      title: 'Clients',
      value: stats.totalCustomers || 0,
      change: `+${stats.newCustomers || 0} ce mois`,
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Taux de conversion',
      value: `${stats.conversionRate || 0}%`,
      change: `+${stats.conversionGrowth || 0}%`,
      icon: TrendingUp,
      color: 'orange'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Style Stripe */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Faith Shop</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`w-full text-left p-3 rounded-lg transition-colors group ${
                  activeSection === item.id
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveSection(item.id as AdminSection)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Dashboard */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Vue d'ensemble de votre boutique Faith Shop
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <Card key={index} className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {stat.title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                              {stat.value}
                            </p>
                            <p className={`text-xs mt-1 ${
                              stat.change.includes('+') ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {stat.change}
                            </p>
                          </div>
                          <div className={`h-12 w-12 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900 flex items-center justify-center`}>
                            <Icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setActiveSection('orders')}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-4">
                        <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Gérer les commandes</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {orders.filter(o => o.status === 'PENDING').length} commandes en attente
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setActiveSection('products')}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mr-4">
                        <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Ajouter des produits</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {products.length} produits dans le catalogue
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setActiveSection('customize')}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-4">
                        <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Personnaliser le site</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Modifier l'apparence et le contenu
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Commandes récentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">€{Number(order.total).toFixed(2)}</p>
                          <Badge variant="secondary">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Produits populaires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {products.slice(0, 5).map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="flex items-center">
                          {product.images && product.images[0] && (
                            <img
                              src={product.images[0].url || product.images[0].src}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              €{Number(product.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{product.status}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Other Sections */}
          {activeSection === 'orders' && <AdvancedOrderManager orders={orders} />}
          {activeSection === 'products' && <AdvancedProductManager products={products} />}
          {activeSection === 'customers' && <CustomerManager />}
          {activeSection === 'discounts' && <AdvancedDiscountManager />}
          {activeSection === 'analytics' && <AnalyticsDashboard />}
          {activeSection === 'customize' && <SiteCustomizer />}
          {activeSection === 'settings' && <div>Paramètres - En développement</div>}
        </div>
      </div>
    </div>
  )
}