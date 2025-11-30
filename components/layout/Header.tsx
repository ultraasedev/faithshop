'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { useCart } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Nouveautés', href: '/new' },
  { name: 'Collection', href: '/shop' },
  { name: 'L\'Atelier', href: '/about' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const totalItems = useCart((state) => state.getTotalItems())

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearchOpen(false)
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`) // Redirige vers shop avec filtre (à implémenter plus tard) ou page search dédiée
    }
  }

  // Effet de scroll pour le glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300 border-b border-transparent",
          scrolled ? "bg-white/80 backdrop-blur-md border-border py-2" : "bg-transparent py-4"
        )}
      >
        <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
          <div className="flex items-center justify-between">
            
            {/* Left: Navigation (Desktop) / Menu (Mobile) */}
            <div className="flex flex-1 items-center justify-start">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="-ml-2 text-foreground hover:text-primary">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link href="/" className="text-lg font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
                    <Link href="/shop" className="text-lg font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Boutique</Link>
                    <Link href="/new" className="text-lg font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Nouveautés</Link>
                    <Link href="/about" className="text-lg font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Notre Histoire</Link>
                  </nav>
                </SheetContent>
              </Sheet>

              <nav className="hidden lg:flex items-center gap-8">
                <Link href="/shop" className="text-sm font-bold uppercase tracking-[0.15em] hover:text-primary transition-colors">
                  Boutique
                </Link>
                <Link href="/new" className="text-sm font-bold uppercase tracking-[0.15em] hover:text-primary transition-colors">
                  Nouveautés
                </Link>
                <Link href="/about" className="text-sm font-bold uppercase tracking-[0.15em] hover:text-primary transition-colors">
                  Maison
                </Link>
              </nav>
            </div>

            {/* Center: Logo */}
            <div className="flex flex-1 items-center justify-center">
              <Link href="/" className="flex items-center group">
                {/* Assurez-vous d'avoir logo.png dans le dossier public */}
                <div className="relative h-16 w-40 md:h-20 md:w-48">
                  <img
                    src="/logo.png"
                    alt="Faith Shop Logo"
                    className="h-full w-full object-contain object-center transition-opacity group-hover:opacity-80"
                  />
                </div>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-1 items-center justify-end gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground hover:text-primary hover:bg-transparent"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Rechercher</span>
              </Button>
              
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary hover:bg-transparent" asChild>
                <Link href="/account">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Compte</span>
                </Link>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-foreground hover:text-primary hover:bg-transparent">
                    <ShoppingBag className="h-5 w-5" />
                    {mounted && totalItems > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {totalItems}
                      </span>
                    )}
                    <span className="sr-only">Panier</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md border-l border-border bg-background p-0 flex flex-col h-full">
                  <SheetHeader className="p-6 border-b border-border">
                    <SheetTitle className="font-serif text-2xl text-center">Votre Panier</SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex-1 overflow-y-auto p-6">
                    {totalItems === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-20" />
                        <p className="text-muted-foreground">Votre panier est vide.</p>
                        <Button variant="outline" className="mt-4" onClick={() => document.getElementById('close-cart')?.click()}>
                          Continuer vos achats
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Mock Items for Demo if cart is empty but user wants to see structure, 
                            otherwise map real items from store */}
                        <div className="flex gap-4">
                          <div className="h-24 w-20 bg-secondary relative overflow-hidden">
                             {/* Image placeholder */}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-serif text-sm font-bold">T-Shirt Signature</h4>
                            <p className="text-xs text-muted-foreground mt-1">Taille: M / Blanc</p>
                            <div className="flex justify-between items-end mt-4">
                              <span className="text-sm font-medium">45.00 €</span>
                              <div className="flex items-center border border-border">
                                <button className="px-2 py-1 text-xs hover:bg-secondary">-</button>
                                <span className="px-2 text-xs">1</span>
                                <button className="px-2 py-1 text-xs hover:bg-secondary">+</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border p-6 space-y-4 bg-secondary/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="font-medium">0.00 €</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Taxes et frais de port calculés au paiement.
                    </p>
                    <Button className="w-full h-12 rounded-none text-xs font-bold uppercase tracking-widest" asChild>
                      <Link href="/checkout">Procéder au paiement</Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex justify-end p-6">
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
              <X className="h-6 w-6" />
              <span className="sr-only">Fermer</span>
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center mt-20 px-4">
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full bg-transparent border-b-2 border-foreground py-4 text-3xl font-serif placeholder:text-muted-foreground/50 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </form>
            <p className="mt-4 text-muted-foreground text-sm">Appuyez sur Entrée pour rechercher</p>
          </div>
        </div>
      )}
    </>
  )
}
