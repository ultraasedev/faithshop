'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Truck, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShippingBannerProps {
  className?: string
  showOnPages?: ('product' | 'checkout')[]
}

export default function ShippingBanner({
  className,
  showOnPages = ['product', 'checkout']
}: ShippingBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Vérifier si le bandeau a été fermé
    const bannerClosed = localStorage.getItem('shipping-banner-closed-2025')
    if (bannerClosed) {
      setIsVisible(false)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('shipping-banner-closed-2025', 'true')
  }

  if (!isVisible) return null

  return (
    <div className={cn(
      "relative overflow-hidden transition-all duration-300",
      "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800",
      className
    )}>
      {/* Pattern de fond */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-white/10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-white" />
              <span className="font-bold text-white text-sm sm:text-base">
                📦 EXPÉDITION
              </span>
            </div>

            <div className="hidden sm:block h-5 w-px bg-white/30" />

            <div className="text-white text-sm sm:text-base">
              <span className="font-medium">
                Reprise des expéditions le 16 janvier 2025
              </span>
            </div>
          </div>

          {/* Date d'expédition */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-white">
              <Calendar className="h-4 w-4" />
              <div className="text-sm font-medium">
                16 janvier 2025
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer le bandeau</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Animation de fond */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
      </div>
    </div>
  )
}