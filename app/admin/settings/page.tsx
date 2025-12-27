import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SettingsClient } from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  // Get site config
  const configs = await prisma.siteConfig.findMany()

  // Build config object
  const siteConfig = {
    general: {
      siteName: 'Faith Shop',
      tagline: 'Streetwear avec un message',
      logo: '',
      favicon: '',
      email: 'contact@faith-shop.fr',
      phone: '',
      address: ''
    },
    theme: {
      primaryColor: '#000000',
      secondaryColor: '#666666',
      accentColor: '#3b82f6',
      backgroundColor: '#ffffff',
      darkMode: false
    },
    seo: {
      metaTitle: 'Faith Shop - Streetwear Premium',
      metaDescription: 'Découvrez notre collection de vêtements streetwear de qualité.',
      keywords: 'streetwear, vêtements, mode, qualité',
      ogImage: '',
      googleAnalyticsId: '',
      facebookPixelId: ''
    },
    shipping: {
      freeShippingThreshold: 50,
      standardShippingPrice: 4.95,
      expressShippingPrice: 9.95,
      processingTime: '1-2 jours ouvrés',
      shippingZones: ['France', 'Belgique', 'Suisse', 'Luxembourg']
    },
    checkout: {
      guestCheckout: true,
      minOrderValue: 0,
      maxOrderValue: 5000,
      enableInstallments: true,
      installmentsMinAmount: 50,
      paymentMethods: ['card', 'paypal']
    },
    notifications: {
      orderConfirmation: true,
      shippingUpdates: true,
      abandonedCart: true,
      abandonedCartDelay: 24,
      reviewReminder: true,
      reviewReminderDelay: 7
    }
  }

  // Apply database configs
  configs.forEach(config => {
    const keys = config.key.split('.')
    let current = siteConfig as Record<string, unknown>

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {} as Record<string, unknown>
      }
      current = current[keys[i]] as Record<string, unknown>
    }

    const lastKey = keys[keys.length - 1]
    try {
      current[lastKey] = config.type === 'JSON' ? JSON.parse(config.value) : config.value
    } catch {
      current[lastKey] = config.value
    }
  })

  return <SettingsClient config={siteConfig} />
}
