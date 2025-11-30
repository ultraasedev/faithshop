'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  Package,
  BarChart3,
  LogOut,
  Search,
  Bell,
  Truck,
  Tag,
  Gift,
  Palette,
  UserCog,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
  { name: 'Commandes', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Produits', href: '/admin/products', icon: Package },
  { name: 'Clients', href: '/admin/customers', icon: Users },
  { name: 'Livraison', href: '/admin/shipping', icon: Truck },
  { name: 'Codes Promo', href: '/admin/discounts', icon: Tag },
  { name: 'Cartes Cadeaux', href: '/admin/gift-cards', icon: Gift },
  { name: 'Analyses', href: '/admin/analytics', icon: BarChart3 },
]

const settingsItems = [
  { name: 'Personnalisation', href: '/admin/settings/appearance', icon: Palette },
  { name: 'Utilisateurs Admin', href: '/admin/settings/users', icon: UserCog },
  { name: 'Pages & Contenu', href: '/admin/settings/pages', icon: FileText },
  { name: 'Paramètres', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-50 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link href="/admin" className="font-serif text-xl font-bold tracking-tight">
            FAITH ADMIN
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-gray-900" : "text-gray-400")} />
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Configuration
            </p>
            <div className="space-y-1">
              {settingsItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/admin/settings' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-gray-900" : "text-gray-400")} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@faith.com</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full h-9 pl-9 pr-4 rounded-md border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
