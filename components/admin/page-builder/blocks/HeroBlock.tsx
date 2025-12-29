'use client'

import { cn } from '@/lib/utils'

interface HeroContent {
  title?: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
  backgroundImage?: string
  alignment?: 'left' | 'center' | 'right'
  overlay?: boolean
  overlayOpacity?: number
  // Legacy field names
  image?: string
  ctaText?: string
  ctaLink?: string
}

interface HeroBlockPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function HeroBlockPreview({ content, viewMode }: HeroBlockPreviewProps) {
  const c = content as HeroContent
  // Support both new and legacy field names
  const title = c.title || 'Titre principal'
  const subtitle = c.subtitle || 'Sous-titre accrocheur'
  const buttonText = c.buttonText || c.ctaText || 'Découvrir'
  const buttonLink = c.buttonLink || c.ctaLink || '#'
  const backgroundImage = c.backgroundImage || c.image || ''
  const alignment = c.alignment || 'center'
  const overlay = c.overlay ?? true
  const overlayOpacity = c.overlayOpacity ?? 50

  return (
    <div
      className={cn(
        "relative min-h-[400px] flex items-center justify-center",
        viewMode === 'mobile' && "min-h-[300px]"
      )}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Fallback background */}
      {!backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700" />
      )}

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}

      {/* Content */}
      <div
        className={cn(
          "relative z-10 max-w-3xl px-8 text-white",
          alignment === 'left' && "text-left mr-auto",
          alignment === 'center' && "text-center",
          alignment === 'right' && "text-right ml-auto"
        )}
      >
        <h1
          className={cn(
            "font-bold mb-4",
            viewMode === 'desktop' && "text-5xl",
            viewMode === 'tablet' && "text-4xl",
            viewMode === 'mobile' && "text-3xl"
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            "mb-8 opacity-90",
            viewMode === 'desktop' && "text-xl",
            viewMode === 'mobile' && "text-base"
          )}
        >
          {subtitle}
        </p>
        {buttonText && (
          <button className="px-8 py-3 bg-white text-black font-semibold rounded hover:bg-gray-100 transition-colors">
            {buttonText}
          </button>
        )}
      </div>
    </div>
  )
}
