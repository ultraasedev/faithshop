'use server'

import nodemailer from 'nodemailer'

export async function sendContactEmail(formData: FormData) {
  const firstname = formData.get('firstname') as string
  const lastname = formData.get('lastname') as string
  const email = formData.get('email') as string
  const subject = formData.get('subject') as string
  const message = formData.get('message') as string

  // Configuration du transporteur SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "mail.faith-shop.fr",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true, // true pour port 465 (SSL)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  try {
    // Envoi de l'email
    await transporter.sendMail({
      from: `"${firstname} ${lastname}" <${process.env.SMTP_USER}>`, // L'expéditeur doit souvent être le même que l'auth user
      to: process.env.CONTACT_EMAIL || "contact@faith-shop.fr", // L'adresse qui reçoit les messages
      replyTo: email, // Pour répondre directement au client
      subject: `[Contact Faith Shop] ${subject}`,
      text: message,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Nouveau message de contact</h2>
          <p><strong>De :</strong> ${firstname} ${lastname} (${email})</p>
          <p><strong>Sujet :</strong> ${subject}</p>
          <hr />
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    })

    console.log('Email envoyé avec succès')
    return { success: true, message: 'Votre message a bien été envoyé !' }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error)
    // En mode développement, on peut vouloir simuler le succès même sans SMTP configuré
    if (process.env.NODE_ENV === 'development') {
        console.log("Mode DEV : Simulation d'envoi réussie malgré l'erreur SMTP.")
        return { success: true, message: 'Simulation : Message envoyé (configurez le SMTP pour le prod)' }
    }
    return { success: false, message: "Une erreur est survenue lors de l'envoi." }
  }
}
