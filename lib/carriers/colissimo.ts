import type { LabelResult } from './types'

/**
 * API Colissimo - Génération d'étiquettes
 * Documentation: https://www.colissimo.entreprise.laposte.fr/system/files/imagescontent/docs/spec_techni_webservices_rest.pdf
 * Gratuit avec contrat professionnel
 */

const COLISSIMO_API_URL = 'https://ws.colissimo.fr/sls-ws/SlsServiceWSRest/2.0/generateLabel'

interface ColissimoAddress {
  companyName?: string
  lastName: string
  firstName: string
  line0?: string
  line1?: string
  line2: string
  line3?: string
  countryCode: string
  city: string
  zipCode: string
  phoneNumber?: string
  mobileNumber?: string
  email?: string
}

interface ColissimoLabelRequest {
  contractNumber: string
  password: string
  outputFormat: {
    x: number
    y: number
    outputPrintingType: string
  }
  letter: {
    service: {
      productCode: string
      depositDate: string
      orderNumber?: string
      totalAmount?: number
    }
    parcel: {
      weight: number
    }
    sender: {
      address: ColissimoAddress
    }
    addressee: {
      address: ColissimoAddress
    }
  }
}

interface ColissimoLabelResponse {
  messages: Array<{
    id: string
    type: string
    messageContent: string
  }>
  labelV2Response?: {
    parcelNumber: string
    parcelNumberPartner?: string
    pdfUrl?: string
  }
}

/**
 * Determine le code produit Colissimo selon le pays
 */
function getProductCode(countryCode: string): string {
  if (countryCode === 'FR') return 'DOM' // Domicile sans signature
  if (['BE', 'LU', 'NL', 'DE', 'IT', 'ES', 'PT', 'AT', 'IE'].includes(countryCode)) return 'DOS' // Europe domicile avec signature
  return 'COLI' // International
}

/**
 * Formatte la date au format DD/MM/YYYY pour Colissimo
 */
function formatDepositDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/**
 * Génère une étiquette Colissimo
 */
export async function generateLabel(params: {
  contractNumber: string
  password: string
  sender: {
    companyName?: string
    firstName: string
    lastName: string
    address: string
    city: string
    zipCode: string
    countryCode: string
    phone?: string
    email?: string
  }
  recipient: {
    firstName: string
    lastName: string
    address: string
    city: string
    zipCode: string
    countryCode: string
    phone?: string
    email?: string
  }
  weight: number
  orderNumber?: string
  totalAmount?: number
}): Promise<LabelResult> {
  const productCode = getProductCode(params.recipient.countryCode)
  const depositDate = formatDepositDate(new Date())

  const requestBody: ColissimoLabelRequest = {
    contractNumber: params.contractNumber,
    password: params.password,
    outputFormat: {
      x: 0,
      y: 0,
      outputPrintingType: 'PDF_10x15_300dpi'
    },
    letter: {
      service: {
        productCode,
        depositDate,
        orderNumber: params.orderNumber,
        totalAmount: params.totalAmount ? Math.round(params.totalAmount * 100) : undefined
      },
      parcel: {
        weight: params.weight
      },
      sender: {
        address: {
          companyName: params.sender.companyName,
          lastName: params.sender.lastName,
          firstName: params.sender.firstName,
          line2: params.sender.address,
          countryCode: params.sender.countryCode,
          city: params.sender.city,
          zipCode: params.sender.zipCode,
          phoneNumber: params.sender.phone,
          email: params.sender.email
        }
      },
      addressee: {
        address: {
          lastName: params.recipient.lastName,
          firstName: params.recipient.firstName,
          line2: params.recipient.address,
          countryCode: params.recipient.countryCode,
          city: params.recipient.city,
          zipCode: params.recipient.zipCode,
          mobileNumber: params.recipient.phone,
          email: params.recipient.email
        }
      }
    }
  }

  // Colissimo API attend un multipart/form-data avec la requête JSON
  const formData = new FormData()
  formData.append('generateLabelRequest', new Blob([JSON.stringify(requestBody)], { type: 'application/json' }))

  const response = await fetch(COLISSIMO_API_URL, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Colissimo API error ${response.status}: ${text}`)
  }

  // Colissimo retourne un multipart response avec le JSON + le PDF
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    // Erreur - réponse JSON uniquement (pas de PDF)
    const data: ColissimoLabelResponse = await response.json()
    const errors = data.messages?.filter(m => m.type === 'ERROR') || []
    if (errors.length > 0) {
      throw new Error(`Colissimo: ${errors.map(e => e.messageContent).join(', ')}`)
    }
    throw new Error('Colissimo: Réponse inattendue sans PDF')
  }

  // Réponse multipart: extraire JSON et PDF
  const buffer = Buffer.from(await response.arrayBuffer())

  // Parse le multipart manuellement
  const boundary = contentType.split('boundary=')[1]
  if (!boundary) {
    throw new Error('Colissimo: boundary manquant dans la réponse multipart')
  }

  const parts = splitMultipart(buffer, boundary)

  let jsonPart: ColissimoLabelResponse | null = null
  let pdfPart: Buffer | null = null

  for (const part of parts) {
    if (part.contentType?.includes('application/json')) {
      jsonPart = JSON.parse(part.body.toString('utf-8'))
    } else if (part.contentType?.includes('application/pdf')) {
      pdfPart = part.body
    }
  }

  if (!jsonPart?.labelV2Response?.parcelNumber) {
    const errors = jsonPart?.messages?.filter(m => m.type === 'ERROR') || []
    throw new Error(`Colissimo: ${errors.map(e => e.messageContent).join(', ') || 'Pas de numéro de colis'}`)
  }

  if (!pdfPart) {
    throw new Error('Colissimo: PDF manquant dans la réponse')
  }

  const trackingNumber = jsonPart.labelV2Response.parcelNumber

  return {
    trackingNumber,
    labelPdf: pdfPart,
    trackingUrl: `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`
  }
}

/**
 * Parse multipart response
 */
function splitMultipart(buffer: Buffer, boundary: string): Array<{ contentType?: string; body: Buffer }> {
  const boundaryBuffer = Buffer.from(`--${boundary}`)
  const parts: Array<{ contentType?: string; body: Buffer }> = []

  let start = 0
  while (true) {
    const boundaryIndex = buffer.indexOf(boundaryBuffer, start)
    if (boundaryIndex === -1) break

    if (start > 0) {
      // Extract part between previous boundary and this one
      const partBuffer = buffer.subarray(start, boundaryIndex)
      const headerEnd = partBuffer.indexOf('\r\n\r\n')
      if (headerEnd !== -1) {
        const headerStr = partBuffer.subarray(0, headerEnd).toString('utf-8')
        const contentTypeMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i)
        const body = partBuffer.subarray(headerEnd + 4, partBuffer.length - 2) // Remove trailing \r\n
        parts.push({
          contentType: contentTypeMatch?.[1],
          body
        })
      }
    }

    start = boundaryIndex + boundaryBuffer.length + 2 // Skip boundary + \r\n
  }

  return parts
}

/**
 * Teste la connexion Colissimo
 */
export async function testColissimoConnection(contractNumber: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    // On utilise l'API checkGenerateLabel qui valide les credentials sans créer d'étiquette
    const url = 'https://ws.colissimo.fr/sls-ws/SlsServiceWSRest/2.0/checkGenerateLabel'
    const requestBody = {
      contractNumber,
      password,
      outputFormat: { x: 0, y: 0, outputPrintingType: 'PDF_10x15_300dpi' },
      letter: {
        service: { productCode: 'DOM', depositDate: formatDepositDate(new Date()) },
        parcel: { weight: 1 },
        sender: { address: { lastName: 'Test', firstName: 'Test', line2: '1 rue test', countryCode: 'FR', city: 'Paris', zipCode: '75001' } },
        addressee: { address: { lastName: 'Test', firstName: 'Test', line2: '1 rue test', countryCode: 'FR', city: 'Paris', zipCode: '75001' } }
      }
    }

    const formData = new FormData()
    formData.append('checkGenerateLabelRequest', new Blob([JSON.stringify(requestBody)], { type: 'application/json' }))

    const response = await fetch(url, { method: 'POST', body: formData })
    const data = await response.json()

    const errors = data.messages?.filter((m: any) => m.type === 'ERROR' && m.id !== 'FIELD_REQUIRED') || []
    const authErrors = errors.filter((e: any) => e.messageContent?.toLowerCase().includes('authentification') || e.messageContent?.toLowerCase().includes('authentication'))

    if (authErrors.length > 0) {
      return { ok: false, error: 'Identifiants invalides' }
    }

    return { ok: true }
  } catch (error: any) {
    return { ok: false, error: error.message }
  }
}
