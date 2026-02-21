'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  Truck,
  MapPin,
  Home,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export interface DeliverySelection {
  carrier: 'colissimo' | 'mondialrelay'
  mode: 'home' | 'relay'
  relayPointId?: string
  relayPointName?: string
  relayPointAddress?: string
}

interface RelayPoint {
  id: string
  name: string
  address: string
  city: string
  zipCode: string
  country: string
  distance?: number
  openingHours: string[]
}

interface DeliveryOptionsProps {
  shippingZipCode: string
  shippingCountry: string
  onSelect: (selection: DeliverySelection) => void
  standardPrice: number
  freeShippingThreshold: number
  totalPrice: number
}

export default function DeliveryOptions({
  shippingZipCode,
  shippingCountry,
  onSelect,
  standardPrice,
  freeShippingThreshold,
  totalPrice
}: DeliveryOptionsProps) {
  const [selected, setSelected] = useState<DeliverySelection>({
    carrier: 'colissimo',
    mode: 'home'
  })
  const [relayPoints, setRelayPoints] = useState<RelayPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [relayZipCode, setRelayZipCode] = useState(shippingZipCode)
  const [expandedRelay, setExpandedRelay] = useState<string | null>(null)
  const [mondialRelayAvailable, setMondialRelayAvailable] = useState(false)

  // Check if Mondial Relay is configured
  useEffect(() => {
    if (shippingZipCode) {
      fetch(`/api/relay-points?zipCode=${shippingZipCode}&country=${shippingCountry || 'FR'}`)
        .then(res => res.json())
        .then(data => {
          if (data.relayPoints && data.relayPoints.length > 0) {
            setMondialRelayAvailable(true)
            setRelayPoints(data.relayPoints)
          }
        })
        .catch(() => {})
    }
  }, [shippingZipCode, shippingCountry])

  const searchRelayPoints = async (zip?: string) => {
    const zipToSearch = zip || relayZipCode
    if (!zipToSearch) return
    setLoading(true)
    try {
      const res = await fetch(`/api/relay-points?zipCode=${zipToSearch}&country=${shippingCountry || 'FR'}`)
      const data = await res.json()
      setRelayPoints(data.relayPoints || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (selection: DeliverySelection) => {
    setSelected(selection)
    onSelect(selection)
  }

  const isFreeShipping = totalPrice >= freeShippingThreshold

  const deliveryOptions = [
    {
      carrier: 'colissimo' as const,
      mode: 'home' as const,
      label: 'Colissimo',
      description: 'Livraison à domicile',
      delay: '2-4 jours ouvrés',
      logo: '/logos/colissimo.svg',
      price: isFreeShipping ? 0 : standardPrice
    },
    ...(mondialRelayAvailable ? [
      {
        carrier: 'mondialrelay' as const,
        mode: 'relay' as const,
        label: 'Mondial Relay',
        description: 'Point Relais',
        delay: '3-5 jours ouvrés',
        logo: '/logos/mondial-relay.svg',
        price: isFreeShipping ? 0 : Math.max(standardPrice - 1, 2.95)
      }
    ] : [])
  ]

  return (
    <div className="space-y-3">
      {deliveryOptions.map((option) => {
        const isSelected = selected.carrier === option.carrier && selected.mode === option.mode

        return (
          <div key={`${option.carrier}-${option.mode}`}>
            <button
              type="button"
              onClick={() => handleSelect({
                carrier: option.carrier,
                mode: option.mode,
                relayPointId: option.mode === 'relay' ? selected.relayPointId : undefined,
                relayPointName: option.mode === 'relay' ? selected.relayPointName : undefined,
                relayPointAddress: option.mode === 'relay' ? selected.relayPointAddress : undefined,
              })}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                isSelected
                  ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800/50'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
              )}
            >
              <div className="h-10 w-20 relative shrink-0 rounded overflow-hidden">
                <Image
                  src={option.logo}
                  alt={option.label}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{option.label}</p>
                  <span className={cn(
                    'font-semibold',
                    option.price === 0 && 'text-green-600'
                  )}>
                    {option.price === 0 ? 'Gratuit' : `${option.price.toFixed(2)} €`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{option.description}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {option.delay}
                </p>
              </div>
            </button>

            {/* Relay Points Selector */}
            {isSelected && option.mode === 'relay' && (
              <div className="mt-2 ml-4 space-y-2">
                {/* Search */}
                <div className="flex gap-2">
                  <Input
                    value={relayZipCode}
                    onChange={(e) => setRelayZipCode(e.target.value)}
                    placeholder="Code postal"
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => searchRelayPoints()}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Rechercher'}
                  </Button>
                </div>

                {/* Relay Points List */}
                {relayPoints.length > 0 && (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {relayPoints.map((rp) => (
                      <div key={rp.id}>
                        <button
                          type="button"
                          onClick={() => {
                            const sel: DeliverySelection = {
                              carrier: 'mondialrelay',
                              mode: 'relay',
                              relayPointId: rp.id,
                              relayPointName: rp.name,
                              relayPointAddress: `${rp.address}, ${rp.zipCode} ${rp.city}`
                            }
                            setSelected(sel)
                            onSelect(sel)
                          }}
                          className={cn(
                            'w-full text-left p-2 rounded-lg border text-sm transition-all',
                            selected.relayPointId === rp.id
                              ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{rp.name}</p>
                              <p className="text-xs text-muted-foreground">{rp.address}, {rp.zipCode} {rp.city}</p>
                            </div>
                            {rp.distance && (
                              <span className="text-xs text-muted-foreground shrink-0">{rp.distance}m</span>
                            )}
                          </div>
                          {/* Opening hours toggle */}
                          {rp.openingHours.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedRelay(expandedRelay === rp.id ? null : rp.id)
                              }}
                              className="text-xs text-blue-600 mt-1 flex items-center gap-0.5"
                            >
                              Horaires
                              {expandedRelay === rp.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          )}
                          {expandedRelay === rp.id && rp.openingHours.length > 0 && (
                            <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                              {rp.openingHours.map((h, i) => (
                                <p key={i}>{h}</p>
                              ))}
                            </div>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
