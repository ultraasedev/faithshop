import { prisma } from '@/lib/prisma'
import type { CarrierCredentials } from './types'

/**
 * Lit les credentials des transporteurs depuis SiteConfig
 * Les clés sont au format: carriers.laposteApiKey, carriers.colissimoContractNumber, etc.
 */
export async function getCarrierCredentials(): Promise<CarrierCredentials> {
  const configs = await prisma.siteConfig.findMany({
    where: { key: { startsWith: 'carriers.' } }
  })

  const get = (key: string) => configs.find(c => c.key === key)?.value || ''

  const credentials: CarrierCredentials = {}

  const laposteKey = get('carriers.laposteApiKey')
  if (laposteKey) {
    credentials.laposte = { apiKey: laposteKey }
  }

  const colissimoContract = get('carriers.colissimoContractNumber')
  const colissimoPassword = get('carriers.colissimoPassword')
  if (colissimoContract && colissimoPassword) {
    credentials.colissimo = { contractNumber: colissimoContract, password: colissimoPassword }
  }

  const mrEnseigne = get('carriers.mondialRelayEnseigne')
  const mrKey = get('carriers.mondialRelayPrivateKey')
  if (mrEnseigne && mrKey) {
    credentials.mondialRelay = { enseigne: mrEnseigne, privateKey: mrKey }
  }

  return credentials
}

export async function getLaPosteApiKey(): Promise<string | null> {
  const config = await prisma.siteConfig.findUnique({
    where: { key: 'carriers.laposteApiKey' }
  })
  return config?.value || process.env.LAPOSTE_API_KEY || null
}

export async function getColissimoCredentials(): Promise<{ contractNumber: string; password: string } | null> {
  const configs = await prisma.siteConfig.findMany({
    where: { key: { startsWith: 'carriers.colissimo' } }
  })
  const get = (key: string) => configs.find(c => c.key === key)?.value || ''
  const contractNumber = get('carriers.colissimoContractNumber') || process.env.COLISSIMO_CONTRACT || ''
  const password = get('carriers.colissimoPassword') || process.env.COLISSIMO_PASSWORD || ''
  if (!contractNumber || !password) return null
  return { contractNumber, password }
}

export async function getMondialRelayCredentials(): Promise<{ enseigne: string; privateKey: string } | null> {
  const configs = await prisma.siteConfig.findMany({
    where: { key: { startsWith: 'carriers.mondialRelay' } }
  })
  const get = (key: string) => configs.find(c => c.key === key)?.value || ''
  const enseigne = get('carriers.mondialRelayEnseigne') || process.env.MONDIAL_RELAY_ENSEIGNE || ''
  const privateKey = get('carriers.mondialRelayPrivateKey') || process.env.MONDIAL_RELAY_KEY || ''
  if (!enseigne || !privateKey) return null
  return { enseigne, privateKey }
}
