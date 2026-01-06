'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Star, Truck, ShieldCheck, RefreshCw, Ruler, ArrowRight, Check, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/store/cart'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from 'sonner'

interface ProductVideo {
  id: string
  type: string
  url: string
  thumbnail?: string | null
  title?: string | null
}

interface Product {
  id: string
  name: string
  price: number
  description: string
  images: string[]
  colors: string[]
  sizes: string[]
  videos?: ProductVideo[]
  reviews?: Array<{
    id: string
    rating: number
    text: string
    author: string
    date: string
  }>
}

interface ProductDetailClientProps {
  product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  // All media items: images first, then videos
  const allMedia = [
    ...product.images.map((url, i) => ({ type: 'image' as const, url, id: `img-${i}` })),
    ...(product.videos || []).map((v) => ({ type: 'video' as const, url: v.url, videoType: v.type, thumbnail: v.thumbnail, id: v.id }))
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M')
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Unique')
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)

  const addItem = useCart((state) => state.addItem)
  const reviewsRef = useRef<HTMLDivElement>(null)

  const totalItems = allMedia.length || 1
  const currentMedia = allMedia[currentIndex] || { type: 'image' as const, url: '/logo2-nobg.png', id: 'default' }

  // Test si React hydrate correctement
  useEffect(() => {
    console.log('🟢 REACT HYDRATED - Component mounted on client')
    alert('React hydraté! Le composant fonctionne.')
  }, [])

  // Navigation handlers
  function handlePrev() {
    setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1))
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1))
  }

  function handleDotClick(index: number) {
    setCurrentIndex(index)
  }

  function handleThumbnailClick(index: number) {
    setCurrentIndex(index)
  }

  // Cart handler
  function handleAddToCart() {
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/logo2-nobg.png',
      quantity: 1,
      size: selectedSize,
      color: selectedColor
    })

    toast.success(`${product.name} ajouté au panier`, {
      description: `${selectedColor} - Taille ${selectedSize}`,
    })

    setTimeout(() => {
      const trigger = document.querySelector('[data-cart-trigger="true"]') as HTMLElement
      trigger?.click()
    }, 100)
  }

  function scrollToReviews() {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Reviews
  const reviews = product.reviews || []
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  // YouTube/Vimeo helpers
  function getYouTubeId(url: string): string {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? match[1] : url
  }

  function getVimeoId(url: string): string {
    const match = url.match(/vimeo\.com\/(\d+)/)
    return match ? match[1] : url.split('/').pop() || ''
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-32">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">

            {/* ===================== GALLERY ===================== */}
            <div className="flex flex-col gap-4">
              {/* DEBUG - à retirer après */}
              <div style={{ background: 'yellow', padding: '10px', color: 'black', fontWeight: 'bold' }}>
                DEBUG: totalItems={totalItems}, currentIndex={currentIndex}, images={product.images.length}, videos={(product.videos || []).length}
                <button
                  onClick={() => alert('React fonctionne! Index: ' + currentIndex)}
                  style={{ marginLeft: '10px', padding: '5px 10px', background: 'red', color: 'white', cursor: 'pointer' }}
                >
                  TEST CLICK
                </button>
              </div>

              {/* Main display */}
              <div
                className="relative w-full bg-gray-100"
                style={{ aspectRatio: '3/4' }}
              >
                {currentMedia.type === 'video' ? (
                  // VIDEO
                  currentMedia.videoType === 'youtube' ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(currentMedia.url)}?rel=0`}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      title="YouTube video"
                    />
                  ) : currentMedia.videoType === 'vimeo' ? (
                    <iframe
                      src={`https://player.vimeo.com/video/${getVimeoId(currentMedia.url)}`}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                      allowFullScreen
                      title="Vimeo video"
                    />
                  ) : (
                    <video
                      key={currentMedia.url}
                      src={currentMedia.url}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'black' }}
                      controls
                      playsInline
                    />
                  )
                ) : (
                  // IMAGE - pointer-events none so buttons work
                  <img
                    src={currentMedia.url}
                    alt={product.name}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Arrow buttons */}
                {totalItems > 1 && (
                  <>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); handlePrev(); }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePrev(); }}
                      style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 9999,
                        padding: '12px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        border: 'none',
                      }}
                    >
                      <ChevronLeft style={{ width: '24px', height: '24px', color: 'black' }} />
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleNext(); }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNext(); }}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 9999,
                        padding: '12px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        border: 'none',
                      }}
                    >
                      <ChevronRight style={{ width: '24px', height: '24px', color: 'black' }} />
                    </button>
                  </>
                )}

                {/* Dots */}
                {totalItems > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 50,
                      display: 'flex',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      borderRadius: '9999px',
                    }}
                  >
                    {allMedia.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); handleDotClick(idx); }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDotClick(idx); }}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: idx === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                          border: 'none',
                          cursor: 'pointer',
                          transform: idx === currentIndex ? 'scale(1.2)' : 'scale(1)',
                          transition: 'all 0.2s',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {totalItems > 1 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                  }}
                >
                  {allMedia.map((media, idx) => (
                    <button
                      key={media.id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleThumbnailClick(idx); }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleThumbnailClick(idx); }}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        overflow: 'hidden',
                        border: idx === currentIndex ? '2px solid black' : '2px solid transparent',
                        opacity: idx === currentIndex ? 1 : 0.7,
                        cursor: 'pointer',
                        backgroundColor: '#f3f4f6',
                      }}
                    >
                      {media.type === 'video' ? (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#1f2937',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Play style={{ width: '24px', height: '24px', color: 'white' }} />
                        </div>
                      ) : (
                        <img
                          src={media.url}
                          alt={`Thumbnail ${idx + 1}`}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* ===================== END GALLERY ===================== */}

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
                      <span className="text-muted-foreground text-sm ml-2 group-hover:underline">
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

              <div className="space-y-10 mb-10">
                {/* Colors */}
                {product.colors.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                      Couleur : <span className="text-foreground">{selectedColor}</span>
                    </label>
                    <div className="flex gap-4 flex-wrap">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          type="button"
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
                      <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Taille : <span className="text-foreground">{selectedSize}</span>
                      </label>
                      <button
                        type="button"
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
                          type="button"
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

              {/* Add to Cart Button */}
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

              {/* Pre-order banner */}
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
                  <h3 className="font-serif text-lg mb-4">&quot; {review.text} &quot;</h3>
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

            {/* Review form */}
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

        {/* Size Guide Sheet */}
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
                    Nos vêtements sont conçus pour être portés amples. Pour un effet &quot;boxfit&quot; tendance, prenez votre taille habituelle. Pour un rendu plus ajusté, prenez une taille en dessous.
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
                        <div className="w-16 h-1 border-b-2 border-dashed border-foreground relative">
                           <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs">Largeur</div>
                        </div>
                      </div>
                      <p className="font-bold text-sm">Poitrine</p>
                      <p className="text-xs text-muted-foreground">Mesurez à plat d&apos;une aisselle à l&apos;autre.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="aspect-square bg-secondary/30 flex items-center justify-center mb-2">
                         <div className="h-16 w-1 border-r-2 border-dashed border-foreground relative">
                           <div className="absolute top-1/2 -left-8 -translate-y-1/2 text-xs">Haut</div>
                        </div>
                      </div>
                      <p className="font-bold text-sm">Longueur</p>
                      <p className="text-xs text-muted-foreground">Du point le plus haut de l&apos;épaule jusqu&apos;en bas.</p>
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
