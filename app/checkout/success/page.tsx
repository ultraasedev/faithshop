'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, ShoppingBag, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/store/cart'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const clearCart = useCart((state) => state.clearCart)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  
  const paymentIntent = searchParams.get('payment_intent')
  const redirectStatus = searchParams.get('redirect_status')

  useEffect(() => {
    if (!paymentIntent) {
      setStatus('error')
      return
    }

    if (redirectStatus === 'succeeded') {
      setStatus('success')
      clearCart()
    } else {
      setStatus('error')
    }
  }, [paymentIntent, redirectStatus, clearCart])

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Vérification de votre commande...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-3xl font-serif font-bold mb-4">Une erreur est survenue</h1>
        <p className="text-muted-foreground mb-8">
          Nous n'avons pas pu confirmer votre paiement. Si vous avez été débité, veuillez contacter notre support.
        </p>
        <Button asChild>
          <Link href="/contact">Contacter le support</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center max-w-lg mx-auto">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-8">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-serif font-bold mb-4">Merci pour votre commande !</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Votre paiement a été validé avec succès. Vous recevrez bientôt un email de confirmation avec les détails de votre commande.
        </p>
        
        <div className="bg-muted/30 p-6 rounded-lg mb-8 text-left">
          <h3 className="font-medium mb-2">Numéro de référence :</h3>
          <p className="font-mono text-sm bg-background p-2 rounded border">{paymentIntent}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continuer mes achats
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/account/orders">
              Voir ma commande
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-20 pt-32">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
