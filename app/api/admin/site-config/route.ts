import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer la configuration du site
    const configs = await prisma.siteConfig.findMany()

    // Organiser la config par catégories
    const siteConfig = {
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        darkMode: false
      },
      branding: {
        siteName: 'Faith Shop',
        logo: '',
        favicon: '',
        tagline: 'Vêtements de qualité supérieure'
      },
      homepage: {
        heroTitle: 'Faith Shop - Style & Qualité',
        heroSubtitle: 'Découvrez notre collection exclusive de vêtements',
        heroImage: '',
        showFeaturedProducts: true,
        featuredSection: 'Nouveautés'
      },
      preorder: {
        enabled: true,
        message: 'Expédition le 16 janvier 2025',
        showPages: ['product', 'checkout'],
        backgroundColor: '#dbeafe',
        textColor: '#1e40af'
      },
      footer: {
        aboutText: 'Faith Shop propose des vêtements de qualité fabriqués avec passion.',
        contactEmail: 'contact@faith-shop.fr',
        socialLinks: {}
      },
      seo: {
        metaTitle: 'Faith Shop - Vêtements de Qualité',
        metaDescription: 'Découvrez notre collection de vêtements uniques et de qualité supérieure.',
        keywords: 'vêtements, mode, qualité, faith shop'
      }
    }

    // Appliquer les configs de la base de données si elles existent
    configs.forEach(config => {
      const keys = config.key.split('.')
      let current = siteConfig as any

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }

      const lastKey = keys[keys.length - 1]
      try {
        current[lastKey] = config.type === 'JSON' ? JSON.parse(config.value) : config.value
      } catch (e) {
        current[lastKey] = config.value
      }
    })

    return NextResponse.json(siteConfig)

  } catch (error) {
    console.error('Erreur lors de la récupération de la config:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const config = await request.json()

    // Sauvegarder la configuration dans la base de données
    const saveConfig = async (obj: any, prefix: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const configKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          await saveConfig(value, configKey)
        } else {
          await prisma.siteConfig.upsert({
            where: { key: configKey },
            update: {
              value: typeof value === 'object' ? JSON.stringify(value) : String(value),
              type: typeof value === 'object' ? 'JSON' : 'STRING',
              updatedAt: new Date()
            },
            create: {
              key: configKey,
              value: typeof value === 'object' ? JSON.stringify(value) : String(value),
              type: typeof value === 'object' ? 'JSON' : 'STRING',
              category: prefix.split('.')[0] || 'general',
              label: key,
              description: `Configuration pour ${key}`
            }
          })
        }
      }
    }

    await saveConfig(config)

    return NextResponse.json({ success: true, message: 'Configuration sauvegardée' })

  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la config:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}