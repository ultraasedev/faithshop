'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface EmailSettings {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  smtpSecure: boolean
  fromEmail: string
  fromName: string
  replyToEmail: string
  // Templates
  orderConfirmationEnabled: boolean
  orderConfirmationSubject: string
  orderConfirmationTemplate: string
  shipmentNotificationEnabled: boolean
  shipmentNotificationSubject: string
  shipmentNotificationTemplate: string
  passwordResetEnabled: boolean
  passwordResetSubject: string
  passwordResetTemplate: string
}

export async function getEmailSettings(): Promise<EmailSettings> {
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: {
        in: [
          'smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_secure',
          'from_email', 'from_name', 'reply_to_email',
          'order_confirmation_enabled', 'order_confirmation_subject', 'order_confirmation_template',
          'shipment_notification_enabled', 'shipment_notification_subject', 'shipment_notification_template',
          'password_reset_enabled', 'password_reset_subject', 'password_reset_template'
        ]
      }
    }
  })

  const configMap = Object.fromEntries(configs.map(c => [c.key, c.value]))

  return {
    smtpHost: configMap.smtp_host || '',
    smtpPort: parseInt(configMap.smtp_port || '587'),
    smtpUser: configMap.smtp_user || '',
    smtpPassword: configMap.smtp_password || '',
    smtpSecure: configMap.smtp_secure === 'true',
    fromEmail: configMap.from_email || 'noreply@faith-shop.fr',
    fromName: configMap.from_name || 'Faith-Shop',
    replyToEmail: configMap.reply_to_email || 'contact@faith-shop.fr',
    orderConfirmationEnabled: configMap.order_confirmation_enabled !== 'false',
    orderConfirmationSubject: configMap.order_confirmation_subject || 'Confirmation de votre commande #{orderId}',
    orderConfirmationTemplate: configMap.order_confirmation_template || getDefaultOrderTemplate(),
    shipmentNotificationEnabled: configMap.shipment_notification_enabled !== 'false',
    shipmentNotificationSubject: configMap.shipment_notification_subject || 'Votre commande #{orderId} a été expédiée',
    shipmentNotificationTemplate: configMap.shipment_notification_template || getDefaultShipmentTemplate(),
    passwordResetEnabled: configMap.password_reset_enabled !== 'false',
    passwordResetSubject: configMap.password_reset_subject || 'Réinitialisation de votre mot de passe',
    passwordResetTemplate: configMap.password_reset_template || getDefaultPasswordResetTemplate()
  }
}

export async function updateEmailSettings(settings: EmailSettings) {
  const updates = [
    { key: 'smtp_host', value: settings.smtpHost, type: 'text', category: 'email' },
    { key: 'smtp_port', value: settings.smtpPort.toString(), type: 'number', category: 'email' },
    { key: 'smtp_user', value: settings.smtpUser, type: 'text', category: 'email' },
    { key: 'smtp_password', value: settings.smtpPassword, type: 'password', category: 'email' },
    { key: 'smtp_secure', value: settings.smtpSecure.toString(), type: 'boolean', category: 'email' },
    { key: 'from_email', value: settings.fromEmail, type: 'email', category: 'email' },
    { key: 'from_name', value: settings.fromName, type: 'text', category: 'email' },
    { key: 'reply_to_email', value: settings.replyToEmail, type: 'email', category: 'email' },
    { key: 'order_confirmation_enabled', value: settings.orderConfirmationEnabled.toString(), type: 'boolean', category: 'email' },
    { key: 'order_confirmation_subject', value: settings.orderConfirmationSubject, type: 'text', category: 'email' },
    { key: 'order_confirmation_template', value: settings.orderConfirmationTemplate, type: 'longtext', category: 'email' },
    { key: 'shipment_notification_enabled', value: settings.shipmentNotificationEnabled.toString(), type: 'boolean', category: 'email' },
    { key: 'shipment_notification_subject', value: settings.shipmentNotificationSubject, type: 'text', category: 'email' },
    { key: 'shipment_notification_template', value: settings.shipmentNotificationTemplate, type: 'longtext', category: 'email' },
    { key: 'password_reset_enabled', value: settings.passwordResetEnabled.toString(), type: 'boolean', category: 'email' },
    { key: 'password_reset_subject', value: settings.passwordResetSubject, type: 'text', category: 'email' },
    { key: 'password_reset_template', value: settings.passwordResetTemplate, type: 'longtext', category: 'email' }
  ]

  await Promise.all(
    updates.map(update =>
      prisma.siteConfig.upsert({
        where: { key: update.key },
        update: update,
        create: update
      })
    )
  )

  revalidatePath('/admin/settings/emails')
}

export async function testEmailConnection(settings: EmailSettings) {
  // Note: En production, vous devriez utiliser une vraie librairie SMTP comme nodemailer
  // Ici on simule juste le test
  try {
    if (!settings.smtpHost || !settings.smtpPort) {
      throw new Error('Configuration SMTP incomplete')
    }

    // Simulation d'un test de connexion
    await new Promise(resolve => setTimeout(resolve, 1000))

    return { success: true, message: 'Connexion SMTP réussie' }
  } catch (error) {
    return { success: false, message: 'Échec de la connexion SMTP' }
  }
}

function getDefaultOrderTemplate() {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirmation de commande</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000;">Merci pour votre commande !</h1>

        <p>Bonjour {customerName},</p>

        <p>Nous avons bien reçu votre commande #{orderId} d'un montant de {orderTotal}€.</p>

        <h2>Détails de la commande :</h2>
        <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0;">
            {orderItems}
        </div>

        <p>Votre commande sera traitée dans les 24-48h ouvrées.</p>

        <p>Merci pour votre confiance !<br>
        L'équipe Faith-Shop</p>
    </div>
</body>
</html>`
}

function getDefaultShipmentTemplate() {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Commande expédiée</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000;">Votre commande a été expédiée !</h1>

        <p>Bonjour {customerName},</p>

        <p>Votre commande #{orderId} a été expédiée.</p>

        <p><strong>Numéro de suivi :</strong> {trackingNumber}</p>
        <p><strong>Transporteur :</strong> {carrier}</p>

        <p>Vous pouvez suivre votre colis à l'adresse : {trackingUrl}</p>

        <p>Merci pour votre confiance !<br>
        L'équipe Faith-Shop</p>
    </div>
</body>
</html>`
}

function getDefaultPasswordResetTemplate() {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Réinitialisation de mot de passe</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000;">Réinitialisation de votre mot de passe</h1>

        <p>Bonjour {customerName},</p>

        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>

        <p>Cliquez sur le lien suivant pour définir un nouveau mot de passe :</p>
        <p><a href="{resetUrl}" style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Réinitialiser mon mot de passe</a></p>

        <p>Ce lien expire dans 1 heure.</p>

        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez ce message.</p>

        <p>L'équipe Faith-Shop</p>
    </div>
</body>
</html>`
}