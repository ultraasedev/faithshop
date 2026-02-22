import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail }
    })

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ error: 'Vous êtes déjà inscrit(e) !' }, { status: 409 })
      }
      // Reactivate
      await prisma.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: { isActive: true }
      })
    } else {
      await prisma.newsletterSubscriber.create({
        data: { email: normalizedEmail }
      })
    }

    // Send welcome email
    try {
      const { sendNewsletterWelcomeEmail } = await import('@/lib/email')
      await sendNewsletterWelcomeEmail(normalizedEmail)
    } catch (emailError) {
      console.error('Newsletter welcome email error:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
