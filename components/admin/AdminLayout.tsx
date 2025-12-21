'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Sun,
  Moon,
  Home,
  TrendingUp,
  Gift,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import AdminDashboard from './AdminDashboard'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'
import AdminUsers from './AdminUsers'
import AdminSettings from './AdminSettings'

type AdminSection = 'dashboard' | 'products' | 'orders' | 'users' | 'settings'

interface AdminData {
  products: any[]
  orders: any[]
  users: any[]
}

interface AdminLayoutProps {
  initialData: AdminData
}

export default function AdminLayout({ initialData }: AdminLayoutProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard')
  const [data, setData] = useState(initialData)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navigation = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: BarChart3,
      description: 'Vue d\'ensemble'
    },
    {
      id: 'products',
      label: 'Produits',
      icon: Package,
      description: 'Gestion des produits',
      badge: data.products?.length || 0
    },
    {
      id: 'orders',
      label: 'Commandes',
      icon: ShoppingCart,
      description: 'Gestion des commandes',
      badge: data.orders?.filter(o => o.status === 'PENDING')?.length || 0
    },
    {
      id: 'users',
      label: 'Clients',
      icon: Users,
      description: 'Gestion des clients',
      badge: data.users?.length || 0
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      description: 'Configuration'
    }
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Faith Shop</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Administration</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveSection(item.id as AdminSection)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Faith Shop Admin v2.0
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="h-full">
          {activeSection === 'dashboard' && <AdminDashboard data={data} />}
          {activeSection === 'products' && <AdminProducts data={data} onUpdate={setData} />}
          {activeSection === 'orders' && <AdminOrders data={data} onUpdate={setData} />}
          {activeSection === 'users' && <AdminUsers data={data} onUpdate={setData} />}
          {activeSection === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  )
}