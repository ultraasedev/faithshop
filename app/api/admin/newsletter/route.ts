import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

const FROM_EMAIL = process.env.SMTP_FROM || 'Faith Shop <noreply@faith-shop.fr>'
const SITE_URL = process.env.NEXTAUTH_URL || 'https://faith-shop.fr'

// GET - List all subscribers
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const stats = {
      total: subscribers.length,
      active: subscribers.filter(s => s.isActive).length,
      inactive: subscribers.filter(s => !s.isActive).length,
    }

    return NextResponse.json({ subscribers, stats })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Send a newsletter campaign
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { subject, content, testEmail } = await request.json()

    if (!subject || !content) {
      return NextResponse.json({ error: 'Sujet et contenu requis' }, { status: 400 })
    }

    // If testEmail is provided, send only to that address
    const recipients = testEmail
      ? [{ email: testEmail }]
      : await prisma.newsletterSubscriber.findMany({
          where: { isActive: true },
          select: { email: true },
        })

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'Aucun destinataire actif' }, { status: 400 })
    }

    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f8f8;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background-color: #000000; padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 300; letter-spacing: 4px; margin: 0;">FAITH SHOP</h1>
    </div>
    <div style="padding: 50px 40px;">
      ${content}
    </div>
    <div style="background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="font-size: 12px; color: #999999; margin: 0;">
        Vous recevez cet email car vous êtes inscrit(e) à la newsletter Faith Shop.
      </p>
      <p style="font-size: 12px; color: #999999; margin: 10px 0 0;">
        <a href="${SITE_URL}/api/newsletter/unsubscribe?email=%%EMAIL%%" style="color: #999999;">Se désinscrire</a>
        &nbsp;|&nbsp;
        <a href="${SITE_URL}" style="color: #999999;">Visiter Faith Shop</a>
      </p>
    </div>
  </div>
</body>
</html>`

    let sent = 0
    let errors = 0

    // Send emails in batches of 5 to avoid rate limits
    for (let i = 0; i < recipients.length; i += 5) {
      const batch = recipients.slice(i, i + 5)
      const results = await Promise.allSettled(
        batch.map(r =>
          transporter.sendMail({
            from: FROM_EMAIL,
            to: r.email,
            subject,
            html: htmlTemplate.replace(/%%EMAIL%%/g, encodeURIComponent(r.email)),
          })
        )
      )
      results.forEach(r => {
        if (r.status === 'fulfilled') sent++
        else errors++
      })
    }

    return NextResponse.json({
      success: true,
      message: testEmail
        ? `Email de test envoyé à ${testEmail}`
        : `Newsletter envoyée: ${sent} envoyés, ${errors} erreurs`,
      sent,
      errors,
      total: recipients.length,
    })
  } catch (error: any) {
    console.error('Newsletter send error:', error)
    return NextResponse.json({ error: error.message || 'Erreur d\'envoi' }, { status: 500 })
  }
}

// DELETE - Remove a subscriber
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await request.json()
    await prisma.newsletterSubscriber.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH - Toggle subscriber active status
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id, isActive } = await request.json()
    const subscriber = await prisma.newsletterSubscriber.update({
      where: { id },
      data: { isActive },
    })
    return NextResponse.json({ success: true, subscriber })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
