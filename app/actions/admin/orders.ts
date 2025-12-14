'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { OrderStatus, PaymentStatus, ShippingStatus } from '@prisma/client'

// Récupérer toutes les commandes avec pagination et filtres
export async function getOrders(params: {
  page?: number
  limit?: number
  status?: OrderStatus
  search?: string
}) {
  const { page = 1, limit = 20, status, search } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  if (status) {
    where.status = status
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { guestEmail: { contains: search, mode: 'insensitive' } },
      { guestName: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
        shipping: true,
        discountCode: true,
        giftCard: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  return {
    orders: orders.map(order => ({
      ...order,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      discountAmount: Number(order.discountAmount),
      taxAmount: Number(order.taxAmount),
      items: order.items.map(item => ({
        ...item,
        price: Number(item.price)
      }))
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// Récupérer une commande par ID
export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { product: true } },
      shipping: { include: { events: { orderBy: { timestamp: 'desc' } } } },
      discountCode: true,
      giftCard: true,
    },
  })
}

// Mettre à jour le statut d'une commande
export async function updateOrderStatus(id: string, status: OrderStatus) {
  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      user: true,
      items: { include: { product: true } },
      shipping: true
    }
  })

  // Envoyer un email de mise à jour si applicable
  if (['SHIPPED', 'DELIVERED'].includes(status)) {
    try {
      const { sendShippingEmail } = await import('@/lib/email')
      const customerEmail = order.user?.email || order.guestEmail
      const customerName = order.user?.name || order.guestName || 'Client'

      if (customerEmail && order.shipping?.trackingNumber && status === 'SHIPPED') {
        await sendShippingEmail(
          customerEmail,
          customerName,
          order.orderNumber,
          order.shipping.trackingNumber,
          order.shipping.trackingUrl || '',
          order.shipping.carrier
        )
      }
    } catch (emailError) {
      console.error('Erreur envoi email mise à jour:', emailError)
    }
  }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)

  return order
}

// Ajouter une note admin à la commande
export async function addOrderNote(id: string, note: string) {
  const order = await prisma.order.update({
    where: { id },
    data: { adminNote: note },
  })

  revalidatePath(`/admin/orders/${id}`)
  return order
}

// Créer l'expédition pour une commande
export async function createShipping(orderId: string, data: {
  carrier: string
  trackingNumber?: string
  weightKg?: number
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  estimatedDelivery?: Date
}) {
  const shipping = await prisma.shipping.create({
    data: {
      orderId,
      carrier: data.carrier,
      trackingNumber: data.trackingNumber,
      weightKg: data.weightKg,
      lengthCm: data.lengthCm,
      widthCm: data.widthCm,
      heightCm: data.heightCm,
      estimatedDelivery: data.estimatedDelivery,
      status: 'PENDING',
    },
  })

  // Mettre à jour le statut de la commande
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'PROCESSING' },
  })

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)

  return shipping
}

// Mettre à jour le statut d'expédition
export async function updateShippingStatus(
  shippingId: string,
  status: ShippingStatus,
  location?: string,
  description?: string
) {
  const shipping = await prisma.shipping.update({
    where: { id: shippingId },
    data: {
      status,
      ...(status === 'PICKED_UP' && { shippedAt: new Date() }),
      ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
    },
    include: { order: true },
  })

  // Créer un événement d'expédition
  await prisma.shippingEvent.create({
    data: {
      shippingId,
      status,
      location,
      description: description || getDefaultShippingDescription(status),
    },
  })

  // Mettre à jour le statut de la commande si nécessaire
  if (status === 'PICKED_UP' || status === 'IN_TRANSIT') {
    await prisma.order.update({
      where: { id: shipping.orderId },
      data: { status: 'SHIPPED' },
    })
  } else if (status === 'DELIVERED') {
    await prisma.order.update({
      where: { id: shipping.orderId },
      data: { status: 'DELIVERED' },
    })
  }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${shipping.orderId}`)

  return shipping
}

function getDefaultShippingDescription(status: ShippingStatus): string {
  const descriptions: Record<ShippingStatus, string> = {
    PENDING: 'Colis en attente de préparation',
    LABEL_CREATED: 'Étiquette créée',
    PICKED_UP: 'Colis pris en charge par le transporteur',
    IN_TRANSIT: 'Colis en transit',
    OUT_FOR_DELIVERY: 'Colis en cours de livraison',
    DELIVERED: 'Colis livré',
    RETURNED: 'Colis retourné',
  }
  return descriptions[status]
}

// Sauvegarder l'étiquette d'expédition
export async function saveShippingLabel(shippingId: string, labelUrl: string) {
  const shipping = await prisma.shipping.update({
    where: { id: shippingId },
    data: {
      labelUrl,
      labelCreatedAt: new Date(),
      status: 'LABEL_CREATED',
    },
  })

  // Créer un événement
  await prisma.shippingEvent.create({
    data: {
      shippingId,
      status: 'LABEL_CREATED',
      description: 'Étiquette d\'expédition créée',
    },
  })

  revalidatePath(`/admin/orders/${shipping.orderId}`)
  return shipping
}

// Statistiques des commandes
export async function getOrderStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalOrders,
    thisMonthOrders,
    lastMonthOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    totalRevenue,
    thisMonthRevenue,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.order.count({ where: { status: 'SHIPPED' } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'COMPLETED' },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startOfMonth },
      },
    }),
  ])

  return {
    totalOrders,
    thisMonthOrders,
    lastMonthOrders,
    orderGrowth: lastMonthOrders > 0
      ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1)
      : 0,
    pendingOrders,
    processingOrders,
    shippedOrders,
    totalRevenue: Number(totalRevenue._sum.total || 0),
    thisMonthRevenue: Number(thisMonthRevenue._sum.total || 0),
  }
}
