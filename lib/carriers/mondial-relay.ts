import crypto from 'crypto'
import type { LabelResult, RelayPoint } from './types'

/**
 * API Mondial Relay
 * Documentation: https://www.mondialrelay.fr/media/108937/Solution-Web-Service-V2.pdf
 * Gratuit avec contrat professionnel
 * Utilise une signature MD5 (HMAC) avec la clé privée
 */

const MR_API_URL = 'https://api.mondialrelay.com/Web_Services.asmx'

/**
 * Calcule la signature MD5 pour l'API Mondial Relay
 * La signature = MD5(concat de tous les params + clé privée)
 */
function computeSignature(params: Record<string, string>, privateKey: string): string {
  const concatenated = Object.values(params).join('') + privateKey
  return crypto.createHash('md5').update(concatenated).digest('hex').toUpperCase()
}

/**
 * Appel SOAP Mondial Relay (simplifié via REST-like POST)
 */
async function callMondialRelay(action: string, params: Record<string, string>): Promise<string> {
  // Construire le XML SOAP
  const xmlParams = Object.entries(params)
    .map(([key, value]) => `<${key}>${escapeXml(value)}</${key}>`)
    .join('')

  const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mr="http://www.mondialrelay.fr/webservice/">
  <soap:Body>
    <mr:${action}>
      ${xmlParams}
    </mr:${action}>
  </soap:Body>
</soap:Envelope>`

  const response = await fetch(MR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': `http://www.mondialrelay.fr/webservice/${action}`
    },
    body: soapBody
  })

  if (!response.ok) {
    throw new Error(`Mondial Relay API error ${response.status}`)
  }

  return await response.text()
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Parse une valeur XML simple
 */
function extractXmlValue(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's')
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

/**
 * Parse les blocs XML répétés
 */
function extractXmlBlocks(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 'gs')
  const matches = [...xml.matchAll(regex)]
  return matches.map(m => m[1])
}

/**
 * Recherche de points relais par code postal
 */
export async function searchRelayPoints(params: {
  enseigne: string
  privateKey: string
  country: string
  zipCode: string
  city?: string
  latitude?: string
  longitude?: string
  nbResults?: number
}): Promise<RelayPoint[]> {
  const searchParams: Record<string, string> = {
    Enseigne: params.enseigne,
    Pays: params.country || 'FR',
    Ville: params.city || '',
    CP: params.zipCode,
    Latitude: params.latitude || '',
    Longitude: params.longitude || '',
    Taille: '',
    Poids: '',
    Action: '',
    DelaiEnvoi: '0',
    RayonRecherche: '',
    TypeActivite: '',
    NACE: '',
    NombreResultats: String(params.nbResults || 10)
  }

  searchParams.Security = computeSignature(searchParams, params.privateKey)

  const responseXml = await callMondialRelay('WSI4_PointRelais_Recherche', searchParams)

  // Vérifier le code retour
  const stat = extractXmlValue(responseXml, 'STAT')
  if (stat && stat !== '0') {
    throw new Error(`Mondial Relay erreur: code ${stat}`)
  }

  // Parser les points relais
  const pointBlocks = extractXmlBlocks(responseXml, 'PointRelais_Details')

  return pointBlocks.map(block => ({
    id: extractXmlValue(block, 'Num'),
    name: extractXmlValue(block, 'LgAdr1').trim(),
    address: extractXmlValue(block, 'LgAdr3').trim(),
    city: extractXmlValue(block, 'Ville').trim(),
    zipCode: extractXmlValue(block, 'CP').trim(),
    country: extractXmlValue(block, 'Pays').trim(),
    latitude: parseFloat(extractXmlValue(block, 'Latitude').replace(',', '.')) || 0,
    longitude: parseFloat(extractXmlValue(block, 'Longitude').replace(',', '.')) || 0,
    openingHours: parseOpeningHours(block),
    distance: parseFloat(extractXmlValue(block, 'Distance')) || undefined
  }))
}

/**
 * Parse les horaires d'ouverture depuis le XML MR
 */
function parseOpeningHours(block: string): string[] {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
  const hours: string[] = []

  days.forEach((day, i) => {
    const dayNum = String(i + 1).padStart(2, '0')
    const h1 = extractXmlValue(block, `Horaires_${dayNum}`)
    if (h1 && h1.trim() !== '0000 0000 0000 0000') {
      const parts = h1.trim().split(' ')
      const morning = parts[0] !== '0000' && parts[1] !== '0000' ? `${formatTime(parts[0])}-${formatTime(parts[1])}` : ''
      const afternoon = parts[2] !== '0000' && parts[3] !== '0000' ? `${formatTime(parts[2])}-${formatTime(parts[3])}` : ''
      const timeStr = [morning, afternoon].filter(Boolean).join(' / ')
      if (timeStr) hours.push(`${day}: ${timeStr}`)
    }
  })

  return hours
}

function formatTime(time: string): string {
  return `${time.substring(0, 2)}:${time.substring(2, 4)}`
}

/**
 * Génère une étiquette Mondial Relay
 */
export async function generateLabel(params: {
  enseigne: string
  privateKey: string
  sender: {
    name: string
    address: string
    city: string
    zipCode: string
    countryCode: string
    phone?: string
    email?: string
  }
  recipient: {
    name: string
    address: string
    city: string
    zipCode: string
    countryCode: string
    phone?: string
    email?: string
  }
  weight: number // en grammes
  orderNumber?: string
  deliveryMode: 'relay' | 'home'
  relayPointId?: string
}): Promise<LabelResult> {
  // Mode de livraison: 24R = Point Relais, HOM = Domicile
  const modeCol = params.deliveryMode === 'relay' ? '24R' : 'HOM'

  const labelParams: Record<string, string> = {
    Enseigne: params.enseigne,
    ModeCol: modeCol,
    ModeLiv: '24R',
    NDossier: params.orderNumber || '',
    NClient: '',
    Expe_Langage: 'FR',
    Expe_Ad1: params.sender.name.substring(0, 32),
    Expe_Ad2: '',
    Expe_Ad3: params.sender.address.substring(0, 32),
    Expe_Ad4: '',
    Expe_Ville: params.sender.city.substring(0, 26),
    Expe_CP: params.sender.zipCode,
    Expe_Pays: params.sender.countryCode,
    Expe_Tel1: params.sender.phone?.replace(/\s/g, '') || '',
    Expe_Tel2: '',
    Expe_Mail: params.sender.email || '',
    Dest_Langage: 'FR',
    Dest_Ad1: params.recipient.name.substring(0, 32),
    Dest_Ad2: '',
    Dest_Ad3: params.recipient.address.substring(0, 32),
    Dest_Ad4: '',
    Dest_Ville: params.recipient.city.substring(0, 26),
    Dest_CP: params.recipient.zipCode,
    Dest_Pays: params.recipient.countryCode,
    Dest_Tel1: params.recipient.phone?.replace(/\s/g, '') || '',
    Dest_Tel2: '',
    Dest_Mail: params.recipient.email || '',
    Poids: String(Math.round(params.weight * 1000)), // Grammes
    Longueur: '',
    Taille: '',
    NbColis: '1',
    CRT_Valeur: '0',
    CRT_Devise: 'EUR',
    Exp_Valeur: '',
    Exp_Devise: '',
    COL_Rel_Pays: params.deliveryMode === 'relay' ? params.recipient.countryCode : '',
    COL_Rel: params.relayPointId || '',
    LIV_Rel_Pays: params.deliveryMode === 'relay' ? params.recipient.countryCode : '',
    LIV_Rel: params.relayPointId || '',
    TAvisage: '',
    TRepworking: '',
    TInstructions: '',
    Insurance: '0',
    Assembly: '0',
    TEXTE: ''
  }

  labelParams.Security = computeSignature(labelParams, params.privateKey)

  const responseXml = await callMondialRelay('WSI2_CreationEtiquette', labelParams)

  const stat = extractXmlValue(responseXml, 'STAT')
  if (stat && stat !== '0') {
    throw new Error(`Mondial Relay erreur création étiquette: code ${stat}`)
  }

  const trackingNumber = extractXmlValue(responseXml, 'ExpeditionNum')
  if (!trackingNumber) {
    throw new Error('Mondial Relay: pas de numéro d\'expédition reçu')
  }

  // URL de l'étiquette
  const labelUrlPart = extractXmlValue(responseXml, 'URL_Etiquette')
  const labelUrl = labelUrlPart ? `https://www.mondialrelay.com${labelUrlPart}` : undefined

  return {
    trackingNumber: trackingNumber.trim(),
    labelPdf: Buffer.alloc(0), // MR fournit une URL, pas un PDF directement
    labelUrl,
    trackingUrl: `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${trackingNumber.trim()}`
  }
}
