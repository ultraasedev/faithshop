'use client'

import { useState, useEffect } from 'react'
import { Clock, Calendar } from 'lucide-react'

interface PreorderBannerProps {
  className?: string
  currentPage?: 'product' | 'checkout' | 'shop' | 'home'
}

interface PreorderConfig {
  enabled: boolean
  message: string
  shippingDate: string
  showPages: string[]
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

export default function PreorderBanner({
  className = "",
  currentPage = 'product'
}: PreorderBannerProps) {
  const [config, setConfig] = useState<PreorderConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/admin/preorder-config')
        if (res.ok) {
          const data = await res.json()
          setConfig(data)
        } else {
          // Default config if API fails
          setConfig({
            enabled: false,
            message: 'Expédition le 16 janvier 2025',
            shippingDate: '2025-01-16',
            showPages: ['product', 'checkout']
          })
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la config pré-commande:', error)
        setConfig({
          enabled: false,
          message: 'Expédition le 16 janvier 2025',
          shippingDate: '2025-01-16',
          showPages: ['product', 'checkout']
        })
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  // Don't render while loading or if not enabled or not on right pages
  if (loading || !config || !config.enabled || !config.showPages.includes(currentPage)) {
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
            <span>Commandez maintenant - Expédition {formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
