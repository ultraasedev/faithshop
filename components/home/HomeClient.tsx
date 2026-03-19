'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Truck, RefreshCw, ShieldCheck } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { FormEvent } from 'react'
import { toast } from 'sonner'

interface InstaPost {
  id: string
  image: string
  url: string
}

interface HomeClientProps {
  featuredProducts: any[]
  instagramUrl?: string
  instagramPosts?: InstaPost[]
}

export default function HomeClient({
  featuredProducts,
  instagramUrl,
  instagramPosts = []
}: HomeClientProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-white">
      <Header />


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

      {/* Instagram Section - Only shown if Instagram is configured in admin */}
      {instagramUrl && (() => {
        const handleMatch = instagramUrl.match(/instagram\.com\/([^/?]+)/)
        const handle = handleMatch ? handleMatch[1] : null
        return (
          <section className="py-24 border-t border-border bg-background">
            <div className="mx-auto max-w-[1600px] px-6 lg:px-12 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <h2 className="font-serif text-3xl md:text-4xl">
                  {handle ? `@${handle}` : 'Instagram'}
                </h2>
              </div>
              <p className="text-muted-foreground mb-10 max-w-md mx-auto">
                Suivez nos inspirations, coulisses et nouveautés au quotidien.
              </p>

              {/* Real Instagram posts grid */}
              {instagramPosts.filter(p => p.image).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-10">
                  {instagramPosts.filter(p => p.image).map((post) => (
                    <a
                      key={post.id}
                      href={post.url || instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square overflow-hidden bg-secondary"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest border-b border-foreground pb-1 hover:opacity-70 transition-opacity"
              >
                Suivez-nous sur Instagram <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </section>
        )
      })()}

      {/* Newsletter - Minimalist */}
      <section className="py-24 border-t border-border">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="font-serif text-3xl mb-4">Le Cercle Privé</h2>
          <p className="text-muted-foreground mb-8">
            Inscrivez-vous pour accéder à nos ventes privées et nouveautés en avant-première.
          </p>
          <form className="flex flex-col gap-4" onSubmit={async (e: FormEvent) => {
            e.preventDefault()
            const form = e.target as HTMLFormElement
            const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement
            const email = emailInput?.value?.trim()
            if (!email) return

            const btn = form.querySelector('button') as HTMLButtonElement
            btn.disabled = true
            btn.textContent = '...'

            try {
              const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              })
              const data = await res.json()
              if (res.ok) {
                toast.success('Bienvenue dans le Cercle Privé !')
                emailInput.value = ''
              } else {
                toast.error(data.error || 'Erreur lors de l\'inscription')
              }
            } catch {
              toast.error('Erreur réseau')
            } finally {
              btn.disabled = false
              btn.textContent = 'Rejoindre'
            }
          }}>
            <input
              type="email"
              placeholder="Votre adresse email"
              required
              className="w-full bg-transparent border-b border-border px-0 py-3 text-center placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none transition-colors"
            />
            <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-xs font-bold uppercase tracking-widest mt-4">
              Rejoindre
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  )
}
