'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  ChevronRight,
  Home,
  Plus,
  Package,
  ShoppingCart,
  FileText,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminHeaderProps {
  session: any
}

// Mapping des chemins vers les noms de breadcrumb
const pathNameMap: Record<string, string> = {
  '/admin': 'Tableau de bord',
  '/admin/analytics': 'Analytiques',
  '/admin/orders': 'Commandes',
  '/admin/products': 'Produits',
  '/admin/products/new': 'Nouveau produit',
  '/admin/collections': 'Collections',
  '/admin/customers': 'Clients',
  '/admin/promotions': 'Promotions',
  '/admin/promotions/discount-codes': 'Codes promo',
  '/admin/promotions/gift-cards': 'Cartes cadeaux',
  '/admin/pages': 'Pages',
  '/admin/menus': 'Menus',
  '/admin/media': 'Médiathèque',
  '/admin/support': 'Support',
  '/admin/support/tickets': 'Tickets',
  '/admin/support/returns': 'Retours',
  '/admin/settings': 'Paramètres',
  '/admin/settings/appearance': 'Apparence',
  '/admin/settings/shipping': 'Livraison',
  '/admin/settings/seo': 'SEO',
  '/admin/staff': 'Équipe',
}

const quickActions = [
  { name: 'Nouveau produit', href: '/admin/products/new', icon: Package },
  { name: 'Nouvelle commande', href: '/admin/orders/new', icon: ShoppingCart },
  { name: 'Nouvelle page', href: '/admin/pages/new', icon: FileText },
  { name: 'Nouveau code promo', href: '/admin/promotions/discount-codes/new', icon: Tag },
]

export function AdminHeader({ session }: AdminHeaderProps) {
  const pathname = usePathname()
  const [hasNotifications] = useState(true) // TODO: Fetch real notifications

  // Generate breadcrumb from pathname
  const generateBreadcrumb = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: { name: string; href: string }[] = []

    let currentPath = ''
    for (const segment of segments) {
      currentPath += `/${segment}`

      // Skip dynamic segments (IDs)
      if (segment.match(/^[a-z0-9]{20,}$/i)) {
        breadcrumbs.push({ name: 'Détails', href: currentPath })
        continue
      }

      const name = pathNameMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
      breadcrumbs.push({ name, href: currentPath })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumb()

  // Get current page name for mobile display
  const currentPageName = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Tableau de bord'

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Mobile: h-14, accounting for sidebar toggle button with pl-14 */}
      {/* Desktop: h-16 with normal padding */}
      <div className="flex h-14 lg:h-16 items-center justify-between pl-14 pr-3 lg:pl-6 lg:pr-8">
        {/* Mobile: Show only current page name */}
        {/* Desktop: Full breadcrumb */}
        <nav className="flex items-center min-w-0 flex-1">
          {/* Mobile view: current page only */}
          <span className="sm:hidden font-medium text-gray-900 dark:text-white text-sm truncate">
            {currentPageName}
          </span>

          {/* Desktop view: full breadcrumb */}
          <div className="hidden sm:flex items-center space-x-1 text-sm">
            <Link
              href="/admin"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <Home className="h-4 w-4" />
            </Link>
            {breadcrumbs.slice(1).map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                {index === breadcrumbs.length - 2 ? (
                  <span className="font-medium text-gray-900 dark:text-white">
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Actions - compact on mobile */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Quick Add */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1 h-8 px-2 sm:h-9 sm:px-3 sm:gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Créer</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions rapides</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickActions.map((action) => (
                <DropdownMenuItem key={action.href} asChild>
                  <Link href={action.href} className="flex items-center gap-2 cursor-pointer">
                    <action.icon className="h-4 w-4" />
                    {action.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {hasNotifications && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 sm:w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span className="text-sm">Notifications</span>
                <Button variant="ghost" size="sm" className="text-xs h-auto py-1">
                  Tout marquer lu
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-4 sm:py-6 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Aucune nouvelle notification
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
