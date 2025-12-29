import nodemailer from 'nodemailer'

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true pour 465, false pour autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

const FROM_EMAIL = process.env.SMTP_FROM || 'Faith Shop <noreply@faith-shop.fr>'
const SITE_URL = process.env.NEXTAUTH_URL || 'https://faith-shop.fr'

// Templates d'email
const emailStyles = `
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f8f8; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #000000; padding: 40px 30px; text-align: center; }
    .header img { height: 50px; }
    .header h1 { color: #ffffff; font-size: 28px; font-weight: 300; letter-spacing: 4px; margin: 0; }
    .content { padding: 50px 40px; }
    .content h2 { font-size: 24px; font-weight: 600; margin-bottom: 20px; color: #000000; }
    .content p { font-size: 16px; line-height: 1.7; color: #444444; margin-bottom: 20px; }
    .button { display: inline-block; background-color: #000000; color: #ffffff !important; text-decoration: none; padding: 16px 40px; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 20px 0; }
    .button:hover { background-color: #333333; }
    .footer { background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0; }
    .footer p { font-size: 12px; color: #888888; margin: 5px 0; }
    .footer a { color: #000000; text-decoration: none; }
    .divider { height: 1px; background-color: #e0e0e0; margin: 30px 0; }
    .highlight-box { background-color: #f8f8f8; border-left: 4px solid #000000; padding: 20px; margin: 25px 0; }
    .social-links { margin-top: 20px; }
    .social-links a { display: inline-block; margin: 0 10px; }
  </style>
`

const emailLayout = (content: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FAITH SHOP</h1>
    </div>
    ${content}
    <div class="footer">
      <p><a href="${SITE_URL}">Faith Shop</a> - Streetwear avec un message</p>
      <p>&copy; ${new Date().getFullYear()} Faith Shop. Tous droits réservés.</p>
      <div class="social-links">
        <a href="https://instagram.com/faithshop">Instagram</a> |
        <a href="https://tiktok.com/@faithshop">TikTok</a>
      </div>
    </div>
  </div>
</body>
</html>
`

// Fonction d'envoi générique
async function sendEmail(to: string, subject: string, html: string) {
  try {
    // Vérifier la configuration SMTP avant d'essayer d'envoyer
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('SMTP configuration incomplete, email not sent in development')
      return {
        success: false,
        error: 'SMTP configuration incomplete',
        devMode: true
      }
    }

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

// Email de bienvenue
export async function sendWelcomeEmail(to: string, name: string) {
  const firstName = name.split(' ')[0]

  const content = `
    <div class="content">
      <h2>Bienvenue dans la famille, ${firstName} !</h2>

      <p>Nous sommes ravis de t'accueillir chez <strong>Faith Shop</strong>.</p>

      <p>Tu fais maintenant partie d'une communauté qui croit en quelque chose de plus grand. Chaque pièce que nous créons porte un message d'espoir et de foi.</p>

      <div class="highlight-box">
        <p style="margin: 0; font-style: italic;">
          "Car nous marchons par la foi et non par la vue." — 2 Corinthiens 5:7
        </p>
      </div>

      <p>Découvre notre dernière collection et trouve la pièce qui te correspond :</p>

      <div style="text-align: center;">
        <a href="${SITE_URL}/shop" class="button">Découvrir la collection</a>
      </div>

      <div class="divider"></div>

      <p style="font-size: 14px; color: #666;">
        <strong>Ton compte te permet de :</strong><br>
        • Suivre tes commandes en temps réel<br>
        • Enregistrer tes articles favoris<br>
        • Profiter d'offres exclusives membres<br>
        • Accéder à ton historique d'achats
      </p>

      <p>À très vite,<br><strong>L'équipe Faith Shop</strong></p>
    </div>
  `

  return sendEmail(to, `Bienvenue chez Faith Shop, ${firstName} !`, emailLayout(content))
}

// Email de réinitialisation de mot de passe
export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const firstName = name?.split(' ')[0] || 'Client'

  const content = `
    <div class="content">
      <h2>Réinitialisation de ton mot de passe</h2>

      <p>Bonjour ${firstName},</p>

      <p>Tu as demandé à réinitialiser le mot de passe de ton compte Faith Shop.</p>

      <p>Clique sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
      </div>

      <div class="highlight-box">
        <p style="margin: 0; font-size: 14px;">
          <strong>Ce lien expire dans 1 heure.</strong><br>
          Si tu n'as pas demandé cette réinitialisation, tu peux ignorer cet email.
        </p>
      </div>

      <p style="font-size: 14px; color: #666;">
        Si le bouton ne fonctionne pas, copie et colle ce lien dans ton navigateur :<br>
        <a href="${resetUrl}" style="word-break: break-all; color: #000;">${resetUrl}</a>
      </p>

      <div class="divider"></div>

      <p>À bientôt,<br><strong>L'équipe Faith Shop</strong></p>
    </div>
  `

  return sendEmail(to, 'Réinitialise ton mot de passe Faith Shop', emailLayout(content))
}

// Email de confirmation de commande
export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderNumber: string,
  orderDetails: {
    items: { name: string; quantity: number; price: number; color?: string; size?: string }[]
    subtotal: number
    shipping: number
    total: number
    shippingAddress: string
  }
) {
  const firstName = name?.split(' ')[0] || 'Client'

  const itemsHtml = orderDetails.items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #e0e0e0;">
        <strong>${item.name}</strong><br>
        <span style="font-size: 12px; color: #666;">${item.color || ''} ${item.size ? `/ ${item.size}` : ''}</span>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
      <td style="padding: 15px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${item.price.toFixed(2)} &euro;</td>
    </tr>
  `).join('')

  const content = `
    <div class="content">
      <h2>Merci pour ta commande, ${firstName} !</h2>

      <p>Ta commande <strong>#${orderNumber}</strong> a bien été enregistrée.</p>

      <div class="highlight-box">
        <p style="margin: 0;">
          Tu recevras un email de confirmation dès que ta commande sera expédiée avec le numéro de suivi.
        </p>
      </div>

      <h3 style="margin-top: 30px; font-size: 18px;">Récapitulatif de ta commande</h3>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="border-bottom: 2px solid #000;">
            <th style="text-align: left; padding: 10px 0;">Article</th>
            <th style="text-align: center; padding: 10px 0;">Qté</th>
            <th style="text-align: right; padding: 10px 0;">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <table style="width: 100%; margin-top: 20px;">
        <tr>
          <td style="padding: 5px 0;">Sous-total</td>
          <td style="text-align: right;">${orderDetails.subtotal.toFixed(2)} &euro;</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">Livraison</td>
          <td style="text-align: right;">${orderDetails.shipping === 0 ? 'Gratuite' : `${orderDetails.shipping.toFixed(2)} &euro;`}</td>
        </tr>
        <tr style="font-weight: bold; font-size: 18px;">
          <td style="padding: 15px 0; border-top: 2px solid #000;">Total</td>
          <td style="padding: 15px 0; border-top: 2px solid #000; text-align: right;">${orderDetails.total.toFixed(2)} &euro;</td>
        </tr>
      </table>

      <div class="divider"></div>

      <h3 style="font-size: 16px;">Adresse de livraison</h3>
      <p style="color: #666; white-space: pre-line;">${orderDetails.shippingAddress}</p>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${SITE_URL}/account/orders" class="button">Suivre ma commande</a>
      </div>

      <p style="margin-top: 30px;">Merci de ta confiance,<br><strong>L'équipe Faith Shop</strong></p>
    </div>
  `

  return sendEmail(to, `Commande #${orderNumber} confirmée - Faith Shop`, emailLayout(content))
}

// Email d'expédition
export async function sendShippingEmail(
  to: string,
  name: string,
  orderNumber: string,
  trackingNumber: string,
  trackingUrl: string,
  carrier: string
) {
  const firstName = name?.split(' ')[0] || 'Client'

  const content = `
    <div class="content">
      <h2>Ta commande est en route !</h2>

      <p>Bonne nouvelle ${firstName} !</p>

      <p>Ta commande <strong>#${orderNumber}</strong> vient d'être expédiée.</p>

      <div class="highlight-box">
        <p style="margin: 0;">
          <strong>Transporteur :</strong> ${carrier}<br>
          <strong>Numéro de suivi :</strong> ${trackingNumber}
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${trackingUrl}" class="button">Suivre mon colis</a>
      </div>

      <p style="font-size: 14px; color: #666;">
        Tu peux suivre l'acheminement de ton colis en temps réel grâce au lien ci-dessus.
        La livraison devrait intervenir dans les 2 à 5 jours ouvrés.
      </p>

      <div class="divider"></div>

      <p>À très vite,<br><strong>L'équipe Faith Shop</strong></p>
    </div>
  `

  return sendEmail(to, `Ta commande #${orderNumber} est en route !`, emailLayout(content))
}

// Email de remboursement
export async function sendRefundEmail(
  to: string,
  name: string,
  orderNumber: string,
  amount: number,
  type: 'total' | 'partiel'
) {
  const firstName = name?.split(' ')[0] || 'Client'

  const content = `
    <div class="content">
      <h2>Remboursement ${type === 'total' ? 'effectué' : 'partiel effectué'}</h2>

      <p>Bonjour ${firstName},</p>

      <p>Nous avons bien traité le remboursement de ta commande <strong>#${orderNumber}</strong>.</p>

      <div class="highlight-box">
        <p style="margin: 0;">
          <strong>Montant remboursé :</strong> ${amount.toFixed(2)} €<br>
          <strong>Type :</strong> Remboursement ${type}
        </p>
      </div>

      <p>Le montant sera crédité sur ton moyen de paiement d'origine dans un délai de 5 à 10 jours ouvrés, selon ta banque.</p>

      ${type === 'partiel' ? `
        <p style="font-size: 14px; color: #666;">
          Note : Comme il s'agit d'un remboursement partiel, le reste de ta commande reste inchangé.
        </p>
      ` : ''}

      <div class="divider"></div>

      <p>Si tu as des questions, n'hésite pas à nous contacter.</p>

      <div style="text-align: center;">
        <a href="${SITE_URL}/contact" class="button">Nous contacter</a>
      </div>

      <p style="margin-top: 30px;">L'équipe Faith Shop</p>
    </div>
  `

  return sendEmail(to, `Remboursement de ta commande #${orderNumber}`, emailLayout(content))
}

// Email de livraison effectuée
export async function sendDeliveryConfirmationEmail(
  to: string,
  name: string,
  orderNumber: string
) {
  const firstName = name?.split(' ')[0] || 'Client'

  const content = `
    <div class="content">
      <h2>Ta commande a été livrée !</h2>

      <p>Bonjour ${firstName},</p>

      <p>Ta commande <strong>#${orderNumber}</strong> a bien été livrée.</p>

      <p>Nous espérons que tu es satisfait(e) de tes achats ! Ton avis compte beaucoup pour nous.</p>

      <div style="text-align: center;">
        <a href="${SITE_URL}/account/orders" class="button">Donner mon avis</a>
      </div>

      <div class="highlight-box">
        <p style="margin: 0; font-style: italic;">
          "Revêtez-vous du Seigneur Jésus Christ" — Romains 13:14
        </p>
      </div>

      <div class="divider"></div>

      <p>Merci de ta confiance,<br><strong>L'équipe Faith Shop</strong></p>
    </div>
  `

  return sendEmail(to, `Ta commande #${orderNumber} a été livrée !`, emailLayout(content))
}

// Email de création de compte staff
export async function sendStaffWelcomeEmail(
  to: string,
  name: string,
  temporaryPassword: string
) {
  const firstName = name?.split(' ')[0] || 'Membre'

  const content = `
    <div class="content">
      <h2>Bienvenue dans l'équipe Faith Shop !</h2>

      <p>Bonjour ${firstName},</p>

      <p>Un compte administrateur a été créé pour vous sur <strong>Faith Shop</strong>.</p>

      <div class="highlight-box">
        <p style="margin: 0 0 10px 0;">
          <strong>Vos identifiants de connexion :</strong>
        </p>
        <p style="margin: 0;">
          <strong>Email :</strong> ${to}<br>
          <strong>Mot de passe temporaire :</strong> <code style="background: #e0e0e0; padding: 2px 8px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code>
        </p>
      </div>

      <p style="color: #d32f2f; font-weight: 500;">
        Important : Nous vous recommandons de changer ce mot de passe dès votre première connexion.
      </p>

      <div style="text-align: center;">
        <a href="${SITE_URL}/login" class="button">Se connecter</a>
      </div>

      <div class="divider"></div>

      <p style="font-size: 14px; color: #666;">
        Si vous n'avez pas demandé ce compte, veuillez ignorer cet email ou contacter l'administrateur.
      </p>

      <p>Bienvenue dans l'équipe !<br><strong>Faith Shop</strong></p>
    </div>
  `

  return sendEmail(to, 'Votre compte administrateur Faith Shop', emailLayout(content))
}

// Email de réinitialisation de mot de passe staff (nouveau mot de passe généré)
export async function sendStaffPasswordResetEmail(
  to: string,
  name: string,
  newPassword: string
) {
  const firstName = name?.split(' ')[0] || 'Membre'

  const content = `
    <div class="content">
      <h2>Votre nouveau mot de passe</h2>

      <p>Bonjour ${firstName},</p>

      <p>Votre mot de passe Faith Shop a été réinitialisé par un administrateur.</p>

      <div class="highlight-box">
        <p style="margin: 0 0 10px 0;">
          <strong>Votre nouveau mot de passe :</strong>
        </p>
        <p style="margin: 0;">
          <code style="background: #e0e0e0; padding: 4px 12px; border-radius: 4px; font-family: monospace; font-size: 16px;">${newPassword}</code>
        </p>
      </div>

      <p style="color: #d32f2f; font-weight: 500;">
        Important : Nous vous recommandons de changer ce mot de passe dès votre prochaine connexion.
      </p>

      <div style="text-align: center;">
        <a href="${SITE_URL}/login" class="button">Se connecter</a>
      </div>

      <div class="divider"></div>

      <p style="font-size: 14px; color: #666;">
        Si vous n'avez pas demandé cette réinitialisation, contactez immédiatement l'administrateur.
      </p>

      <p>L'équipe Faith Shop</p>
    </div>
  `

  return sendEmail(to, 'Votre mot de passe Faith Shop a été réinitialisé', emailLayout(content))
}

// Email de demande de retour
export async function sendReturnRequestEmail(
  to: string,
  name: string,
  orderNumber: string,
  returnNumber: string
) {
  const firstName = name?.split(' ')[0] || 'Client'

  const content = `
    <div class="content">
      <h2>Demande de retour reçue</h2>

      <p>Bonjour ${firstName},</p>

      <p>Nous avons bien reçu ta demande de retour pour la commande <strong>#${orderNumber}</strong>.</p>

      <div class="highlight-box">
        <p style="margin: 0;">
          <strong>Numéro de retour :</strong> ${returnNumber}<br>
          <strong>Statut :</strong> En attente de validation
        </p>
      </div>

      <p>Notre équipe va examiner ta demande et te répondra sous 48 heures ouvrées.</p>

      <p><strong>Prochaines étapes :</strong></p>
      <ol style="color: #666; font-size: 14px;">
        <li>Nous validons ta demande de retour</li>
        <li>Tu reçois une étiquette de retour prépayée</li>
        <li>Tu déposes ton colis chez le transporteur</li>
        <li>Nous te remboursons dès réception du colis</li>
      </ol>

      <div style="text-align: center;">
        <a href="${SITE_URL}/account/returns" class="button">Suivre mon retour</a>
      </div>

      <div class="divider"></div>

      <p>Si tu as des questions, n'hésite pas à nous contacter.</p>

      <p>L'équipe Faith Shop</p>
    </div>
  `

  return sendEmail(to, `Demande de retour #${returnNumber} reçue`, emailLayout(content))
}
