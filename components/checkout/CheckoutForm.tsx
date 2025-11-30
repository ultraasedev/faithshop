'use client'

import { useEffect, useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()

  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!stripe) {
      return
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    )

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Paiement réussi !')
          toast.success('Paiement validé !')
          break
        case 'processing':
          setMessage('Paiement en cours de traitement.')
          break
        case 'requires_payment_method':
          setMessage('Le paiement a échoué, veuillez réessayer.')
          break
        default:
          setMessage('Une erreur est survenue.')
          break
      }
    })
  }, [stripe])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Redirection après paiement réussi
        return_url: `${window.location.origin}/checkout/success`,
      },
    })

    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message || 'Une erreur est survenue')
    } else {
      setMessage('Une erreur inattendue est survenue.')
    }

    setIsLoading(false)
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      
      {message && <div id="payment-message" className="text-red-500 text-sm">{message}</div>}
      
      <Button 
        disabled={isLoading || !stripe || !elements} 
        id="submit"
        className="w-full h-12 text-base font-bold uppercase tracking-widest"
      >
        {isLoading ? 'Traitement...' : 'Payer maintenant'}
      </Button>
    </form>
  )
}
