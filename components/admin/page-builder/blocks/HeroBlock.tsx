'use client'

import Link from 'next/link'
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
  isPreview?: boolean
}

export function HeroBlockPreview({ content, viewMode, isPreview = false }: HeroBlockPreviewProps) {
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
        "relative flex items-center justify-center",
        isPreview ? "min-h-[400px]" : "min-h-[100vh]",
        viewMode === 'mobile' && "min-h-[70vh]"
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
          "relative z-10 max-w-4xl px-8 text-white",
          alignment === 'left' && "text-left mr-auto",
          alignment === 'center' && "text-center",
          alignment === 'right' && "text-right ml-auto"
        )}
      >
        <h1
          className={cn(
            "font-serif font-bold mb-6 tracking-wide",
            isPreview ? "text-4xl" : "text-5xl md:text-7xl lg:text-8xl",
            viewMode === 'tablet' && "text-4xl",
            viewMode === 'mobile' && "text-3xl"
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            "mb-10 opacity-90 max-w-2xl mx-auto",
            isPreview ? "text-lg" : "text-xl md:text-2xl",
            viewMode === 'mobile' && "text-base"
          )}
        >
          {subtitle}
        </p>
        {buttonText && (
          isPreview ? (
            <button className="px-10 py-4 bg-white text-black font-semibold text-lg rounded hover:bg-gray-100 transition-colors">
              {buttonText}
            </button>
          ) : (
            <Link
              href={buttonLink}
              className="inline-block px-10 py-4 bg-white text-black font-semibold text-lg rounded hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              {buttonText}
            </Link>
          )
        )}
      </div>
    </div>
  )
}
