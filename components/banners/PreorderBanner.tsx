import { Clock, Calendar } from 'lucide-react'
import { prisma } from '@/lib/prisma'

interface PreorderBannerProps {
  className?: string
  currentPage?: 'product' | 'checkout' | 'shop' | 'home'
}

async function getPreorderConfig() {
  try {
    const configs = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: ['preorder_enabled', 'preorder_message', 'preorder_shipping_date', 'preorder_show_pages']
        }
      }
    })

    const configMap = configs.reduce((acc, config) => {
      let value = config.value
      if (config.type === 'boolean') {
        value = config.value === 'true'
      } else if (config.type === 'json') {
        try {
          value = JSON.parse(config.value)
        } catch {
          value = config.value
        }
      }
      acc[config.key] = value
      return acc
    }, {} as Record<string, any>)

    return {
      enabled: configMap.preorder_enabled ?? false,
      message: configMap.preorder_message ?? 'Expédition le 16 janvier 2025',
      shippingDate: configMap.preorder_shipping_date ?? '2025-01-16',
      showPages: configMap.preorder_show_pages ?? ['product', 'checkout']
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la config pré-commande:', error)
    return {
      enabled: false,
      message: 'Expédition le 16 janvier 2025',
      shippingDate: '2025-01-16',
      showPages: ['product', 'checkout']
    }
  }
}

function formatShippingDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  } catch {
    return '16 janvier 2025'
  }
}

export default async function PreorderBanner({
  className = "",
  currentPage = 'product'
}: PreorderBannerProps) {
  const config = await getPreorderConfig()

  // Ne pas afficher si pas activé ou pas sur les bonnes pages
  if (!config.enabled || !config.showPages.includes(currentPage)) {
    return null
  }

  const formattedDate = formatShippingDate(config.shippingDate)

  return (
    <div className={`bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3 text-sm md:text-base">
          <div className="flex items-center gap-2 text-amber-800">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="font-medium">Pré-commande</span>
          </div>

          <div className="hidden sm:block w-px h-4 bg-amber-300"></div>

          <div className="flex items-center gap-2 text-amber-700">
            <Calendar className="w-4 h-4" />
            <span>{config.message}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
            <span>Commandez maintenant • Expédition {formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}