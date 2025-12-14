'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface PaymentSettings {
  // Stripe Configuration
  stripePublishableKey: string
  stripeSecretKey: string
  stripeWebhookSecret: string
  stripeMode: 'test' | 'live'

  // Payment Methods
  acceptVisa: boolean
  acceptMastercard: boolean
  acceptAmex: boolean
  acceptGooglePay: boolean
  acceptApplePay: boolean
  acceptBancontact: boolean
  acceptIdeal: boolean
  acceptSepa: boolean

  // Currency & Fees
  currency: string
  minimumOrderAmount: number
  maximumOrderAmount: number
  processingFeePercentage: number
  processingFeeFixed: number

  // Security & Compliance
  require3DSecure: boolean
  enableFraudDetection: boolean
  savePaymentMethods: boolean

  // Refunds
  automaticRefunds: boolean
  refundProcessingTime: string
  refundNotifications: boolean
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: {
        in: [
          'stripe_publishable_key', 'stripe_secret_key', 'stripe_webhook_secret', 'stripe_mode',
          'accept_visa', 'accept_mastercard', 'accept_amex', 'accept_google_pay', 'accept_apple_pay',
          'accept_bancontact', 'accept_ideal', 'accept_sepa',
          'currency', 'minimum_order_amount', 'maximum_order_amount',
          'processing_fee_percentage', 'processing_fee_fixed',
          'require_3d_secure', 'enable_fraud_detection', 'save_payment_methods',
          'automatic_refunds', 'refund_processing_time', 'refund_notifications'
        ]
      }
    }
  })

  const configMap = Object.fromEntries(configs.map(c => [c.key, c.value]))

  return {
    stripePublishableKey: configMap.stripe_publishable_key || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    stripeSecretKey: configMap.stripe_secret_key || '••••••••••••••••', // Masqué
    stripeWebhookSecret: configMap.stripe_webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || '',
    stripeMode: (configMap.stripe_mode as 'test' | 'live') || (process.env.NODE_ENV === 'development' ? 'test' : 'live'),

    acceptVisa: configMap.accept_visa !== 'false',
    acceptMastercard: configMap.accept_mastercard !== 'false',
    acceptAmex: configMap.accept_amex !== 'false',
    acceptGooglePay: configMap.accept_google_pay !== 'false',
    acceptApplePay: configMap.accept_apple_pay !== 'false',
    acceptBancontact: configMap.accept_bancontact === 'true',
    acceptIdeal: configMap.accept_ideal === 'true',
    acceptSepa: configMap.accept_sepa === 'true',

    currency: configMap.currency || 'eur',
    minimumOrderAmount: parseFloat(configMap.minimum_order_amount || '5'),
    maximumOrderAmount: parseFloat(configMap.maximum_order_amount || '10000'),
    processingFeePercentage: parseFloat(configMap.processing_fee_percentage || '2.9'),
    processingFeeFixed: parseFloat(configMap.processing_fee_fixed || '0.30'),

    require3DSecure: configMap.require_3d_secure !== 'false',
    enableFraudDetection: configMap.enable_fraud_detection !== 'false',
    savePaymentMethods: configMap.save_payment_methods !== 'false',

    automaticRefunds: configMap.automatic_refunds === 'true',
    refundProcessingTime: configMap.refund_processing_time || '5-10 jours ouvrés',
    refundNotifications: configMap.refund_notifications !== 'false'
  }
}

export async function updatePaymentSettings(settings: PaymentSettings) {
  const updates = [
    { key: 'stripe_mode', value: settings.stripeMode, type: 'text', category: 'payments' },

    { key: 'accept_visa', value: settings.acceptVisa.toString(), type: 'boolean', category: 'payments' },
    { key: 'accept_mastercard', value: settings.acceptMastercard.toString(), type: 'boolean', category: 'payments' },
    { key: 'accept_amex', value: settings.acceptAmex.toString(), type: 'boolean', category: 'payments' },
    { key: 'accept_google_pay', value: settings.acceptGooglePay.toString(), type: 'boolean', category: 'payments' },
    { key: 'accept_apple_pay', value: settings.acceptApplePay.toString(), type: 'boolean', category: 'payments' },
    { key: 'accept_bancontact', value: settings.acceptBancontact.toString(), type: 'boolean', category: 'payments' },
    { key: 'accept_ideal', value: settings.acceptIdeal.toString(), type: 'boolean', category: 'payments' },
    { key: 'accept_sepa', value: settings.acceptSepa.toString(), type: 'boolean', category: 'payments' },

    { key: 'currency', value: settings.currency, type: 'text', category: 'payments' },
    { key: 'minimum_order_amount', value: settings.minimumOrderAmount.toString(), type: 'number', category: 'payments' },
    { key: 'maximum_order_amount', value: settings.maximumOrderAmount.toString(), type: 'number', category: 'payments' },
    { key: 'processing_fee_percentage', value: settings.processingFeePercentage.toString(), type: 'number', category: 'payments' },
    { key: 'processing_fee_fixed', value: settings.processingFeeFixed.toString(), type: 'number', category: 'payments' },

    { key: 'require_3d_secure', value: settings.require3DSecure.toString(), type: 'boolean', category: 'payments' },
    { key: 'enable_fraud_detection', value: settings.enableFraudDetection.toString(), type: 'boolean', category: 'payments' },
    { key: 'save_payment_methods', value: settings.savePaymentMethods.toString(), type: 'boolean', category: 'payments' },

    { key: 'automatic_refunds', value: settings.automaticRefunds.toString(), type: 'boolean', category: 'payments' },
    { key: 'refund_processing_time', value: settings.refundProcessingTime, type: 'text', category: 'payments' },
    { key: 'refund_notifications', value: settings.refundNotifications.toString(), type: 'boolean', category: 'payments' }
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

  revalidatePath('/admin/settings/payments')
}

export async function getPaymentStats() {
  // Récupérer les statistiques de paiement
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  try {
    const [currentMonthStats, lastMonthStats, totalStats] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startOfMonth }
        },
        _sum: { total: true },
        _count: true
      }),

      prisma.order.aggregate({
        where: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
        },
        _sum: { total: true },
        _count: true
      }),

      prisma.order.aggregate({
        where: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
        },
        _sum: { total: true },
        _count: true
      })
    ])

    const currentRevenue = currentMonthStats._sum.total || 0
    const lastMonthRevenue = lastMonthStats._sum.total || 0
    const revenueGrowth = lastMonthRevenue > 0
      ? ((Number(currentRevenue) - Number(lastMonthRevenue)) / Number(lastMonthRevenue)) * 100
      : 0

    const currentOrders = currentMonthStats._count || 0
    const lastMonthOrders = lastMonthStats._count || 0
    const ordersGrowth = lastMonthOrders > 0
      ? ((currentOrders - lastMonthOrders) / lastMonthOrders) * 100
      : 0

    // Calculer le taux de réussite des paiements
    const failedPayments = await prisma.order.count({
      where: {
        status: 'CANCELLED',
        createdAt: { gte: startOfMonth }
      }
    })

    const totalAttempts = currentOrders + failedPayments
    const successRate = totalAttempts > 0 ? (currentOrders / totalAttempts) * 100 : 100

    return {
      currentMonthRevenue: Number(currentRevenue),
      lastMonthRevenue: Number(lastMonthRevenue),
      revenueGrowth,
      currentMonthOrders: currentOrders,
      lastMonthOrders: lastMonthOrders,
      ordersGrowth,
      totalRevenue: Number(totalStats._sum.total || 0),
      totalOrders: totalStats._count || 0,
      successRate,
      averageOrderValue: currentOrders > 0 ? Number(currentRevenue) / currentOrders : 0
    }
  } catch (error) {
    console.error('Error fetching payment stats:', error)
    return {
      currentMonthRevenue: 0,
      lastMonthRevenue: 0,
      revenueGrowth: 0,
      currentMonthOrders: 0,
      lastMonthOrders: 0,
      ordersGrowth: 0,
      totalRevenue: 0,
      totalOrders: 0,
      successRate: 100,
      averageOrderValue: 0
    }
  }
}

export async function testStripeConnection() {
  // Note: En production, vous devriez tester la vraie connexion Stripe
  try {
    // Simulation d'un test de connexion
    await new Promise(resolve => setTimeout(resolve, 1000))

    const hasKeys = process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!hasKeys) {
      return { success: false, message: 'Clés Stripe manquantes dans les variables d\'environnement' }
    }

    return { success: true, message: 'Connexion Stripe réussie' }
  } catch (error) {
    return { success: false, message: 'Échec de la connexion Stripe' }
  }
}