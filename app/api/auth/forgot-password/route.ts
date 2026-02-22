import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Pour des raisons de sécurité, on retourne toujours la même réponse
    // même si l'utilisateur n'existe pas (pour ne pas révéler si un email existe)
    if (!user) {
      return NextResponse.json(
        { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' },
        { status: 200 }
      )
    }

    // Générer un token unique
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Le token expire dans 1 heure
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    // Enregistrer le token dans la base de données
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Créer le lien de réinitialisation
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    // Envoyer l'email de réinitialisation
    let emailResult = { success: true, error: null }

    try {
      emailResult = await sendPasswordResetEmail(
        user.email,
        user.name || 'Client',
        resetUrl
      )

      if (!emailResult.success) {
        console.error('Email sending failed:', emailResult.error)
      }
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // En développement, on continue même si l'email échoue
      emailResult = { success: false, error: emailError }
    }

    return NextResponse.json(
      {
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
        // En développement, on peut retourner le token pour faciliter les tests
        ...(process.env.NODE_ENV === 'development' && { resetUrl }),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
