import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer toutes les gift cards
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const giftCards = await prisma.giftCard.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true, email: true }
        },
        refunds: {
          select: { id: true, amount: true, reason: true }
        }
      }
    })

    return NextResponse.json(giftCards)

  } catch (error) {
    console.error('Erreur lors de la récupération des gift cards:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une nouvelle gift card
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { amount, recipientEmail, message, expiryMonths } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
    }

    if (!recipientEmail) {
      return NextResponse.json({ error: 'Email destinataire requis' }, { status: 400 })
    }

    // Générer un code unique
    const code = await generateUniqueGiftCardCode()

    // Date d'expiration
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + parseInt(expiryMonths))

    // Créer la gift card
    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        amount: amount,
        balance: amount,
        currency: 'EUR',
        recipientEmail,
        message: message || '',
        expiresAt,
        isActive: true,
        status: 'ACTIVE',
        createdById: session.user.id
      }
    })

    // Envoyer un email au destinataire (optionnel)
    try {
      await sendGiftCardEmail(giftCard)
    } catch (emailError) {
      console.error('Erreur envoi email gift card:', emailError)
      // On continue même si l'email échoue
    }

    return NextResponse.json({
      success: true,
      giftCard,
      message: 'Avoir créé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la création de la gift card:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Générer un code unique pour la gift card
async function generateUniqueGiftCardCode(): Promise<string> {
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    const code = generateGiftCardCode()

    const existing = await prisma.giftCard.findUnique({
      where: { code }
    })

    if (!existing) {
      return code
    }

    attempts++
  }

  throw new Error('Impossible de générer un code unique')
}

// Générer un code d'avoir
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'FAITH-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Envoyer email avec la gift card
async function sendGiftCardEmail(giftCard: any) {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #000000 0%, #333333 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="font-size: 28px; margin: 0; letter-spacing: 2px;">FAITH SHOP</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Votre avoir boutique</p>
      </div>

      <div style="padding: 30px; background: white;">
        <h2 style="color: #000; margin-bottom: 20px;">Vous avez reçu un avoir !</h2>

        <p>Bonne nouvelle ! Un avoir boutique Faith Shop a été créé pour vous.</p>

        <div style="background: #f8f9fa; border-left: 4px solid #000; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #000;">Code d'avoir</h3>
          <p style="font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; margin: 0; color: #000;">
            ${giftCard.code}
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <p><strong>Montant :</strong> ${giftCard.amount.toFixed(2)} €</p>
          <p><strong>Valide jusqu'au :</strong> ${new Date(giftCard.expiresAt).toLocaleDateString('fr-FR')}</p>
          ${giftCard.message ? `<p><strong>Message :</strong> ${giftCard.message}</p>` : ''}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/shop" style="background: #000; color: white; padding: 15px 30px; text-decoration: none; font-weight: bold; letter-spacing: 1px; display: inline-block;">
            UTILISER MON AVOIR
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <h3 style="color: #000;">Comment utiliser votre avoir ?</h3>
        <ol style="color: #666; line-height: 1.6;">
          <li>Parcourez notre boutique et ajoutez vos articles favoris au panier</li>
          <li>Au moment du paiement, saisissez votre code d'avoir</li>
          <li>Le montant sera automatiquement déduit de votre commande</li>
        </ol>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Si vous avez des questions, n'hésitez pas à nous contacter à contact@faith-shop.fr
        </p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} Faith Shop. Tous droits réservés.</p>
        <p>Streetwear avec un message</p>
      </div>
    </div>
  `

  // TODO: Implement email sending via sendEmail()
  // await sendEmail(giftCard.recipientEmail, `Votre avoir Faith Shop de ${giftCard.amount}€`, emailContent)
}