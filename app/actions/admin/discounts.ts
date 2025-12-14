'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { DiscountType, GiftCardStatus } from '@prisma/client'

// ==================== DISCOUNT CODES ====================

// Récupérer tous les codes promo
export async function getDiscountCodes(params?: {
  page?: number
  limit?: number
  active?: boolean
}) {
  const { page = 1, limit = 20, active } = params || {}
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (active !== undefined) {
    where.isActive = active
  }

  const [codes, total] = await Promise.all([
    prisma.discountCode.findMany({
      where,
      include: {
        createdBy: { select: { name: true, email: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.discountCode.count({ where }),
  ])

  return {
    codes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

import { stripe } from '@/lib/stripe'

// Créer un code promo
export async function createDiscountCode(data: {
  code: string
  description?: string
  type: DiscountType
  value: number
  minPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  usageLimitPerUser?: number
  startsAt?: Date
  expiresAt?: Date
  applicableProducts?: string[]
  createdById?: string
}) {
  // Vérifier que le code n'existe pas déjà
  const existing = await prisma.discountCode.findUnique({
    where: { code: data.code.toUpperCase() },
  })

  if (existing) {
    throw new Error('Ce code promo existe déjà')
  }

  // Créer le coupon Stripe
  let stripeCouponId: string | undefined
  let stripePromotionCodeId: string | undefined

  try {
    const couponParams: any = {
      name: data.description || data.code,
      currency: 'eur',
      duration: 'once', // Par défaut, une fois par utilisation
    }

    if (data.type === 'PERCENTAGE') {
      couponParams.percent_off = data.value
    } else if (data.type === 'FIXED_AMOUNT') {
      couponParams.amount_off = Math.round(data.value * 100)
    } else {
      // FREE_SHIPPING n'est pas directement supporté comme coupon simple, 
      // on le gère souvent côté application ou via un coupon 100% sur shipping (complexe)
      // Pour l'instant on ne crée pas de coupon Stripe pour free shipping
    }

    if (data.type !== 'FREE_SHIPPING') {
      const coupon = await stripe.coupons.create(couponParams)
      stripeCouponId = coupon.id

      // Créer le code promo associé (le code que l'utilisateur tape)
      const promotionCode = await stripe.promotionCodes.create({
        coupon: coupon.id,
        code: data.code,
        max_redemptions: data.usageLimit,
        expires_at: data.expiresAt ? Math.floor(data.expiresAt.getTime() / 1000) : undefined,
        minimum_amount: data.minPurchase ? Math.round(data.minPurchase * 100) : undefined,
        currency: 'eur',
      })
      stripePromotionCodeId = promotionCode.id
    }
  } catch (error) {
    console.error('Erreur Stripe:', error)
    // On continue quand même pour le créer en local, mais on log l'erreur
    // Ou on throw si on veut être strict
  }

  const discountCode = await prisma.discountCode.create({
    data: {
      code: data.code.toUpperCase(),
      description: data.description,
      type: data.type,
      value: data.value,
      minPurchase: data.minPurchase,
      maxDiscount: data.maxDiscount,
      usageLimit: data.usageLimit,
      usageLimitPerUser: data.usageLimitPerUser,
      startsAt: data.startsAt || new Date(),
      expiresAt: data.expiresAt,
      applicableProducts: data.applicableProducts || [],
      createdById: data.createdById,
      stripeCouponId,
      stripePromotionCodeId,
    },
  })

  revalidatePath('/admin/discounts')
  return discountCode
}

// Mettre à jour un code promo
export async function updateDiscountCode(id: string, data: {
  description?: string
  type?: DiscountType
  value?: number
  minPurchase?: number | null
  maxDiscount?: number | null
  usageLimit?: number | null
  usageLimitPerUser?: number | null
  startsAt?: Date
  expiresAt?: Date | null
  isActive?: boolean
  applicableProducts?: string[]
}) {
  const discountCode = await prisma.discountCode.update({
    where: { id },
    data,
  })

  revalidatePath('/admin/discounts')
  return discountCode
}

// Supprimer un code promo
export async function deleteDiscountCode(id: string) {
  // Vérifier qu'il n'est pas utilisé
  const code = await prisma.discountCode.findUnique({
    where: { id },
    include: { _count: { select: { orders: true } } },
  })

  if (code && code._count.orders > 0) {
    // Désactiver au lieu de supprimer
    await prisma.discountCode.update({
      where: { id },
      data: { isActive: false },
    })
  } else {
    await prisma.discountCode.delete({ where: { id } })
  }

  revalidatePath('/admin/discounts')
}

// Valider un code promo (côté client/checkout)
export async function validateDiscountCode(code: string, cartTotal: number, userId?: string) {
  const discountCode = await prisma.discountCode.findUnique({
    where: { code: code.toUpperCase() },
  })

  if (!discountCode) {
    return { valid: false, error: 'Code promo invalide' }
  }

  if (!discountCode.isActive) {
    return { valid: false, error: 'Ce code promo n\'est plus actif' }
  }

  const now = new Date()
  if (discountCode.startsAt > now) {
    return { valid: false, error: 'Ce code promo n\'est pas encore valide' }
  }

  if (discountCode.expiresAt && discountCode.expiresAt < now) {
    return { valid: false, error: 'Ce code promo a expiré' }
  }

  if (discountCode.usageLimit && discountCode.currentUsage >= discountCode.usageLimit) {
    return { valid: false, error: 'Ce code promo a atteint sa limite d\'utilisation' }
  }

  if (discountCode.minPurchase && cartTotal < Number(discountCode.minPurchase)) {
    return {
      valid: false,
      error: `Montant minimum de ${discountCode.minPurchase}€ requis`,
    }
  }

  // Calculer la réduction
  let discountAmount = 0
  if (discountCode.type === 'PERCENTAGE') {
    discountAmount = cartTotal * (Number(discountCode.value) / 100)
    if (discountCode.maxDiscount) {
      discountAmount = Math.min(discountAmount, Number(discountCode.maxDiscount))
    }
  } else if (discountCode.type === 'FIXED_AMOUNT') {
    discountAmount = Number(discountCode.value)
  }
  // FREE_SHIPPING sera géré au niveau des frais de port

  return {
    valid: true,
    discountCode,
    discountAmount,
    type: discountCode.type,
  }
}

// ==================== GIFT CARDS ====================

// Récupérer toutes les cartes cadeaux
export async function getGiftCards(params?: {
  page?: number
  limit?: number
  status?: GiftCardStatus
}) {
  const { page = 1, limit = 20, status } = params || {}
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (status) {
    where.status = status
  }

  const [cards, total] = await Promise.all([
    prisma.giftCard.findMany({
      where,
      include: {
        createdBy: { select: { name: true, email: true } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 5 },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.giftCard.count({ where }),
  ])

  return {
    cards,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// Générer un code carte cadeau unique
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sans I, O, 0, 1 pour éviter confusion
  let code = ''
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Créer une carte cadeau
export async function createGiftCard(data: {
  amount: number
  recipientEmail?: string
  recipientName?: string
  purchaserEmail?: string
  purchaserName?: string
  message?: string
  expiresAt?: Date
  createdById?: string
}) {
  let code = generateGiftCardCode()

  // S'assurer que le code est unique
  while (await prisma.giftCard.findUnique({ where: { code } })) {
    code = generateGiftCardCode()
  }

  // Créer le coupon Stripe pour la carte cadeau
  let stripeCouponId: string | undefined
  let stripePromotionCodeId: string | undefined

  try {
    const coupon = await stripe.coupons.create({
      name: `Carte Cadeau ${code}`,
      amount_off: Math.round(data.amount * 100),
      currency: 'eur',
      duration: 'once',
    })
    stripeCouponId = coupon.id

    const promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: code,
      expires_at: data.expiresAt ? Math.floor(data.expiresAt.getTime() / 1000) : undefined,
      currency: 'eur',
    })
    stripePromotionCodeId = promotionCode.id
  } catch (error) {
    console.error('Erreur Stripe Gift Card:', error)
  }

  const giftCard = await prisma.giftCard.create({
    data: {
      code,
      initialAmount: data.amount,
      currentBalance: data.amount,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      purchaserEmail: data.purchaserEmail,
      purchaserName: data.purchaserName,
      message: data.message,
      expiresAt: data.expiresAt,
      createdById: data.createdById,
      stripeCouponId,
      stripePromotionCodeId,
    },
  })

  // Créer la transaction initiale
  await prisma.giftCardTransaction.create({
    data: {
      giftCardId: giftCard.id,
      amount: data.amount,
      balanceAfter: data.amount,
      description: 'Création de la carte cadeau',
    },
  })

  revalidatePath('/admin/gift-cards')
  return giftCard
}

// Valider une carte cadeau
export async function validateGiftCard(code: string) {
  const giftCard = await prisma.giftCard.findUnique({
    where: { code: code.toUpperCase().replace(/-/g, '') },
  })

  if (!giftCard) {
    return { valid: false, error: 'Carte cadeau invalide' }
  }

  if (giftCard.status !== 'ACTIVE') {
    return { valid: false, error: 'Cette carte cadeau n\'est plus valide' }
  }

  if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
    return { valid: false, error: 'Cette carte cadeau a expiré' }
  }

  if (Number(giftCard.currentBalance) <= 0) {
    return { valid: false, error: 'Cette carte cadeau est épuisée' }
  }

  return {
    valid: true,
    giftCard,
    availableBalance: giftCard.currentBalance,
  }
}

// Utiliser une carte cadeau
export async function useGiftCard(giftCardId: string, amount: number, orderId?: string) {
  const giftCard = await prisma.giftCard.findUnique({
    where: { id: giftCardId },
  })

  if (!giftCard || Number(giftCard.currentBalance) < amount) {
    throw new Error('Solde insuffisant sur la carte cadeau')
  }

  const newBalance = Number(giftCard.currentBalance) - amount

  const updated = await prisma.giftCard.update({
    where: { id: giftCardId },
    data: {
      currentBalance: newBalance,
      status: newBalance <= 0 ? 'USED' : 'ACTIVE',
    },
  })

  // Créer la transaction
  await prisma.giftCardTransaction.create({
    data: {
      giftCardId,
      amount: -amount,
      balanceAfter: newBalance,
      description: orderId ? `Utilisée pour commande #${orderId}` : 'Utilisation',
    },
  })

  revalidatePath('/admin/gift-cards')
  return updated
}

// Recharger une carte cadeau
export async function rechargeGiftCard(giftCardId: string, amount: number) {
  const giftCard = await prisma.giftCard.findUnique({
    where: { id: giftCardId },
  })

  if (!giftCard) {
    throw new Error('Carte cadeau non trouvée')
  }

  const newBalance = Number(giftCard.currentBalance) + amount

  const updated = await prisma.giftCard.update({
    where: { id: giftCardId },
    data: {
      currentBalance: newBalance,
      status: 'ACTIVE',
    },
  })

  await prisma.giftCardTransaction.create({
    data: {
      giftCardId,
      amount,
      balanceAfter: newBalance,
      description: 'Rechargement',
    },
  })

  revalidatePath('/admin/gift-cards')
  return updated
}

// Désactiver une carte cadeau
export async function disableGiftCard(giftCardId: string) {
  const giftCard = await prisma.giftCard.update({
    where: { id: giftCardId },
    data: { status: 'DISABLED' },
  })

  revalidatePath('/admin/gift-cards')
  return giftCard
}
