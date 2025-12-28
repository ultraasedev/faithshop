'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Menu,
  LogOut,
  FileText,
  Tag,
  UserCog,
  Search as SearchIcon,
  Globe,
  ChevronDown,
  ChevronRight,
  Layers,
  Image,
  Navigation,
  TicketCheck,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  session: any
}

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
  requireSuperAdmin?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
  collapsible?: boolean
}

const getNavigationItems = (isSuperAdmin: boolean): NavSection[] => {
  const allItems: NavSection[] = [
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
        { name: 'Collections', href: '/admin/collections', icon: Layers },
        { name: 'Clients', href: '/admin/customers', icon: Users },
        { name: 'Promotions', href: '/admin/promotions', icon: Tag },
      ]
    },
    {
      title: 'Support',
      items: [
        { name: 'Tickets', href: '/admin/support/tickets', icon: TicketCheck },
        { name: 'Retours', href: '/admin/support/returns', icon: RotateCcw },
      ]
    },
    {
      title: 'Contenu',
      items: [
        { name: 'Pages', href: '/admin/pages', icon: FileText },
        { name: 'Médiathèque', href: '/admin/media', icon: Image },
        { name: 'Menus', href: '/admin/menus', icon: Navigation },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { name: 'Utilisateurs', href: '/admin/users', icon: Users },
        { name: 'Équipe', href: '/admin/staff', icon: UserCog, requireSuperAdmin: true },
        { name: 'Paramètres', href: '/admin/settings', icon: Settings },
      ]
    }
  ]

  // Filter items based on user role
  return allItems.map(section => ({
    ...section,
    items: section.items.filter(item => !item.requireSuperAdmin || isSuperAdmin)
  }))
}

export function AdminSidebar({ session }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<string[]>([])
  const pathname = usePathname()

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'
  const navigationItems = getNavigationItems(isSuperAdmin)

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'AD'
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  const toggleSection = (title: string) => {
    setCollapsedSections(prev =>
      prev.includes(title)
        ? prev.filter(s => s !== title)
        : [...prev, title]
    )
  }

  const isItemActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/admin" className="font-serif text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          FAITH ADMIN
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 text-gray-900 dark:text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {navigationItems.map((section) => {
          const isCollapsed = collapsedSections.includes(section.title)
          return (
            <div key={section.title} className="mb-6">
              <button
                onClick={() => section.collapsible && toggleSection(section.title)}
                className="w-full flex items-center justify-between px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {section.title}
                {section.collapsible && (
                  isCollapsed
                    ? <ChevronRight className="h-3 w-3" />
                    : <ChevronDown className="h-3 w-3" />
                )}
              </button>
              {!isCollapsed && (
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = isItemActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <item.icon className={cn(
                            "h-4 w-4 transition-colors",
                            isActive ? "text-white dark:text-gray-900" : "text-gray-500 dark:text-gray-400"
                          )} />
                          {item.name}
                        </span>
                        {item.badge && (
                          <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            isActive
                              ? "bg-white/20 text-white dark:bg-gray-900/20 dark:text-gray-900"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Globe className="h-4 w-4" />
          Voir le site
        </Link>
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
              {session?.user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Déconnexion"
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

      {/* Mobile menu button - rendered in header */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 bg-white dark:bg-gray-900 shadow-md"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
