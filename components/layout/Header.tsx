'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Search, ShoppingBag, User, X, Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import PromoBanner, { useBannerVisibility } from '@/components/PromoBanner'
import { useSession } from 'next-auth/react'

const navigation = [
  { name: 'Nouveautés', href: '/new' },
  { name: 'Collection', href: '/shop' },
  { name: 'L\'Atelier', href: '/about' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const hasBanner = useBannerVisibility()
  const { data: session } = useSession()

  // Determine account link based on user role
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'
  const accountLink = isAdmin ? '/admin' : '/account'

  // Cart Store
  const items = useCart((state) => state.items)
  const totalItems = useCart((state) => state.getTotalItems())
  const totalPrice = useCart((state) => state.getTotalPrice())
  const updateQuantity = useCart((state) => state.updateQuantity)
  const removeItem = useCart((state) => state.removeItem)

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const [menuItems, setMenuItems] = useState(navigation)

  useEffect(() => {
    setMounted(true)
    // Fetch dynamic menu
    import('@/app/actions/admin/cms').then(async ({ getMenu }) => {
      try {
        const menu = await getMenu('main-menu')
        if (menu && menu.items.length > 0) {
          setMenuItems(menu.items.map((i: any) => ({ name: i.title, href: i.url })))
        }
      } catch (e) {
        console.error('Failed to load menu', e)
      }
    })
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearchOpen(false)
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Promo Banner */}
      <div className="fixed top-0 left-0 right-0 z-60">
        <PromoBanner position="top" />
      </div>

      <header
        className={cn(
          "fixed z-50 w-full transition-all duration-300 border-b border-transparent",
          hasBanner ? "top-10" : "top-0",
          scrolled
            ? "bg-background/90 backdrop-blur-md border-border py-2"
            : "bg-background/70 backdrop-blur-sm py-4"
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
                  <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link href="/" className="text-lg font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
                    {menuItems.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        className="text-lg font-medium hover:text-primary" 
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>

              <nav className="hidden lg:flex items-center gap-8">
                {menuItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className="text-sm font-bold uppercase tracking-[0.15em] hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center: Logo */}
            <div className="flex flex-1 items-center justify-center">
              <Link href="/" className="flex items-center group">
                <div className="relative h-16 w-40 md:h-20 md:w-48">
                  <img
                    src="/logo.png"
                    alt="Faith Shop Logo"
                    className="h-full w-full object-contain object-center transition-opacity group-hover:opacity-80 dark:invert"
                  />
                </div>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-1 items-center justify-end gap-1">
              <ThemeToggle />

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
                <Link href={accountLink}>
                  <User className="h-5 w-5" />
                  <span className="sr-only">Compte</span>
                </Link>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative text-foreground hover:text-primary hover:bg-transparent"
                    data-cart-trigger="true"
                  >
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
                  <SheetHeader className="p-6 border-b border-border flex flex-row items-center justify-between">
                    <SheetTitle className="font-serif text-2xl">Votre Panier ({totalItems})</SheetTitle>
                    {/* Close button is automatically added by SheetContent usually, but we can customize header */}
                  </SheetHeader>
                  
                  <div className="flex-1 overflow-y-auto p-6">
                    {totalItems === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground/20" />
                        <p className="text-muted-foreground text-lg">Votre panier est vide.</p>
                        <SheetClose asChild>
                          <Button variant="outline" className="mt-4 uppercase tracking-widest text-xs font-bold">
                            Continuer vos achats
                          </Button>
                        </SheetClose>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-4 group">
                            <div className="relative h-28 w-24 bg-secondary overflow-hidden flex-shrink-0 border border-border/50">
                               <Image 
                                 src={item.image} 
                                 alt={item.name} 
                                 fill 
                                 className="object-cover"
                               />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                              <div>
                                <div className="flex justify-between items-start">
                                  <h4 className="font-serif text-base font-medium leading-tight pr-4">{item.name}</h4>
                                  <button 
                                    onClick={() => removeItem(item.id)}
                                    className="text-muted-foreground hover:text-red-500 transition-colors p-1 -mr-1"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Supprimer</span>
                                  </button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                                  {item.color} / {item.size}
                                </p>
                              </div>
                              
                              <div className="flex justify-between items-end">
                                <div className="flex items-center border border-border rounded-sm">
                                  <button 
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="p-1.5 hover:bg-secondary transition-colors"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="p-1.5 hover:bg-secondary transition-colors"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                                <span className="font-medium text-sm">{(item.price * item.quantity).toFixed(2)} €</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {totalItems > 0 && (
                    <div className="border-t border-border p-6 space-y-4 bg-secondary/5">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sous-total</span>
                          <span className="font-medium">{totalPrice.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Livraison</span>
                          <span className="text-muted-foreground text-xs italic">Calculé à l'étape suivante</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border/50">
                        <div className="flex justify-between text-base font-bold mb-6">
                          <span>Total</span>
                          <span>{totalPrice.toFixed(2)} €</span>
                        </div>
                        <Button className="w-full h-14 rounded-none text-sm font-bold uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all" asChild>
                          <Link href="/checkout">Paiement sécurisé</Link>
                        </Button>
                      </div>
                    </div>
                  )}
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
