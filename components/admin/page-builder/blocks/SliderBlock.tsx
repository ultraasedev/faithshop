'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Slide {
  image: string
  title?: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
  alignment?: 'left' | 'center' | 'right'
}

interface SliderContent {
  slides?: Slide[]
  autoplay?: boolean
  autoplaySpeed?: number
  showArrows?: boolean
  showDots?: boolean
  height?: string
  overlay?: boolean
  overlayOpacity?: number
}

interface SliderBlockPreviewProps {
  content: Record<string, unknown>
  viewMode?: 'desktop' | 'tablet' | 'mobile'
  isPreview?: boolean
}

export function SliderBlockPreview({ content, viewMode = 'desktop', isPreview = false }: SliderBlockPreviewProps) {
  const c = content as SliderContent
  const [currentSlide, setCurrentSlide] = useState(0)

  const defaultSlides: Slide[] = [
    {
      image: '/hero-bg.png',
      title: 'Collection Hiver 2025',
      subtitle: 'Découvrez nos nouvelles pièces',
      buttonText: 'Découvrir',
      buttonLink: '/shop',
      alignment: 'center'
    }
  ]

  const slides = c.slides?.length ? c.slides : defaultSlides
  const autoplay = c.autoplay ?? true
  const autoplaySpeed = c.autoplaySpeed || 5000
  const showArrows = c.showArrows ?? true
  const showDots = c.showDots ?? true
  const height = c.height || '80vh'
  const overlay = c.overlay ?? true
  const overlayOpacity = c.overlayOpacity ?? 40

  const isMobile = viewMode === 'mobile'

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, autoplaySpeed)

    return () => clearInterval(interval)
  }, [autoplay, autoplaySpeed, slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const currentSlideData = slides[currentSlide]

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: isPreview ? '400px' : height }}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            index === currentSlide ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Background Image */}
          {slide.image ? (
            <Image
              src={slide.image}
              alt={slide.title || `Slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          ) : (
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
              "relative z-10 h-full flex items-center",
              slide.alignment === 'left' && "justify-start",
              slide.alignment === 'center' && "justify-center",
              slide.alignment === 'right' && "justify-end"
            )}
          >
            <div
              className={cn(
                "max-w-4xl px-8 text-white",
                slide.alignment === 'left' && "text-left",
                slide.alignment === 'center' && "text-center",
                slide.alignment === 'right' && "text-right"
              )}
            >
              {slide.subtitle && (
                <p className={cn(
                  "uppercase tracking-[0.3em] font-bold mb-4",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  {slide.subtitle}
                </p>
              )}
              {slide.title && (
                <h2 className={cn(
                  "font-serif font-bold mb-8",
                  isMobile ? "text-3xl" : "text-5xl md:text-7xl"
                )}>
                  {slide.title}
                </h2>
              )}
              {slide.buttonText && (
                isPreview ? (
                  <button className="px-10 py-4 bg-white text-black font-semibold rounded hover:bg-gray-100 transition-colors">
                    {slide.buttonText}
                  </button>
                ) : (
                  <Link
                    href={slide.buttonLink || '#'}
                    className="inline-block px-10 py-4 bg-white text-black font-semibold rounded hover:bg-gray-100 transition-all hover:scale-105"
                  >
                    {slide.buttonText}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                index === currentSlide
                  ? "bg-white scale-110"
                  : "bg-white/50 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
