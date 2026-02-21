// Types partagés pour l'intégration des transporteurs

export type ShippingStatusType =
  | 'PENDING'
  | 'LABEL_CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RETURNED'

export interface CarrierCredentials {
  laposte?: { apiKey: string }
  colissimo?: { contractNumber: string; password: string }
  mondialRelay?: { enseigne: string; privateKey: string }
}

export interface CarrierEvent {
  date: Date
  description: string
  location?: string
  code?: string
}

export interface TrackingResult {
  trackingNumber: string
  carrier: string
  status: ShippingStatusType
  isFinal: boolean
  events: CarrierEvent[]
}

export interface LabelResult {
  trackingNumber: string
  labelPdf: Buffer
  labelUrl?: string
  trackingUrl: string
}

export interface RelayPoint {
  id: string
  name: string
  address: string
  city: string
  zipCode: string
  country: string
  latitude: number
  longitude: number
  openingHours: string[]
  distance?: number
}

// Carriers supportés
export const SUPPORTED_CARRIERS = ['colissimo', 'chronopost', 'mondial-relay'] as const
export type SupportedCarrier = typeof SUPPORTED_CARRIERS[number]

// Mapping carrier → URL de tracking
export function getTrackingUrl(carrier: string, trackingNumber: string): string {
  const c = carrier.toLowerCase().replace(/\s+/g, '-')
  switch (c) {
    case 'colissimo':
      return `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`
    case 'chronopost':
      return `https://www.chronopost.fr/tracking-no-cms/suivi-page?liession=${trackingNumber}`
    case 'mondial-relay':
    case 'mondialrelay':
      return `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${trackingNumber}`
    case 'ups':
      return `https://www.ups.com/track?tracknum=${trackingNumber}`
    case 'dhl':
      return `https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=${trackingNumber}`
    default:
      return `https://www.google.com/search?q=suivi+colis+${trackingNumber}`
  }
}
