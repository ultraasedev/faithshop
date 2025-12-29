'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Truck, ShieldCheck, RefreshCw, Ruler, ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/store/cart'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  price: number
  description: string
  images: string[]
  colors: string[]
  sizes: string[]
  reviews?: any[] // On pourra typer mieux plus tard
}

interface ProductDetailClientProps {
  product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M')
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Unique')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const addItem = useCart((state) => state.addItem)

  const reviewsRef = useRef<HTMLDivElement>(null)

  // Image courante basée sur l'index sélectionné
  const currentImage = product.images[selectedImageIndex] || product.images[0] || '/logo2-nobg.png'

  // Swipe handlers - lower distance for easier swiping
  const minSwipeDistance = 30
  const [touchStartY, setTouchStartY] = useState<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setTouchStartY(e.targetTouches[0].clientY)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !touchStartY) return

    const currentX = e.targetTouches[0].clientX
    const currentY = e.targetTouches[0].clientY
    const diffX = Math.abs(currentX - touchStart)
    const diffY = Math.abs(currentY - touchStartY)

    // If horizontal movement is greater than vertical, it's a swipe
    if (diffX > diffY && diffX > 10) {
      e.preventDefault() // Prevent vertical scroll during horizontal swipe
    }

    setTouchEnd(currentX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && selectedImageIndex < product.images.length - 1) {
      setSelectedImageIndex(prev => prev + 1)
    }
    if (isRightSwipe && selectedImageIndex > 0) {
      setSelectedImageIndex(prev => prev - 1)
    }

    // Reset touch state
    setTouchStart(null)
    setTouchEnd(null)
    setTouchStartY(null)
  }

  const goToPrevImage = useCallback(() => {
    setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : product.images.length - 1))
  }, [product.images.length])

  const goToNextImage = useCallback(() => {
    setSelectedImageIndex(prev => (prev < product.images.length - 1 ? prev + 1 : 0))
  }, [product.images.length])

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: currentImage,
      quantity: 1,
      size: selectedSize,
      color: selectedColor
    })
    
    toast.success(`${product.name} ajouté au panier`, {
      description: `${selectedColor} - Taille ${selectedSize}`,
      action: {
        label: 'Voir le panier',
        onClick: () => document.querySelector<HTMLElement>('[data-cart-trigger]')?.click()
      }
    })

    // Ouvrir le panier automatiquement
    setTimeout(() => {
       const trigger = document.querySelector('[data-cart-trigger="true"]') as HTMLElement
       trigger?.click()
    }, 100)
  }

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Vraies reviews de la DB
  const reviews = product.reviews || []

  // Calculer la vraie moyenne des avis
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-32">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            
            {/* Gallery */}
            <div className="flex flex-col gap-4">
              {/* Main Image with Swipe */}
              <div
                className="relative aspect-[3/4] overflow-hidden bg-secondary w-full group"
                style={{ touchAction: 'manipulation' }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {(currentImage.endsWith('.mp4') || currentImage.endsWith('.webm')) ? (
                  <video
                    src={currentImage}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    muted
                    loop
                  />
                ) : (
                  <Image
                    src={currentImage}
                    alt={`${product.name} - ${selectedColor}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                )}

                {/* Navigation Arrows - visible on mobile and hover on desktop */}
                {product.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goToPrevImage}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white/90 hover:bg-white text-black shadow-lg transition-all md:opacity-0 md:group-hover:opacity-100"
                      aria-label="Image précédente"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextImage}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white/90 hover:bg-white text-black shadow-lg transition-all md:opacity-0 md:group-hover:opacity-100"
                      aria-label="Image suivante"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    {/* Dots Navigation for Mobile */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                      {product.images.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            idx === selectedImageIndex
                              ? 'bg-white w-6'
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                          aria-label={`Voir image ${idx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Swipe Hint on Mobile (shown briefly) */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 text-white/70 text-xs md:hidden flex items-center gap-1">
                      <ChevronLeft className="w-3 h-3" />
                      Swipez
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      console.log('Thumbnail clicked:', idx)
                      setSelectedImageIndex(idx)
                    }}
                    className={`relative aspect-square bg-secondary/30 overflow-hidden transition-all duration-200 ${
                      selectedImageIndex === idx
                        ? 'ring-2 ring-foreground ring-offset-2'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Vue ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 25vw, 150px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-8 border-b border-border pb-8">
                <h1 className="font-serif text-4xl md:text-5xl mb-4">{product.name}</h1>
                <div className="flex items-center gap-6 mb-6">
                  <span className="text-3xl font-light">{product.price.toFixed(2)} €</span>
                  {reviews.length > 0 ? (
                    <button onClick={scrollToReviews} className="flex items-center gap-1 group cursor-pointer">
                      <div className="flex text-primary">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-current' : 'text-muted-foreground/30'}`} />
                        ))}
                      </div>
                      <span className="text-muted-foreground text-sm ml-2 group-hover:underline decoration-primary/50 underline-offset-4 transition-all">
                        ({reviews.length} avis)
                      </span>
                    </button>
                  ) : (
                    <span className="text-muted-foreground text-sm">Aucun avis</span>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg font-light whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Countdown pré-commande supprimé - remplacé par ShippingBanner en haut de page */}

              <div className="space-y-10 mb-10">
                {/* Colors */}
                {product.colors.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Couleur : <span className="text-foreground">{selectedColor}</span></label>
                    <div className="flex gap-4 flex-wrap">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`h-12 px-6 border transition-all duration-300 ${
                            selectedColor === color 
                              ? 'border-foreground bg-foreground text-background shadow-lg' 
                              : 'border-border hover:border-foreground/50'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {product.sizes.length > 0 && (
                  <div>
                    <div className="flex justify-between mb-4 items-center">
                      <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Taille : <span className="text-foreground">{selectedSize}</span></label>
                      <button 
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="flex items-center gap-2 text-xs uppercase tracking-widest border-b border-transparent hover:border-foreground transition-all pb-0.5"
                      >
                        <Ruler className="w-4 h-4" /> Guide des tailles
                      </button>
                    </div>
                    <div className="grid grid-cols-6 gap-3">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`h-14 flex items-center justify-center border text-sm transition-all duration-200 ${
                            selectedSize === size 
                              ? 'border-foreground bg-foreground text-background shadow-md' 
                              : 'border-border hover:border-foreground'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pre-order Countdown supprimé - remplacé par ShippingBanner en haut de page */}

              {/* Premium Add to Cart Button */}
              <Button 
                size="lg" 
                className="w-full h-16 rounded-none text-base uppercase tracking-[0.2em] font-bold mb-10 bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden group" 
                onClick={handleAddToCart}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Ajouter au panier <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              {/* Reassurance */}
              <div className="grid grid-cols-1 gap-6 text-sm text-muted-foreground border-t border-border pt-8">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-secondary/30 rounded-full"><Truck className="w-5 h-5 text-foreground" /></div>
                  <span>Livraison offerte dès 100€ d'achat</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-secondary/30 rounded-full"><RefreshCw className="w-5 h-5 text-foreground" /></div>
                  <span>Retours gratuits sous 30 jours</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-secondary/30 rounded-full"><ShieldCheck className="w-5 h-5 text-foreground" /></div>
                  <span>Paiement 100% sécurisé</span>
                </div>
              </div>

              {/* Bandeau Pré-commande */}
              <div className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-3 text-white">
                  <Truck className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wide">Pré-commande</p>
                    <p className="text-white/90">Les expéditions commenceront à partir du <span className="font-bold">16 janvier 2025</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div ref={reviewsRef} className="mt-32 border-t border-border pt-20">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="font-serif text-3xl mb-4">Avis Clients</h2>
                {reviews.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-primary">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-current' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                    <span className="text-lg font-medium">{averageRating.toFixed(1)}/5</span>
                    <span className="text-muted-foreground">({reviews.length} avis)</span>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
                )}
              </div>
              <Button variant="outline" className="uppercase tracking-widest font-bold">
                Écrire un avis
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div key={review.id} className="bg-background p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-1 text-primary">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted-foreground/20'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{review.date}</span>
                  </div>
                  <h3 className="font-serif text-lg mb-4">" {review.text} "</h3>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/50">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                      {review.author.charAt(0)}
                    </div>
                    <span className="font-bold text-sm">{review.author}</span>
                    <span className="text-xs text-green-600 flex items-center gap-1 ml-auto">
                      <Check className="w-3 h-3" /> Achat vérifié
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Formulaire d'avis */}
            <div className="mt-16 max-w-2xl mx-auto bg-secondary/20 p-8 text-center">
              <h3 className="font-serif text-xl mb-4">Vous avez acheté ce produit ?</h3>
              <p className="text-muted-foreground mb-6">Partagez votre expérience avec la communauté.</p>
              <div className="p-6 border border-dashed border-border bg-background/50">
                <p className="text-sm text-muted-foreground mb-4">Vous devez être connecté pour publier un avis.</p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" asChild>
                    <Link href="/login">Se connecter</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/register">Créer un compte</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Premium Size Guide Sheet */}
        <Sheet open={isSizeGuideOpen} onOpenChange={setIsSizeGuideOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0 border-l border-border">
            <div className="p-8 h-full flex flex-col">
              <SheetHeader className="mb-8 text-left">
                <SheetTitle className="font-serif text-3xl">Guide des Tailles</SheetTitle>
                <p className="text-muted-foreground mt-2">Trouvez la coupe parfaite pour votre style.</p>
              </SheetHeader>
              
              <div className="space-y-10 flex-1">
                <div className="bg-secondary/20 p-6 border border-border/50">
                  <h3 className="font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Coupe Oversize
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Nos vêtements sont conçus pour être portés amples. Pour un effet "boxfit" tendance, prenez votre taille habituelle. Pour un rendu plus ajusté, prenez une taille en dessous.
                  </p>
                </div>
                
                <div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-foreground">
                        <th className="py-4 text-left font-bold uppercase tracking-wider w-1/3">Taille</th>
                        <th className="py-4 text-center font-normal text-muted-foreground">Poitrine</th>
                        <th className="py-4 text-center font-normal text-muted-foreground">Longueur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { s: 'XS', c: '52', l: '68' },
                        { s: 'S', c: '55', l: '70' },
                        { s: 'M', c: '58', l: '72' },
                        { s: 'L', c: '61', l: '74' },
                        { s: 'XL', c: '64', l: '76' },
                        { s: 'XXL', c: '67', l: '78' },
                      ].map((row) => (
                        <tr key={row.s} className="hover:bg-secondary/30 transition-colors">
                          <td className="py-4 font-bold">{row.s}</td>
                          <td className="py-4 text-center">{row.c} cm</td>
                          <td className="py-4 text-center">{row.l} cm</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-6 pt-6 border-t border-border">
                  <h4 className="font-serif text-xl">Comment mesurer ?</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="aspect-square bg-secondary/30 flex items-center justify-center mb-2">
                        {/* Placeholder visuel */}
                        <div className="w-16 h-1 border-b-2 border-dashed border-foreground relative">
                           <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs">Largeur</div>
                        </div>
                      </div>
                      <p className="font-bold text-sm">Poitrine</p>
                      <p className="text-xs text-muted-foreground">Mesurez à plat d'une aisselle à l'autre.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="aspect-square bg-secondary/30 flex items-center justify-center mb-2">
                         {/* Placeholder visuel */}
                         <div className="h-16 w-1 border-r-2 border-dashed border-foreground relative">
                           <div className="absolute top-1/2 -left-8 -translate-y-1/2 text-xs">Haut</div>
                        </div>
                      </div>
                      <p className="font-bold text-sm">Longueur</p>
                      <p className="text-xs text-muted-foreground">Du point le plus haut de l'épaule jusqu'en bas.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </main>
      <Footer />
    </div>
  )
}
