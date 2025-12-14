'use client'

import { useState, useEffect } from 'react'
import { Clock, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function PreorderCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  // Date d'expédition : 16 janvier 2025
  const shippingDate = new Date('2025-01-16T00:00:00')

  useEffect(() => {
    setMounted(true)

    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = shippingDate.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return null // Évite les erreurs d'hydratation
  }

  const hasTimeLeft = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0

  if (!hasTimeLeft) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-200 mb-2">
          <Package className="h-4 w-4" />
          <span className="font-medium">Expédition en cours</span>
        </div>
        <p className="text-sm text-green-600 dark:text-green-300">
          Les commandes sont maintenant expédiées !
        </p>
      </div>
    )
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 mb-3">
        <Clock className="h-4 w-4" />
        <span className="font-medium">Pré-commande</span>
        <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-100 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-600">
          Expédition le 16 janvier
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center mb-3">
        <div className="bg-white dark:bg-gray-800 rounded-md p-2 border border-amber-200 dark:border-amber-700">
          <div className="text-lg font-bold text-amber-800 dark:text-amber-200">
            {timeLeft.days}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-300">
            jour{timeLeft.days !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-md p-2 border border-amber-200 dark:border-amber-700">
          <div className="text-lg font-bold text-amber-800 dark:text-amber-200">
            {timeLeft.hours}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-300">
            heure{timeLeft.hours !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-md p-2 border border-amber-200 dark:border-amber-700">
          <div className="text-lg font-bold text-amber-800 dark:text-amber-200">
            {timeLeft.minutes}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-300">
            min
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-md p-2 border border-amber-200 dark:border-amber-700">
          <div className="text-lg font-bold text-amber-800 dark:text-amber-200">
            {timeLeft.seconds}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-300">
            sec
          </div>
        </div>
      </div>

      <p className="text-sm text-amber-700 dark:text-amber-300">
        📦 Votre commande sera expédiée après le <strong>16 janvier 2025</strong>.
        Merci de votre patience !
      </p>
    </div>
  )
}