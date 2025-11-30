'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Récupérer les tarifs de livraison
export async function getShippingRates() {
  return prisma.shippingRate.findMany({
    orderBy: [{ countries: 'asc' }, { price: 'asc' }],
  })
}

// Créer un tarif de livraison
export async function createShippingRate(data: {
  name: string
  carrier: string
  minWeight: number
  maxWeight: number
  price: number
  countries: string[]
  minDays: number
  maxDays: number
}) {
  const rate = await prisma.shippingRate.create({
    data: {
      name: data.name,
      carrier: data.carrier,
      minWeight: data.minWeight,
      maxWeight: data.maxWeight,
      price: data.price,
      countries: data.countries,
      minDays: data.minDays,
      maxDays: data.maxDays,
    },
  })

  revalidatePath('/admin/shipping')
  return rate
}

// Mettre à jour un tarif de livraison
export async function updateShippingRate(id: string, data: {
  name?: string
  carrier?: string
  minWeight?: number
  maxWeight?: number
  price?: number
  countries?: string[]
  minDays?: number
  maxDays?: number
  isActive?: boolean
}) {
  const rate = await prisma.shippingRate.update({
    where: { id },
    data,
  })

  revalidatePath('/admin/shipping')
  return rate
}

// Supprimer un tarif
export async function deleteShippingRate(id: string) {
  await prisma.shippingRate.delete({ where: { id } })
  revalidatePath('/admin/shipping')
}

// Calculer les frais de livraison pour une commande
export async function calculateShippingCost(country: string, weightKg: number) {
  const rates = await prisma.shippingRate.findMany({
    where: {
      isActive: true,
      countries: { has: country },
      minWeight: { lte: weightKg },
      maxWeight: { gte: weightKg },
    },
    orderBy: { price: 'asc' },
  })

  return rates.map((rate) => ({
    id: rate.id,
    name: rate.name,
    carrier: rate.carrier,
    price: rate.price,
    estimatedDays: `${rate.minDays}-${rate.maxDays} jours`,
  }))
}

// Générer une étiquette d'expédition (simulation - à intégrer avec un vrai API transporteur)
export async function generateShippingLabel(orderId: string, carrier: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, shipping: true },
  })

  if (!order) {
    throw new Error('Commande non trouvée')
  }

  // Ici on intégrerait avec l'API du transporteur (Colissimo, Chronopost, etc.)
  // Pour l'instant, on génère une étiquette fictive

  const trackingNumber = `FR${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  // Créer ou mettre à jour l'expédition
  const shipping = order.shipping
    ? await prisma.shipping.update({
        where: { id: order.shipping.id },
        data: {
          carrier,
          trackingNumber,
          trackingUrl: `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`,
          status: 'LABEL_CREATED',
          labelCreatedAt: new Date(),
          // En production, on stockerait le PDF dans Vercel Blob
          labelUrl: `/api/shipping/label/${orderId}`,
        },
      })
    : await prisma.shipping.create({
        data: {
          orderId,
          carrier,
          trackingNumber,
          trackingUrl: `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`,
          status: 'LABEL_CREATED',
          labelCreatedAt: new Date(),
          labelUrl: `/api/shipping/label/${orderId}`,
        },
      })

  // Créer l'événement
  await prisma.shippingEvent.create({
    data: {
      shippingId: shipping.id,
      status: 'LABEL_CREATED',
      description: `Étiquette ${carrier} créée - ${trackingNumber}`,
    },
  })

  // Mettre à jour le statut de la commande
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'PROCESSING' },
  })

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)

  return {
    shipping,
    trackingNumber,
    labelUrl: shipping.labelUrl,
  }
}

// Récupérer les expéditions en attente
export async function getPendingShipments() {
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ['PAID', 'PROCESSING'] },
      paymentStatus: 'COMPLETED',
    },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: true } },
      shipping: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  return orders
}

// Récupérer les expéditions à livrer aujourd'hui
export async function getTodayDeliveries() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return prisma.shipping.findMany({
    where: {
      status: 'OUT_FOR_DELIVERY',
      estimatedDelivery: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  })
}
