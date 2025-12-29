'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Menu,
  LogOut,
  Bell,
  Search,
  Palette,
  Gift,
  Tag,
  Truck
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminNavigationProps {
  session: any
}

const navigationItems = [
  {
    title: 'Vue d\'ensemble',
    items: [
      { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
      { name: 'Analytiques', href: '/admin/analytics', icon: BarChart3 },
    ]
  },
  {
    title: 'Commerce',
    items: [
      { name: 'Commandes', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Produits', href: '/admin/products', icon: Package },
      { name: 'Clients', href: '/admin/customers', icon: Users },
      { name: 'Promotions', href: '/admin/promotions', icon: Tag },
      { name: 'Cartes cadeaux', href: '/admin/gift-cards', icon: Gift },
      { name: 'Livraison', href: '/admin/shipping', icon: Truck },
    ]
  },
  {
    title: 'Configuration',
    items: [
      { name: 'Apparence', href: '/admin/appearance', icon: Palette },
      { name: 'Paramètres', href: '/admin/settings', icon: Settings },
    ]
  }
]

export function AdminNavigation({ session }: AdminNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'AD'
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/admin" className="font-serif text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          FAITH ADMIN
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        {navigationItems.map((section) => (
          <div key={section.title} className="mb-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-gray-900 dark:bg-gray-800 text-white shadow-sm"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                    )} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="h-10 w-10 rounded-lg bg-gray-900 dark:bg-gray-700 flex items-center justify-center font-bold text-sm text-white">
            {getUserInitials(session?.user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {session?.user?.name || 'Admin User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {session?.user?.email || 'admin@faith-shop.fr'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Menu Admin</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 lg:hidden" aria-hidden="true" />

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="relative flex flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              name="search"
              placeholder="Rechercher..."
              className="block h-full w-full border-0 py-0 pl-11 pr-0 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0 bg-transparent text-sm leading-6"
            />
          </div>
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}