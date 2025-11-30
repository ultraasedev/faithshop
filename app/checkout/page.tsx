'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import { useCart } from '@/lib/store/cart'
import Link from 'next/link'
import { Loader2, CreditCard, Info, ArrowLeft, ShoppingBag } from 'lucide-react'

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

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#000000',
    },
  }

  const options = {
    clientSecret,
    appearance,
  }

  // Calculate total only after mount to avoid hydration mismatch
  const totalPrice = mounted ? getTotalPrice() : 0

  const isDevMode = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplifié pour le checkout */}
      <header className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/shop" className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Continuer mes achats
            </Link>
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="Faith Shop" className="h-12 w-auto" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShoppingBag className="h-4 w-4" />
              <span>{mounted ? items.length : 0} article(s)</span>
            </div>
          </div>
        </div>
      </header>
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl mb-10 text-center">Paiement Sécurisé</h1>

        {/* Test Card Info for Development */}
        {isDevMode && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Mode Test Stripe</h3>
                <p className="text-sm text-yellow-700 mb-3">Utilisez ces cartes de test pour simuler des paiements :</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 bg-white p-2 rounded border">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <code className="font-mono text-green-700">4242 4242 4242 4242</code>
                    <span className="text-gray-500">- Paiement réussi</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded border">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <code className="font-mono text-red-700">4000 0000 0000 0002</code>
                    <span className="text-gray-500">- Carte refusée</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded border">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <code className="font-mono text-blue-700">4000 0025 0000 3155</code>
                    <span className="text-gray-500">- 3D Secure requis</span>
                  </div>
                </div>
                <p className="text-xs text-yellow-600 mt-3">
                  Date exp: n'importe quelle date future | CVC: 3 chiffres | Code postal: n'importe lequel
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Récapitulatif Panier */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 order-2 lg:order-1">
            <h2 className="font-bold text-lg mb-6 uppercase tracking-widest">Votre Commande</h2>

            {!mounted ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Votre panier est vide</p>
              </div>
            ) : (
              <>
                <div className="space-y-6 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-12 bg-gray-100">
                          <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.color} / {item.size} x {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-medium">{(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{totalPrice.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>Calculé à l'étape suivante</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-4">
                    <span>Total</span>
                    <span>{totalPrice.toFixed(2)} €</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Formulaire Stripe */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 order-1 lg:order-2">
            {!mounted || items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Ajoutez des articles à votre panier pour continuer</p>
              </div>
            ) : clientSecret ? (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            ) : (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer simplifié */}
      <footer className="border-t border-gray-200 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Faith Shop. Paiement sécurisé par Stripe.
          </p>
        </div>
      </footer>
    </div>
  )
}
