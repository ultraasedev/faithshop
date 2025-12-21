'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Truck, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeliveryBannerProps {
  className?: string
}

export default function DeliveryBanner({ className }: DeliveryBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    // Vérifier si le bandeau a été fermé (localStorage)
    const bannerClosed = localStorage.getItem('delivery-banner-closed-2024')
    if (bannerClosed) {
      setIsVisible(false)
      return
    }

    // Calculer le temps jusqu'au 1er janvier 2025
    const targetDate = new Date('2025-01-01T00:00:00')

    const updateCountdown = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference > 0) {
        setTimeRemaining({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      } else {
        // Après le 1er janvier, masquer le bandeau
        setIsVisible(false)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('delivery-banner-closed-2024', 'true')
  }

  if (!isVisible) return null

  const isUrgent = timeRemaining.days <= 3

  return (
    <div className={cn(
      "relative overflow-hidden transition-all duration-300",
      isUrgent
        ? "bg-gradient-to-r from-red-500 via-red-600 to-red-700"
        : "bg-gradient-to-r from-green-500 via-green-600 to-green-700",
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
              {isUrgent ? (
                <Clock className="h-5 w-5 text-white animate-pulse" />
              ) : (
                <Truck className="h-5 w-5 text-white" />
              )}
              <span className="font-bold text-white text-sm sm:text-base">
                {isUrgent ? "⚠️ DERNIERS JOURS !" : "🎄 NOËL APPROCHE"}
              </span>
            </div>

            <div className="hidden sm:block h-5 w-px bg-white/30" />

            <div className="text-white text-sm sm:text-base">
              <span className="font-medium">
                {isUrgent
                  ? "Commandez MAINTENANT pour recevoir avant le 25 décembre !"
                  : "Commandez avant le 1er janvier pour une livraison avant le 25 décembre"
                }
              </span>
            </div>
          </div>

          {/* Compte à rebours */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-white">
              <Calendar className="h-4 w-4" />
              <div className="flex items-center gap-1 font-mono text-sm">
                <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
                  {timeRemaining.days.toString().padStart(2, '0')}j
                </span>
                <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
                  {timeRemaining.hours.toString().padStart(2, '0')}h
                </span>
                <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
                  {timeRemaining.minutes.toString().padStart(2, '0')}m
                </span>
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