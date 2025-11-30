import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true pour le port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Veuillez remplir tous les champs obligatoires' },
        { status: 400 }
      )
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Adresse email invalide' },
        { status: 400 }
      )
    }

    // Email envoyé à l'équipe
    await transporter.sendMail({
      from: `"Faith Shop Contact" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_FROM,
      replyTo: email,
      subject: `[Contact] ${subject || 'Nouveau message'} - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #666; }
            .value { margin-top: 5px; }
            .message { background: #fff; padding: 15px; border-left: 4px solid #000; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FAITH SHOP</h1>
              <p>Nouveau message de contact</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Nom</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              ${subject ? `
              <div class="field">
                <div class="label">Sujet</div>
                <div class="value">${subject}</div>
              </div>
              ` : ''}
              <div class="message">
                <div class="label">Message</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    // Email de confirmation au client
    await transporter.sendMail({
      from: `"Faith Shop" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Merci pour votre message - Faith Shop',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #fff; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FAITH SHOP</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${name},</h2>
              <p>Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.</p>
              <p>Notre équipe vous répondra dans les plus brefs délais, généralement sous 24 à 48 heures ouvrées.</p>
              <p>En attendant, n'hésitez pas à découvrir notre collection sur <a href="https://faith-shop.fr">faith-shop.fr</a>.</p>
              <p>À très bientôt,<br><strong>L'équipe Faith Shop</strong></p>
            </div>
            <div class="footer">
              <p>Faith Shop - Mode chrétienne premium</p>
              <p>Cet email est une confirmation automatique, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'Votre message a été envoyé avec succès',
    })
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
