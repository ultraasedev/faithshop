import type { TrackingResult, CarrierEvent, ShippingStatusType } from './types'

/**
 * API La Poste Suivi v2 - Tracking Colissimo + Chronopost
 * https://developer.laposte.fr/
 * Gratuit - ~2000 appels/jour
 */

interface LaPosteTimelineEntry {
  shortLabel: string
  longLabel: string
  date: string
  country?: string
  status: boolean
  type: number
}

interface LaPosteEvent {
  date: string
  code: string
  label: string
}

interface LaPosteShipment {
  idShip: string
  holder: number
  product: string
  isFinal: boolean
  entryDate?: string
  deliveryDate?: string
  timeline?: LaPosteTimelineEntry[]
  event?: LaPosteEvent[]
}

interface LaPosteResponse {
  lang: string
  scope: string
  returnCode: number
  returnMessage: string
  shipment: LaPosteShipment
}

/**
 * Mappe le type de timeline La Poste vers notre enum ShippingStatus
 * type 1 = Pris en charge
 * type 2 = En cours d'acheminement
 * type 3 = En cours de livraison
 * type 4 = Livré
 * type 5 = Retourné / Instance
 */
export function mapTimelineTypeToStatus(type: number): ShippingStatusType {
  switch (type) {
    case 1: return 'PICKED_UP'
    case 2: return 'IN_TRANSIT'
    case 3: return 'OUT_FOR_DELIVERY'
    case 4: return 'DELIVERED'
    case 5: return 'RETURNED'
    default: return 'IN_TRANSIT'
  }
}

/**
 * Détermine le statut actuel depuis la timeline La Poste
 */
function getCurrentStatus(timeline: LaPosteTimelineEntry[]): ShippingStatusType {
  // Trouver le dernier événement avec status=true (atteint)
  const reached = timeline.filter(t => t.status === true)
  if (reached.length === 0) return 'PENDING'

  // Le type le plus élevé atteint détermine le statut
  const maxType = Math.max(...reached.map(t => t.type))
  return mapTimelineTypeToStatus(maxType)
}

/**
 * Appel à l'API La Poste Suivi v2
 */
export async function trackShipment(trackingNumber: string, apiKey: string): Promise<TrackingResult> {
  const url = `https://api.laposte.fr/suivi/v2/idships/${encodeURIComponent(trackingNumber)}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-Okapi-Key': apiKey
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`La Poste API error ${response.status}: ${errorText}`)
  }

  const data: LaPosteResponse = await response.json()

  if (data.returnCode !== 200 && data.returnCode !== 207) {
    throw new Error(`La Poste API: ${data.returnMessage} (code ${data.returnCode})`)
  }

  const shipment = data.shipment
  const events: CarrierEvent[] = []

  // Extraire les événements depuis la timeline
  if (shipment.timeline) {
    for (const entry of shipment.timeline) {
      if (entry.status) {
        events.push({
          date: new Date(entry.date),
          description: entry.longLabel || entry.shortLabel,
          location: entry.country || undefined
        })
      }
    }
  }

  // Ajouter les événements détaillés
  if (shipment.event) {
    for (const evt of shipment.event) {
      // Éviter les doublons avec la timeline
      const exists = events.some(e =>
        Math.abs(e.date.getTime() - new Date(evt.date).getTime()) < 60000 &&
        e.description === evt.label
      )
      if (!exists) {
        events.push({
          date: new Date(evt.date),
          description: evt.label,
          code: evt.code
        })
      }
    }
  }

  // Trier par date (plus récent en premier)
  events.sort((a, b) => b.date.getTime() - a.date.getTime())

  const status = shipment.timeline
    ? getCurrentStatus(shipment.timeline)
    : 'PENDING'

  return {
    trackingNumber: shipment.idShip,
    carrier: shipment.product || 'Colissimo',
    status,
    isFinal: shipment.isFinal,
    events
  }
}

/**
 * Teste la connexion à l'API La Poste
 */
export async function testConnection(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    // Appel avec un numéro bidon pour tester l'auth
    const url = 'https://api.laposte.fr/suivi/v2/idships/0000000000'
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Okapi-Key': apiKey
      }
    })

    // 404 = auth OK mais colis pas trouvé (normal)
    // 401/403 = auth échouée
    if (response.status === 401 || response.status === 403) {
      return { ok: false, error: 'Clé API invalide' }
    }

    return { ok: true }
  } catch (error: any) {
    return { ok: false, error: error.message }
  }
}
