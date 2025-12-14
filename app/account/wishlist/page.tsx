'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, User, MapPin, Heart, FileText, RotateCcw, Loader2, Trash2, ShoppingBag } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useCart } from '@/lib/store/cart'

interface WishlistItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    price: number
    images: string[]
    colors: string[]
    sizes: string[]
    slug: string | null
  }
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const addToCart = useCart((state) => state.addItem)

  const menuItems = [
    { href: '/account', icon: Package, label: 'Mes Commandes' },
    { href: '/account/profile', icon: User, label: 'Mes Informations' },
    { href: '/account/addresses', icon: MapPin, label: 'Mes Adresses' },
    { href: '/account/wishlist', icon: Heart, label: 'Ma Liste de Souhaits', active: true },
    { href: '/account/returns', icon: RotateCcw, label: 'Mes Retours' },
    { href: '/account/invoices', icon: FileText, label: 'Mes Factures' },
  ]

  useEffect(() => {
    if (session?.user) {
      fetchWishlist()
    }
  }, [session])

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/account/wishlist')
      if (res.ok) {
        const data = await res.json()
        setWishlist(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await fetch(`/api/account/wishlist?productId=${productId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setWishlist(prev => prev.filter(item => item.productId !== productId))
        toast.success('Produit retiré de la liste')
      } else {
        toast.error('Une erreur est survenue')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    }
  }

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      productId: item.product.id,
      name: item.product.name,
      price: Number(item.product.price),
      image: item.product.images[0] || '/logo2-nobg.png',
      color: item.product.colors[0] || 'Noir',
      size: item.product.sizes[0] || 'M',
      quantity: 1
    })
    toast.success('Produit ajouté au panier')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4 md:px-8 bg-secondary/10">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-serif text-3xl md:text-4xl mb-12">Mon Compte</h1>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Sidebar Menu */}
            <div className="md:col-span-1 space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  variant={item.active ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-3 h-12"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="w-4 h-4" /> {item.label}
                  </Link>
                </Button>
              ))}
            </div>

            {/* Content Area */}
            <div className="md:col-span-3 space-y-6">
              <h2 className="font-serif text-xl">Ma Liste de Souhaits</h2>

              {wishlist.length === 0 ? (
                <div className="bg-background border border-border p-12 text-center">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">Votre liste de souhaits est vide.</p>
                  <Button asChild>
                    <Link href="/shop">Découvrir nos produits</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item) => (
                    <div key={item.id} className="bg-background border border-border group">
                      <Link href={`/product/${item.product.slug || item.product.id}`}>
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <Image
                            src={item.product.images[0] || '/logo2-nobg.png'}
                            alt={item.product.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link href={`/product/${item.product.slug || item.product.id}`}>
                          <h3 className="font-medium hover:text-primary transition-colors">{item.product.name}</h3>
                        </Link>
                        <p className="text-muted-foreground mt-1">{Number(item.product.price).toFixed(2)} &euro;</p>

                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={() => handleAddToCart(item)}
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Ajouter
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromWishlist(item.productId)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
