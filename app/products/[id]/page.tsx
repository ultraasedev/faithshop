'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Star, Truck, ShieldCheck, RefreshCw, Ruler, ArrowRight, Check } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/store/cart'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from 'sonner'

// Mock Data
const getProduct = (id: string) => {
  return {
    id: parseInt(id),
    name: 'T-Shirt Signature',
    price: 45.00,
    description: "Le T-Shirt Signature incarne l'essence de Faith Shop. Fabriqué à partir de coton biologique épais (240gsm), il offre une coupe oversize structurée et un confort absolu. L'impression 'Faith' au dos est réalisée en sérigraphie haute densité pour une durabilité exceptionnelle.",
    images: [
      '/products/tshirt-white.png',
      '/products/tshirt-white-back.png', 
      '/products/tshirt-white-detail.png'
    ],
    colorImages: {
      'Blanc': '/products/tshirt-white.png',
      'Noir': '/products/hoodie-black.png',
      'Beige': '/products/tshirt-beige.png'
    },
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Blanc', 'Noir', 'Beige'],
    reviews: [
      { id: 1, author: "Thomas L.", rating: 5, date: "Il y a 2 jours", text: "Qualité incroyable, le coton est vraiment épais et la coupe est parfaite." },
      { id: 2, author: "Sarah M.", rating: 5, date: "Il y a 1 semaine", text: "Très beau message et très belle qualité. Je recommande." },
      { id: 3, author: "David P.", rating: 4, date: "Il y a 2 semaines", text: "Taille un peu grand (oversize oblige), mais le style est top." }
    ]
  }
}

export default function ProductPage() {
  const params = useParams()
  const product = getProduct(params.id as string)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('Blanc')
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const addItem = useCart((state) => state.addItem)
  
  const reviewsRef = useRef<HTMLDivElement>(null)

  const currentImage = product.colorImages[selectedColor as keyof typeof product.colorImages] || product.images[0]

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id.toString(),
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-32">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            
            {/* Gallery */}
            <div className="flex flex-col gap-4">
              <div className="relative aspect-3/4 overflow-hidden bg-secondary w-full group">
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
                    key={selectedColor}
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="relative aspect-square bg-secondary/30"></div>
                 <div className="relative aspect-square bg-secondary/30"></div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-8 border-b border-border pb-8">
                <h1 className="font-serif text-4xl md:text-5xl mb-4">{product.name}</h1>
                <div className="flex items-center gap-6 mb-6">
                  <span className="text-3xl font-light">{product.price.toFixed(2)} €</span>
                  <button onClick={scrollToReviews} className="flex items-center gap-1 group cursor-pointer">
                    <div className="flex text-primary">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="fill-current w-4 h-4" />
                      ))}
                    </div>
                    <span className="text-muted-foreground text-sm ml-2 group-hover:underline decoration-primary/50 underline-offset-4 transition-all">
                      ({product.reviews.length} avis)
                    </span>
                  </button>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg font-light">
                  {product.description}
                </p>
              </div>

              <div className="space-y-10 mb-10">
                {/* Colors */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Couleur : <span className="text-foreground">{selectedColor}</span></label>
                  <div className="flex gap-4">
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

                {/* Sizes */}
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
              </div>

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
            </div>
          </div>

          {/* Reviews Section */}
          <div ref={reviewsRef} className="mt-32 border-t border-border pt-20">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="font-serif text-3xl mb-4">Avis Clients</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="fill-current w-5 h-5" />
                    ))}
                  </div>
                  <span className="text-lg font-medium">4.8/5</span>
                  <span className="text-muted-foreground">({product.reviews.length} avis)</span>
                </div>
              </div>
              <Button variant="outline" className="uppercase tracking-widest font-bold">
                Écrire un avis
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {product.reviews.map((review) => (
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

            {/* Mock Review Form (Collapsed) */}
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
