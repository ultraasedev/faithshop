import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

// GET - Récupérer tous les codes de réduction
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const discountCodes = await prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdByAdmin: {
          select: { name: true, email: true }
        },
        orders: {
          select: { id: true, total: true }
        },
        discountUsages: {
          select: { id: true, discountAmount: true }
        }
      }
    })

    return NextResponse.json(discountCodes)

  } catch (error) {
    console.error('Erreur lors de la récupération des codes:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un nouveau code de réduction
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const data = await request.json()

    // Validation
    if (!data.code || !data.type) {
      return NextResponse.json({ error: 'Code et type requis' }, { status: 400 })
    }

    if (data.type !== 'FREE_SHIPPING' && (!data.value || data.value <= 0)) {
      return NextResponse.json({ error: 'Valeur requise pour ce type de réduction' }, { status: 400 })
    }

    // Vérifier l'unicité du code
    const existing = await prisma.discountCode.findUnique({
      where: { code: data.code }
    })

    if (existing) {
      return NextResponse.json({ error: 'Ce code existe déjà' }, { status: 400 })
    }

    // Créer le code de réduction
    const discountCode = await prisma.discountCode.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description || '',
        type: data.type,
        value: data.type === 'FREE_SHIPPING' ? 0 : data.value,
        minPurchase: data.minPurchase || null,
        maxDiscount: data.maxDiscount || null,
        usageLimit: data.usageLimit || null,
        usageLimitPerUser: data.usageLimitPerUser || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        firstTimeCustomer: data.firstTimeCustomer || false,
        combinableWithOthers: data.combinableWithOthers || false,
        isActive: true,
        createdByAdminId: session.user.id
      }
    })

    // Optionnellement créer un coupon Stripe correspondant
    try {
      if (data.type === 'PERCENTAGE' && data.value <= 100) {
        const stripeCoupon = await stripe.coupons.create({
          name: data.code,
          percent_off: data.value,
          duration: data.expiresAt ? 'once' : 'forever',
          max_redemptions: data.usageLimit || undefined,
          redeem_by: data.expiresAt ? Math.floor(new Date(data.expiresAt).getTime() / 1000) : undefined,
          metadata: {
            faith_shop_code_id: discountCode.id
          }
        })

        // Mettre à jour avec l'ID Stripe
        await prisma.discountCode.update({
          where: { id: discountCode.id },
          data: { stripeCouponId: stripeCoupon.id }
        })
      } else if (data.type === 'FIXED_AMOUNT') {
        const stripeCoupon = await stripe.coupons.create({
          name: data.code,
          amount_off: Math.round(data.value * 100), // Convertir en centimes
          currency: 'eur',
          duration: data.expiresAt ? 'once' : 'forever',
          max_redemptions: data.usageLimit || undefined,
          redeem_by: data.expiresAt ? Math.floor(new Date(data.expiresAt).getTime() / 1000) : undefined,
          metadata: {
            faith_shop_code_id: discountCode.id
          }
        })

        await prisma.discountCode.update({
          where: { id: discountCode.id },
          data: { stripeCouponId: stripeCoupon.id }
        })
      }
    } catch (stripeError) {
      console.error('Erreur création coupon Stripe:', stripeError)
      // On continue même si Stripe échoue
    }

    return NextResponse.json({
      success: true,
      discountCode,
      message: 'Code de réduction créé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la création du code:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}