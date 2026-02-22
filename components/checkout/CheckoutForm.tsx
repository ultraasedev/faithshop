'use client'

import { useEffect, useState } from 'react'
import {
  PaymentElement,
  AddressElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { User, Mail, Phone, Truck } from 'lucide-react'
import DeliveryOptions, { type DeliverySelection } from './DeliveryOptions'

interface CheckoutFormProps {
  shippingConfig?: {
    freeShippingThreshold: number
    standardShippingPrice: number
  }
  totalPrice?: number
  userInfo?: {
    firstName: string
    lastName: string
    email: string
    phone: string
  } | null
  defaultAddress?: {
    address: string
    addressLine2?: string
    city: string
    zipCode: string
    country: string
    phone?: string
  } | null
}

export default function CheckoutForm({ shippingConfig, totalPrice = 0, userInfo, defaultAddress }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Informations client (pre-filled if logged in)
  const [customerInfo, setCustomerInfo] = useState({
    firstName: userInfo?.firstName || '',
    lastName: userInfo?.lastName || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || ''
  })

  // Update customer info when userInfo props arrive
  useEffect(() => {
    if (userInfo) {
      setCustomerInfo(prev => ({
        firstName: prev.firstName || userInfo.firstName,
        lastName: prev.lastName || userInfo.lastName,
        email: prev.email || userInfo.email,
        phone: prev.phone || userInfo.phone,
      }))
    }
  }, [userInfo])

  // Delivery selection
  const [deliverySelection, setDeliverySelection] = useState<DeliverySelection>({
    carrier: 'colissimo',
    mode: 'home'
  })
  const [shippingZipCode, setShippingZipCode] = useState('')
  const [shippingCountry, setShippingCountry] = useState('FR')

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

    // Validation des champs obligatoires
    if (!customerInfo.firstName.trim() || !customerInfo.lastName.trim() || !customerInfo.email.trim()) {
      setMessage('Veuillez remplir tous les champs obligatoires.')
      return
    }

    // Validation email basique
    if (!customerInfo.email.includes('@')) {
      setMessage('Veuillez saisir une adresse email valide.')
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        receipt_email: customerInfo.email,
        payment_method_data: {
          billing_details: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            email: customerInfo.email,
            phone: customerInfo.phone || undefined,
          }
        }
      },
    })

    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message || 'Une erreur est survenue')
    } else {
      setMessage('Une erreur inattendue est survenue.')
    }

    setIsLoading(false)
  }

  const updateCustomerInfo = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-8">

      {/* Informations personnelles */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Informations personnelles</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              type="text"
              value={customerInfo.firstName}
              onChange={(e) => updateCustomerInfo('firstName', e.target.value)}
              placeholder="Jean"
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              type="text"
              value={customerInfo.lastName}
              onChange={(e) => updateCustomerInfo('lastName', e.target.value)}
              placeholder="Dupont"
              required
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={customerInfo.email}
              onChange={(e) => updateCustomerInfo('email', e.target.value)}
              placeholder="jean.dupont@example.com"
              required
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone (optionnel)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => updateCustomerInfo('phone', e.target.value)}
              placeholder="06 12 34 56 78"
              className="pl-10 h-11"
            />
          </div>
        </div>
      </div>

      {/* Adresse de livraison - TOUJOURS affichée */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Adresse de livraison</h3>
        <AddressElement
          options={{
            mode: 'shipping',
            allowedCountries: ['FR', 'BE', 'CH', 'LU', 'ES', 'IT', 'DE', 'NL'],
            defaultValues: defaultAddress ? {
              name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
              address: {
                line1: defaultAddress.address,
                line2: defaultAddress.addressLine2 || '',
                city: defaultAddress.city,
                postal_code: defaultAddress.zipCode,
                country: defaultAddress.country === 'France' ? 'FR' : defaultAddress.country,
              },
              phone: defaultAddress.phone || '',
            } : undefined,
            fields: {
              phone: 'always'
            },
            validation: {
              phone: {
                required: 'never'
              }
            }
          }}
          onChange={(event) => {
            if (event.complete) {
              const address = event.value.address
              if (address.postal_code) setShippingZipCode(address.postal_code)
              if (address.country) setShippingCountry(address.country)
            }
          }}
        />
      </div>

      {/* Mode de livraison */}
      {shippingZipCode && shippingConfig && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Mode de livraison</h3>
          </div>
          <DeliveryOptions
            shippingZipCode={shippingZipCode}
            shippingCountry={shippingCountry}
            onSelect={setDeliverySelection}
            standardPrice={shippingConfig.standardShippingPrice}
            freeShippingThreshold={shippingConfig.freeShippingThreshold}
            totalPrice={totalPrice}
          />
        </div>
      )}

      {/* Méthode de paiement */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Méthode de paiement</h3>
        <PaymentElement
          id="payment-element"
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'ideal', 'sepa_debit'],
          }}
        />
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.includes('réussi') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

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
