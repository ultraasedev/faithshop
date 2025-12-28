import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, amount, reason, type } = body

    console.log('Refund request:', { orderId, amount, reason, type })

    if (!orderId) {
      return NextResponse.json({ error: 'ID de commande requis' }, { status: 400 })
    }

    // Récupérer la commande avec les détails de paiement
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    console.log('Order found:', {
      orderNumber: order.orderNumber,
      total: order.total,
      paymentStatus: order.paymentStatus,
      hasStripeId: !!order.stripePaymentIntentId
    })

    // For store credit, we don't need Stripe
    if (type !== 'STORE_CREDIT') {
      if (!order.stripePaymentIntentId) {
        return NextResponse.json({
          error: 'Cette commande n\'a pas de paiement Stripe associé. Utilisez un avoir boutique à la place.'
        }, { status: 400 })
      }

      if (order.paymentStatus !== 'COMPLETED') {
        return NextResponse.json({
          error: `Le paiement doit être terminé pour être remboursé (statut actuel: ${order.paymentStatus})`
        }, { status: 400 })
      }
    }

    let refundAmount = amount

    // Si remboursement complet, utiliser le montant total de la commande
    if (type === 'FULL') {
      refundAmount = Math.round(Number(order.total) * 100) // Convertir en centimes
    } else {
      refundAmount = Math.round(amount * 100) // Convertir en centimes
    }

    // Vérifier que le montant est valide
    if (refundAmount <= 0 || refundAmount > Math.round(Number(order.total) * 100)) {
      return NextResponse.json({
        error: 'Montant de remboursement invalide'
      }, { status: 400 })
    }

    // Vérifier les remboursements existants
    const existingRefunds = await prisma.refund.findMany({
      where: { orderId }
    })

    const totalRefunded = existingRefunds
      .filter(r => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + Number(r.amount), 0)

    const remainingAmount = Number(order.total) - totalRefunded

    if (refundAmount / 100 > remainingAmount) {
      return NextResponse.json({
        error: `Montant trop élevé. Solde restant: ${remainingAmount.toFixed(2)}€`
      }, { status: 400 })
    }

    let stripeRefund

    try {
      // Créer le remboursement dans Stripe
      if (type === 'STORE_CREDIT') {
        // Pour les avoirs boutique, on ne rembourse pas via Stripe
        // mais on crée directement un avoir
        const recipientEmail = order.user?.email || order.guestEmail
        if (!recipientEmail) {
          return NextResponse.json({
            error: 'Email du client non trouvé pour créer l\'avoir'
          }, { status: 400 })
        }

        const giftCard = await createGiftCard({
          amount: refundAmount / 100,
          recipientEmail,
          reason: `Avoir pour commande #${order.orderNumber} - ${reason || 'Remboursement'}`,
          orderId: order.id
        })

        // Enregistrer le "remboursement" comme avoir
        const refund = await prisma.refund.create({
          data: {
            orderId,
            amount: refundAmount / 100,
            currency: 'EUR',
            reason: reason || 'Avoir boutique',
            type: 'STORE_CREDIT',
            status: 'COMPLETED',
            stripeRefundId: null, // Pas de remboursement Stripe réel
            giftCardId: giftCard.id,
            adminUserId: session.user.id
          }
        })

        return NextResponse.json({
          success: true,
          refund,
          giftCard,
          message: `Avoir de ${(refundAmount / 100).toFixed(2)}€ créé avec succès. Code: ${giftCard.code}`
        })

      } else {
        // Remboursement normal via Stripe
        const stripeReason = reason.includes('défectueux') ? 'fraudulent' :
                          reason.includes('demande') ? 'requested_by_customer' :
                          'requested_by_customer'

        stripeRefund = await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
          amount: refundAmount,
          reason: stripeReason,
          metadata: {
            order_id: order.id,
            order_number: order.orderNumber,
            admin_user_id: session.user.id,
            refund_reason: reason
          }
        })

        // Enregistrer le remboursement dans la DB
        const refund = await prisma.refund.create({
          data: {
            orderId,
            amount: refundAmount / 100,
            currency: 'EUR',
            reason,
            type,
            status: 'COMPLETED',
            stripeRefundId: stripeRefund.id,
            adminUserId: session.user.id
          }
        })

        // Mettre à jour le statut de la commande si remboursement complet
        if (type === 'FULL' || refundAmount === Math.round(Number(order.total) * 100)) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'REFUNDED',
              paymentStatus: 'REFUNDED'
            }
          })
        }

        // Envoyer un email de confirmation au client
        try {
          await sendRefundConfirmationEmail(order, refund)
        } catch (emailError) {
          console.error('Erreur envoi email remboursement:', emailError)
          // On continue même si l'email échoue
        }

        return NextResponse.json({
          success: true,
          refund,
          stripeRefund,
          message: 'Remboursement traité avec succès'
        })
      }

    } catch (stripeError: any) {
      console.error('Erreur Stripe:', stripeError)

      // Enregistrer l'échec dans la DB
      await prisma.refund.create({
        data: {
          orderId,
          amount: refundAmount / 100,
          currency: 'EUR',
          reason,
          type,
          status: 'FAILED',
          stripeRefundId: null,
          adminUserId: session.user.id,
          failureReason: stripeError.message
        }
      })

      return NextResponse.json({
        error: `Erreur Stripe: ${stripeError.message}`
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Erreur lors du remboursement:', error)
    return NextResponse.json({
      error: 'Erreur serveur lors du remboursement'
    }, { status: 500 })
  }
}

// Fonction pour créer un avoir boutique
async function createGiftCard({
  amount,
  recipientEmail,
  reason,
  orderId
}: {
  amount: number
  recipientEmail: string
  reason: string
  orderId: string
}) {
  // Générer un code unique
  const code = generateGiftCardCode()

  // Date d'expiration (12 mois par défaut)
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  return await prisma.giftCard.create({
    data: {
      code,
      amount,
      balance: amount,
      currency: 'EUR',
      recipientEmail,
      message: reason,
      expiresAt,
      isActive: true,
      orderId
    }
  })
}

// Générer un code d'avoir unique
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'FAITH-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Envoyer email de confirmation de remboursement
async function sendRefundConfirmationEmail(order: any, refund: any) {
  const customerEmail = order.user?.email || order.guestEmail
  const customerName = order.user?.name || order.guestName || 'Client'

  if (!customerEmail) return

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Remboursement traité - Faith Shop</h2>

      <p>Bonjour ${customerName},</p>

      <p>Votre remboursement pour la commande <strong>#${order.orderNumber}</strong> a été traité avec succès.</p>

      <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3>Détails du remboursement</h3>
        <p><strong>Montant remboursé :</strong> ${refund.amount.toFixed(2)} €</p>
        <p><strong>Raison :</strong> ${refund.reason}</p>
        <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>

      <p>Le remboursement apparaîtra sur votre méthode de paiement originale dans un délai de 5 à 10 jours ouvrables.</p>

      <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>

      <p>Cordialement,<br><strong>L'équipe Faith Shop</strong></p>
    </div>
  `

  // Utiliser la fonction d'email existante ou implémenter selon votre système
  console.log('Email de remboursement à envoyer:', { customerEmail, content: emailContent })
}