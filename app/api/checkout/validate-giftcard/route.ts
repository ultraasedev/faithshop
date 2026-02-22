import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Code requis' }, { status: 400 })
    }

    const giftCard = await prisma.giftCard.findUnique({
      where: { code: code.toUpperCase().replace(/-/g, '').trim() },
    })

    if (!giftCard) {
      return NextResponse.json({ valid: false, error: 'Carte cadeau invalide' })
    }

    if (giftCard.status !== 'ACTIVE') {
      return NextResponse.json({ valid: false, error: 'Cette carte cadeau n\'est plus active' })
    }

    if (giftCard.expiresAt && new Date() > giftCard.expiresAt) {
      return NextResponse.json({ valid: false, error: 'Cette carte cadeau a expiré' })
    }

    const balance = Number(giftCard.balance)
    if (balance <= 0) {
      return NextResponse.json({ valid: false, error: 'Cette carte cadeau a un solde de 0€' })
    }

    return NextResponse.json({
      valid: true,
      code: giftCard.code,
      balance,
    })
  } catch (error) {
    console.error('Error validating gift card:', error)
    return NextResponse.json({ valid: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
