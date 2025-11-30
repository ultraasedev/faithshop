'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

interface Banner {
  id: string
  text: string
  link?: string
  backgroundColor: string
  textColor: string
  position: string
}

// Event for notifying header about banner visibility
const BANNER_EVENT = 'promoBannerVisibilityChange'

export function dispatchBannerEvent(visible: boolean) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BANNER_EVENT, { detail: { visible } }))
  }
}

export function useBannerVisibility() {
  const [hasBanner, setHasBanner] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ visible: boolean }>
      setHasBanner(customEvent.detail.visible)
    }
    window.addEventListener(BANNER_EVENT, handler)
    return () => window.removeEventListener(BANNER_EVENT, handler)
  }, [])

  return hasBanner
}

export default function PromoBanner({ position = 'top' }: { position?: 'top' | 'bottom' }) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const dismissed = localStorage.getItem('dismissedBanners')
    if (dismissed) {
      try {
        setDismissedIds(JSON.parse(dismissed))
      } catch {
        setDismissedIds([])
      }
    }

    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const filtered = data.filter((b: Banner) => b.position === position)
          setBanners(filtered)
        }
      })
      .catch(() => setBanners([]))
  }, [position])

  const visibleBanners = banners.filter(b => !dismissedIds.includes(b.id))
  const isVisible = mounted && visibleBanners.length > 0

  // Notify header about banner visibility
  useEffect(() => {
    if (mounted && position === 'top') {
      dispatchBannerEvent(isVisible)
    }
  }, [isVisible, mounted, position])

  useEffect(() => {
    if (visibleBanners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % visibleBanners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [visibleBanners.length])

  const handleDismiss = useCallback((id: string) => {
    const newDismissed = [...dismissedIds, id]
    setDismissedIds(newDismissed)
    localStorage.setItem('dismissedBanners', JSON.stringify(newDismissed))
  }, [dismissedIds])

  if (!isVisible) return null

  const currentBanner = visibleBanners[currentIndex % visibleBanners.length]
  if (!currentBanner) return null

  return (
    <div
      className="py-2.5 px-4 text-sm font-medium flex items-center justify-center relative"
      style={{
        backgroundColor: currentBanner.backgroundColor,
        color: currentBanner.textColor,
      }}
    >
      {currentBanner.link ? (
        <Link href={currentBanner.link} className="flex-1 text-center hover:underline">
          {currentBanner.text}
        </Link>
      ) : (
        <span className="flex-1 text-center">{currentBanner.text}</span>
      )}

      <button
        onClick={() => handleDismiss(currentBanner.id)}
        className="absolute right-3 p-1 hover:opacity-70 transition-opacity"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>

      {visibleBanners.length > 1 && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
          {visibleBanners.map((_, idx) => (
            <span
              key={idx}
              className={`h-1 w-1 rounded-full transition-all ${
                idx === currentIndex % visibleBanners.length
                  ? 'bg-current opacity-100'
                  : 'bg-current opacity-40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
