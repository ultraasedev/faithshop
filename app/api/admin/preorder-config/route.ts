import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Récupérer la configuration de pré-commande (public)
export async function GET() {
  try {
    // Public endpoint - no auth required for reading preorder config
    const configs = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: ['preorder_enabled', 'preorder_message', 'preorder_shipping_date', 'preorder_show_pages']
        }
      }
    })

    const configMap = configs.reduce((acc, config) => {
      let value = config.value
      if (config.type === 'boolean') {
        value = config.value === 'true'
      } else if (config.type === 'json') {
        try {
          value = JSON.parse(config.value)
        } catch {
          value = config.value
        }
      }
      acc[config.key] = value
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      enabled: configMap.preorder_enabled ?? false,
      message: configMap.preorder_message ?? 'Expédition le 16 janvier 2025',
      shippingDate: configMap.preorder_shipping_date ?? '2025-01-16',
      showPages: configMap.preorder_show_pages ?? ['product', 'checkout']
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la config pré-commande:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Mettre à jour la configuration de pré-commande (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { enabled, message, shippingDate, showPages } = await request.json()

    // Mettre à jour les configurations
    const updates = [
      {
        key: 'preorder_enabled',
        value: enabled.toString(),
        type: 'boolean',
        category: 'shop',
        label: 'Activer les pré-commandes',
        description: 'Active/désactive le système de pré-commande sur le site'
      },
      {
        key: 'preorder_message',
        value: message,
        type: 'text',
        category: 'shop',
        label: 'Message de pré-commande',
        description: 'Message affiché dans le bandeau de pré-commande'
      },
      {
        key: 'preorder_shipping_date',
        value: shippingDate,
        type: 'date',
        category: 'shop',
        label: 'Date d\'expédition',
        description: 'Date prévue pour l\'expédition des pré-commandes'
      },
      {
        key: 'preorder_show_pages',
        value: JSON.stringify(showPages),
        type: 'json',
        category: 'shop',
        label: 'Pages bandeau pré-commande',
        description: 'Pages où afficher le bandeau de pré-commande'
      }
    ]

    // Utiliser une transaction pour mettre à jour toutes les configs
    await prisma.$transaction(
      updates.map(config =>
        prisma.siteConfig.upsert({
          where: { key: config.key },
          update: {
            value: config.value,
            type: config.type,
            category: config.category,
            label: config.label,
            description: config.description
          },
          create: config
        })
      )
    )

    return NextResponse.json({ success: true, message: 'Configuration mise à jour' })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la config pré-commande:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}