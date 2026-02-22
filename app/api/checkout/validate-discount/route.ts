import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Code requis' }, { status: 400 })
    }

    const discountCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    })

    if (!discountCode) {
      return NextResponse.json({ valid: false, error: 'Code promo invalide' })
    }

    if (!discountCode.isActive) {
      return NextResponse.json({ valid: false, error: 'Ce code promo n\'est plus actif' })
    }

    if (discountCode.startsAt && new Date() < discountCode.startsAt) {
      return NextResponse.json({ valid: false, error: 'Ce code promo n\'est pas encore actif' })
    }

    if (discountCode.expiresAt && new Date() > discountCode.expiresAt) {
      return NextResponse.json({ valid: false, error: 'Ce code promo a expiré' })
    }

    if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
      return NextResponse.json({ valid: false, error: 'Ce code promo a atteint sa limite d\'utilisation' })
    }

    if (discountCode.minPurchase && cartTotal < Number(discountCode.minPurchase)) {
      return NextResponse.json({
        valid: false,
        error: `Montant minimum de ${Number(discountCode.minPurchase).toFixed(2)}€ requis`,
      })
    }

    // Calculate discount
    let discountAmount = 0
    if (discountCode.type === 'PERCENTAGE') {
      discountAmount = cartTotal * (Number(discountCode.value) / 100)
      if (discountCode.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(discountCode.maxDiscount))
      }
    } else if (discountCode.type === 'FIXED_AMOUNT') {
      discountAmount = Number(discountCode.value)
    }

    discountAmount = Math.round(discountAmount * 100) / 100

    return NextResponse.json({
      valid: true,
      code: discountCode.code,
      type: discountCode.type,
      discountAmount,
      description: discountCode.type === 'PERCENTAGE'
        ? `-${Number(discountCode.value)}%`
        : discountCode.type === 'FREE_SHIPPING'
          ? 'Livraison gratuite'
          : `-${discountAmount.toFixed(2)}€`,
    })
  } catch (error) {
    console.error('Error validating discount:', error)
    return NextResponse.json({ valid: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
