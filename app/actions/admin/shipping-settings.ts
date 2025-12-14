'use server'

import { prisma } from '@/lib/prisma'

export interface ShippingRate {
  zone: string
  name: string
  price: number
  currency: string
}

export async function getShippingRates(): Promise<ShippingRate[]> {
  try {
    const configs = await prisma.siteConfig.findMany({
      where: {
        key: {
          startsWith: 'shipping_'
        }
      }
    })

    // Mapper les configs en rates
    const rates: ShippingRate[] = []

    // France Métropolitaine
    const franceStandardPrice = configs.find(c => c.key === 'shipping_france_standard')?.value || '4.90'
    const franceExpressPrice = configs.find(c => c.key === 'shipping_france_express')?.value || '9.90'

    rates.push(
      { zone: 'France', name: 'Standard (Colissimo)', price: parseFloat(franceStandardPrice), currency: 'EUR' },
      { zone: 'France', name: 'Express (Chronopost)', price: parseFloat(franceExpressPrice), currency: 'EUR' }
    )

    // International
    const europePrice = configs.find(c => c.key === 'shipping_europe')?.value || '12.90'
    const worldPrice = configs.find(c => c.key === 'shipping_world')?.value || '24.90'

    rates.push(
      { zone: 'International', name: 'Europe', price: parseFloat(europePrice), currency: 'EUR' },
      { zone: 'International', name: 'Monde', price: parseFloat(worldPrice), currency: 'EUR' }
    )

    return rates
  } catch (error) {
    console.error('Failed to get shipping rates:', error)
    // Retourner des valeurs par défaut
    return [
      { zone: 'France', name: 'Standard (Colissimo)', price: 4.90, currency: 'EUR' },
      { zone: 'France', name: 'Express (Chronopost)', price: 9.90, currency: 'EUR' },
      { zone: 'International', name: 'Europe', price: 12.90, currency: 'EUR' },
      { zone: 'International', name: 'Monde', price: 24.90, currency: 'EUR' }
    ]
  }
}

export async function updateShippingRate(key: string, price: number): Promise<void> {
  try {
    await prisma.siteConfig.upsert({
      where: { key },
      update: { value: price.toString() },
      create: { key, value: price.toString() }
    })
  } catch (error) {
    console.error('Failed to update shipping rate:', error)
    throw error
  }
}

export async function getShippingSettings() {
  try {
    const configs = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: [
            'shipping_france_standard',
            'shipping_france_express',
            'shipping_europe',
            'shipping_world',
            'shipping_free_threshold',
            'shipping_processing_time'
          ]
        }
      }
    })

    const configMap = configs.reduce((acc, config) => {
      acc[config.key] = config.value
      return acc
    }, {} as Record<string, string>)

    return {
      franceStandard: parseFloat(configMap['shipping_france_standard'] || '4.90'),
      franceExpress: parseFloat(configMap['shipping_france_express'] || '9.90'),
      europe: parseFloat(configMap['shipping_europe'] || '12.90'),
      world: parseFloat(configMap['shipping_world'] || '24.90'),
      freeThreshold: parseFloat(configMap['shipping_free_threshold'] || '100'),
      processingTime: configMap['shipping_processing_time'] || '24/48h ouvrées'
    }
  } catch (error) {
    console.error('Failed to get shipping settings:', error)
    return {
      franceStandard: 4.90,
      franceExpress: 9.90,
      europe: 12.90,
      world: 24.90,
      freeThreshold: 100,
      processingTime: '24/48h ouvrées'
    }
  }
}