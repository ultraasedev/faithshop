'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Truck, RefreshCw, ShieldCheck, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface Slide {
  id: string
  image: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
}

interface HomeClientProps {
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: string
  heroCtaText?: string
  heroCtaLink?: string
  heroSlides?: string // JSON string of Slide[]
  featuredProducts: any[]
}

export default function HomeClient({
  heroTitle,
  heroSubtitle,
  heroImage,
  heroCtaText,
  heroCtaLink,
  heroSlides,
  featuredProducts
}: HomeClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Parse slides from JSON or use legacy single slide - memoized to avoid recalculation
  const slides = useMemo(() => {
    let parsedSlides: Slide[] = []

    if (heroSlides) {
      try {
        const parsed = JSON.parse(heroSlides)
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsedSlides = parsed
        }
      } catch (e) {
        console.error('Failed to parse heroSlides:', e)
      }
    }

    // Legacy single slide format if no slides parsed
    if (parsedSlides.length === 0) {
      parsedSlides = [{
        id: '1',
        image: heroImage || '/hero-bg.png',
        title: heroTitle || "L'Élégance de la Foi",
        subtitle: heroSubtitle || 'Collection Hiver 2025',
        ctaText: heroCtaText || 'Découvrir',
        ctaLink: heroCtaLink || '/shop'
      }]
    }

    return parsedSlides.map(slide => ({
      id: slide.id,
      image: slide.image || '/hero-bg.png',
      subtitle: slide.subtitle || 'Collection Hiver 2025',
      title: slide.title || "L'Élégance de la Foi",
      description: "Une expression intemporelle de spiritualité à travers des pièces d'exception.",
      cta: slide.ctaText || 'Découvrir',
      link: slide.ctaLink || '/shop',
      isVideo: slide.image?.endsWith('.mp4') || slide.image?.endsWith('.webm')
    }))
  }, [heroSlides, heroImage, heroTitle, heroSubtitle, heroCtaText, heroCtaLink])

  const slidesCount = slides.length

  // Auto-play du carrousel (désactivé s'il n'y a qu'un slide)
  useEffect(() => {
    if (slidesCount <= 1) return
    console.log('Starting auto-play timer, slides:', slidesCount)
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % slidesCount
        console.log('Auto-slide:', prev, '->', next)
        return next
      })
    }, 6000)
    return () => {
      console.log('Clearing auto-play timer')
      clearInterval(timer)
    }
  }, [slidesCount])

  const nextSlide = () => {
    console.log('Next slide clicked, current:', currentSlide, 'total:', slidesCount)
    setCurrentSlide((prev) => {
      const next = (prev + 1) % slidesCount
      console.log('Changing to:', next)
      return next
    })
  }

  const prevSlide = () => {
    console.log('Prev slide clicked, current:', currentSlide, 'total:', slidesCount)
    setCurrentSlide((prev) => {
      const next = prev === 0 ? slidesCount - 1 : prev - 1
      console.log('Changing to:', next)
      return next
    })
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[85vh] md:h-[95vh] w-full overflow-hidden bg-black">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            {/* Background Media - pointer-events-none to allow nav button clicks */}
            <div className={cn(
              "absolute inset-0 transition-transform duration-6000 ease-linear pointer-events-none",
              index === currentSlide && !slide.isVideo ? "scale-105" : "scale-100"
            )}>
              {slide.isVideo ? (
                <video
                  ref={videoRef}
                  src={slide.image}
                  className="w-full h-full object-cover brightness-[0.6]"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                />
              ) : (
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  quality={100}
                  unoptimized
                  className="object-cover object-top brightness-[0.85]"
                  priority={index === 0}
                />
              )}
            </div>
            
            {/* Video Controls (if video) */}
            {slide.isVideo && (
              <div className="absolute bottom-8 right-8 z-30 flex gap-4">
                <button onClick={togglePlay} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button onClick={toggleMute} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            )}
            
            {/* Content Overlay - pointer-events-none to allow clicks on nav buttons */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pb-12 pt-20 pointer-events-none">
              <div className="max-w-4xl mx-auto space-y-6">
                <span className="inline-block text-white/80 text-xs md:text-sm font-bold uppercase tracking-[0.2em] animate-fade-in-up">
                  {slide.subtitle}
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white leading-[1.1] animate-fade-in-up delay-100">
                  {slide.title}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200 hidden sm:block">
                  {slide.description}
                </p>
                <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300 w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto min-w-[180px] bg-white text-black hover:bg-white/90 border-none rounded-none h-12 md:h-14 text-xs md:text-sm uppercase tracking-widest font-bold" asChild>
                    <Link href={slide.link}>
                      {slide.cta}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Debug indicator - remove after testing */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-mono">
          Slide {currentSlide + 1} / {slidesCount}
        </div>

        {/* Carousel Controls (only if multiple slides) */}
        {slidesCount > 1 && (
          <>
            <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Dot clicked:', index)
                    setCurrentSlide(index)
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300 cursor-pointer",
                    index === currentSlide ? "bg-white w-12" : "bg-white/40 w-8 hover:bg-white/60"
                  )}
                  aria-label={`Aller à la slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-6 w-6 pointer-events-none" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-6 w-6 pointer-events-none" />
            </button>
          </>
        )}
      </section>


      {/* Marquee / Trust Bar */}
      <section className="border-b border-border bg-secondary/30 py-4 overflow-hidden">
        <div className="flex justify-center gap-12 md:gap-24 text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap overflow-x-auto px-4 no-scrollbar">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" /> Livraison Offerte dès 100€
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retours Gratuits sous 30 jours
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Paiement Sécurisé
          </div>
        </div>
      </section>

      {/* Featured Products - Spacious Grid */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl mb-4">Pièces Iconiques</h2>
              <p className="text-muted-foreground max-w-md">
                Nos essentiels, élevés au rang d'art. Des matières nobles et des coupes parfaites.
              </p>
            </div>
            <Link href="/shop" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest border-b border-foreground pb-1 hover:opacity-70 transition-opacity">
              Voir toute la collection <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product, index) => (
              <Link 
                key={product.id} 
                href={`/products/${product.id}`} 
                className={`group block animate-fade-in-up delay-${index * 100}`}
              >
                <div className="relative mb-6 aspect-3/4 overflow-hidden bg-secondary">
                  {product.badge && (
                    <span className="absolute left-4 top-4 z-10 bg-white/90 backdrop-blur text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                      {product.badge}
                    </span>
                  )}
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <h3 className="font-serif text-xl group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <span className="text-sm font-medium text-muted-foreground">
                    {Number(product.price).toFixed(2)} €
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section - Immersive */}
      <section className="py-24 bg-secondary/20 border-t border-border">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Star className="w-6 h-6 mx-auto mb-8 text-primary opacity-50" />
          <h2 className="font-serif text-3xl md:text-5xl mb-8 leading-tight">
            "La mode est un langage. Nous avons choisi celui de la grâce, de la simplicité et de l'authenticité."
          </h2>
          <Link href="/about" className="inline-block text-sm font-bold uppercase tracking-widest border-b border-primary pb-1 hover:opacity-70 transition-opacity">
            Lire notre manifeste
          </Link>
        </div>
      </section>

      {/* Newsletter - Minimalist */}
      <section className="py-24 border-t border-border">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="font-serif text-3xl mb-4">Le Cercle Privé</h2>
          <p className="text-muted-foreground mb-8">
            Inscrivez-vous pour accéder à nos ventes privées et nouveautés en avant-première.
          </p>
          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="w-full bg-transparent border-b border-border px-0 py-3 text-center placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none transition-colors"
            />
            <Button className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-xs font-bold uppercase tracking-widest mt-4">
              Rejoindre
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  )
}
