import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

// PATCH - Mettre à jour un code de réduction
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const data = await request.json()

    const discountCode = await prisma.discountCode.update({
      where: { id: params.id },
      data: {
        isActive: data.isActive
      }
    })

    // Synchroniser avec Stripe si applicable
    if (discountCode.stripeCouponId) {
      try {
        // Note: Stripe ne permet pas de désactiver les coupons,
        // mais on peut les supprimer ou gérer côté application
      } catch (stripeError) {
        console.error('Erreur sync Stripe:', stripeError)
      }
    }

    return NextResponse.json({
      success: true,
      discountCode,
      message: `Code ${data.isActive ? 'activé' : 'désactivé'} avec succès`
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un code de réduction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier si le code a été utilisé
    const discountCode = await prisma.discountCode.findUnique({
      where: { id: params.id },
      include: {
        discountUsages: true,
        orders: true
      }
    })

    if (!discountCode) {
      return NextResponse.json({ error: 'Code introuvable' }, { status: 404 })
    }

    if (discountCode.currentUsage > 0) {
      return NextResponse.json({
        error: 'Impossible de supprimer un code qui a déjà été utilisé'
      }, { status: 400 })
    }

    // Supprimer de Stripe si applicable
    if (discountCode.stripeCouponId) {
      try {
        await stripe.coupons.del(discountCode.stripeCouponId)
      } catch (stripeError) {
        console.error('Erreur suppression coupon Stripe:', stripeError)
        // On continue même si Stripe échoue
      }
    }

    // Supprimer de la base de données
    await prisma.discountCode.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Code de réduction supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}