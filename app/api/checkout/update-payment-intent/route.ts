import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { paymentIntentId, items, discountCode, giftCardCode } = await request.json()

    if (!paymentIntentId || !items?.length) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Re-validate items from DB
    let subtotal = 0
    const validatedItems = []

    for (const item of items) {
      const productId = item.productId || item.id
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, price: true, stock: true, isActive: true, productType: true }
      })

      if (!product || !product.isActive) {
        return NextResponse.json({ error: `Produit ${item.name || 'inconnu'} non disponible` }, { status: 400 })
      }

      if (product.productType !== 'PRINT_ON_DEMAND' && product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuffisant pour ${product.name}` }, { status: 400 })
      }

      subtotal += Number(product.price) * item.quantity
      validatedItems.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: item.quantity,
        image: item.image,
        color: item.color,
        size: item.size
      })
    }

    let discountAmount = 0
    let discountCodeId = ''
    let discountDescription = ''

    if (discountCode) {
      const dc = await prisma.discountCode.findUnique({
        where: { code: discountCode.toUpperCase().trim() }
      })

      if (dc && dc.isActive
        && (!dc.startsAt || new Date() >= dc.startsAt)
        && (!dc.expiresAt || new Date() <= dc.expiresAt)
        && (!dc.usageLimit || dc.usageCount < dc.usageLimit)
        && (!dc.minPurchase || subtotal >= Number(dc.minPurchase))
      ) {
        discountCodeId = dc.id
        if (dc.type === 'PERCENTAGE') {
          discountAmount = subtotal * (Number(dc.value) / 100)
          if (dc.maxDiscount) discountAmount = Math.min(discountAmount, Number(dc.maxDiscount))
          discountDescription = `-${Number(dc.value)}%`
        } else if (dc.type === 'FIXED_AMOUNT') {
          discountAmount = Math.min(Number(dc.value), subtotal)
          discountDescription = `-${discountAmount.toFixed(2)}€`
        } else if (dc.type === 'FREE_SHIPPING') {
          discountDescription = 'Livraison gratuite'
        }
        discountAmount = Math.round(discountAmount * 100) / 100
      }
    }

    let giftCardAmount = 0
    let giftCardId = ''

    if (giftCardCode) {
      const gc = await prisma.giftCard.findUnique({
        where: { code: giftCardCode.toUpperCase().replace(/-/g, '').trim() }
      })

      if (gc && gc.status === 'ACTIVE' && (!gc.expiresAt || new Date() <= gc.expiresAt)) {
        const balance = Number(gc.balance)
        if (balance > 0) {
          giftCardId = gc.id
          giftCardAmount = Math.min(balance, Math.max(subtotal - discountAmount, 0))
          giftCardAmount = Math.round(giftCardAmount * 100) / 100
        }
      }
    }

    const finalTotal = Math.max(subtotal - discountAmount - giftCardAmount, 0.50)

    await stripe.paymentIntents.update(paymentIntentId, {
      amount: Math.round(finalTotal * 100),
      metadata: {
        items: JSON.stringify(validatedItems),
        discountCode: discountCode || '',
        discountCodeId,
        discountAmount: discountAmount.toString(),
        giftCardCode: giftCardCode || '',
        giftCardId,
        giftCardAmount: giftCardAmount.toString(),
      }
    })

    return NextResponse.json({
      success: true,
      subtotal,
      discountAmount,
      discountDescription,
      giftCardAmount,
      total: finalTotal,
    })
  } catch (error) {
    console.error('Error updating payment intent:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
