import { calculateShippingCost } from '@/app/actions/admin/shipping'

// Calculer les frais de livraison pour le panier
export async function getShippingOptions(country = 'FR', totalWeight = 1) {
  try {
    const options = await calculateShippingCost(country, totalWeight)

    // Livraison gratuite si > 100€
    const freeShippingOption = {
      id: 'free',
      name: 'Livraison offerte',
      carrier: 'Standard',
      price: 0,
      estimatedDays: '3-5 jours'
    }

    return options.length > 0 ? options : [
      {
        id: 'standard',
        name: 'Livraison Standard',
        carrier: 'Colissimo',
        price: 4.99,
        estimatedDays: '2-3 jours'
      },
      {
        id: 'express',
        name: 'Livraison Express',
        carrier: 'Chronopost',
        price: 9.99,
        estimatedDays: '1-2 jours'
      }
    ]
  } catch (error) {
    console.error('Error calculating shipping:', error)
    return [
      {
        id: 'standard',
        name: 'Livraison Standard',
        carrier: 'Colissimo',
        price: 4.99,
        estimatedDays: '2-3 jours'
      }
    ]
  }
}

// Calculer le coût de livraison selon le total du panier
export function calculateShippingForOrder(subtotal: number, country = 'FR') {
  // Livraison offerte dès 100€
  if (subtotal >= 100) {
    return {
      id: 'free',
      name: 'Livraison offerte',
      price: 0,
      estimatedDays: '2-3 jours'
    }
  }

  // Tarifs par pays
  const rates: Record<string, { price: number; days: string }> = {
    'FR': { price: 4.99, days: '2-3 jours' },
    'BE': { price: 6.99, days: '3-4 jours' },
    'CH': { price: 9.99, days: '4-5 jours' },
    'DE': { price: 7.99, days: '3-4 jours' },
    'IT': { price: 8.99, days: '4-5 jours' },
    'ES': { price: 8.99, days: '4-5 jours' },
  }

  const rate = rates[country] || rates['FR']

  return {
    id: 'standard',
    name: subtotal >= 50 ? 'Livraison réduite' : 'Livraison Standard',
    price: subtotal >= 50 ? rate.price * 0.5 : rate.price,
    estimatedDays: rate.days
  }
}