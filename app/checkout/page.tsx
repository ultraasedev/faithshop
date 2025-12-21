'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import { useCart } from '@/lib/store/cart'
import Link from 'next/link'
import { Loader2, CreditCard, Info, ArrowLeft, ShoppingBag, ShieldCheck, Lock, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ShippingBanner from '@/components/banners/ShippingBanner'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('')
  const [mounted, setMounted] = useState(false)
  const items = useCart((state) => state.items)
  const getTotalPrice = useCart((state) => state.getTotalPrice)

  // Fix hydration: wait for client mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || items.length === 0) return

    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => console.error('Payment intent error:', err))
  }, [items, mounted])

  // Detect dark mode
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') ||
                    window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(isDark)
    }

    checkDarkMode()

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#000000',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '0.5rem',
      colorBackground: isDarkMode ? '#0a0a0a' : '#ffffff',
      colorText: isDarkMode ? '#ffffff' : '#000000',
      colorDanger: '#dc2626',
      spacingUnit: '4px',
    },
    rules: {
      '.Tab': {
        border: isDarkMode ? '1px solid #374151' : '1px solid #E0E6EB',
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        boxShadow: isDarkMode
          ? '0px 1px 1px rgba(0, 0, 0, 0.1), 0px 3px 6px rgba(0, 0, 0, 0.05)'
          : '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02)',
      },
      '.Tab:hover': {
        color: isDarkMode ? '#f3f4f6' : 'var(--colorText)',
        backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
      },
      '.Tab--selected': {
        borderColor: '#000000',
        backgroundColor: isDarkMode ? '#000000' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        boxShadow: isDarkMode
          ? '0px 1px 1px rgba(0, 0, 0, 0.1), 0px 3px 6px rgba(0, 0, 0, 0.05), 0 0 0 2px var(--colorPrimary)'
          : '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02), 0 0 0 2px var(--colorPrimary)',
      },
      '.Input': {
        border: isDarkMode ? '1px solid #374151' : '1px solid #E0E6EB',
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        boxShadow: isDarkMode
          ? '0px 1px 1px rgba(0, 0, 0, 0.1), 0px 3px 6px rgba(0, 0, 0, 0.05)'
          : '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02)',
      },
      '.Input:focus': {
        borderColor: '#000000',
        boxShadow: isDarkMode
          ? '0px 1px 1px rgba(0, 0, 0, 0.1), 0px 3px 6px rgba(0, 0, 0, 0.05), 0 0 0 2px var(--colorPrimary)'
          : '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02), 0 0 0 2px var(--colorPrimary)',
      },
      '.Input::placeholder': {
        color: isDarkMode ? '#9ca3af' : '#6b7280',
      },
      '.Label': {
        color: isDarkMode ? '#ffffff' : '#000000',
        fontWeight: '500',
      },
      '.Error': {
        color: '#dc2626',
      }
    }
  }

  const options = {
    clientSecret,
    appearance,
  }

  // Calculate total only after mount to avoid hydration mismatch
  const totalPrice = mounted ? getTotalPrice() : 0

  const isDevMode = process.env.NODE_ENV === 'development'

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ShippingBanner showOnPages={['checkout']} />
      {/* Header simplifié pour le checkout */}
      <header className="fixed top-[60px] z-40 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/shop" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Continuer mes achats</span>
            <span className="sm:hidden">Retour</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight text-foreground">Faith-Shop</span>
            <Lock className="h-3 w-3 text-green-600" />
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ShoppingBag className="h-4 w-4" />
            <span>{items.length} <span className="hidden sm:inline">article(s)</span></span>
          </div>
        </div>
      </header>

      <main className="pt-[140px] pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
            <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-8">Ajoutez des articles à votre panier pour procéder au paiement.</p>
            <Button asChild>
              <Link href="/shop">Découvrir nos produits</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Colonne de gauche : Formulaire */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-background p-6 sm:p-8 rounded-2xl shadow-sm border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Paiement</h2>
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
                    <ShieldCheck className="h-3 w-3" />
                    100% Sécurisé
                  </div>
                </div>

                {/* Pre-order Notice */}
                <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">📦 Pré-commande</h3>
                      <p className="text-amber-700 dark:text-amber-300 mb-2">Votre commande sera expédiée après le <strong>16 janvier 2025</strong>.</p>
                      <p className="text-amber-600 dark:text-amber-400 text-xs">Merci de votre patience ! Vous recevrez une notification dès l'expédition.</p>
                    </div>
                  </div>
                </div>

                {/* Test Card Info for Development */}
                {isDevMode && (
                  <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <h3 className="font-semibold text-blue-900 mb-1">Mode Test Stripe</h3>
                        <p className="text-blue-700 mb-2">Carte de test : <code className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">4242 4242 4242 4242</code></p>
                        <p className="text-blue-600 text-xs">Exp: Future | CVC: 123 | ZIP: 75001</p>
                      </div>
                    </div>
                  </div>
                )}

                {clientSecret ? (
                  <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm />
                  </Elements>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p className="text-sm">Chargement du module de paiement...</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-6 text-muted-foreground grayscale opacity-70">
                {/* Logos de paiement */}
                <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
                <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-[10px] font-bold">MC</div>
                <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-[10px] font-bold">AMEX</div>
              </div>
            </div>

            {/* Colonne de droite : Récapitulatif */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="bg-background p-6 sm:p-8 rounded-2xl shadow-sm border border-border">
                <h2 className="text-lg font-bold mb-6">Récapitulatif de la commande</h2>

                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 py-2">
                      <div className="relative h-20 w-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                        <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md">
                          x{item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.color} / {item.size}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-sm">{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{totalPrice.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="text-green-600 font-medium">Gratuite</span>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-gray-100 mt-4">
                    <span className="font-bold text-lg">Total</span>
                    <div className="text-right">
                      <span className="font-bold text-2xl">{totalPrice.toFixed(2)} €</span>
                      <p className="text-xs text-muted-foreground mt-1">TVA incluse</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-secondary/30 p-4 rounded-xl border border-border text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                  <span>
                    <strong>Garantie satisfait ou remboursé.</strong> Vous disposez de 30 jours pour changer d'avis.
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

