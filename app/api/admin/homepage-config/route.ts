import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const HOMEPAGE_KEYS = [
  'home_hero_title',
  'home_hero_subtitle',
  'home_hero_image',
  'home_hero_cta_text',
  'home_hero_cta_link'
]

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const configs = await prisma.siteConfig.findMany({
      where: {
        key: { in: HOMEPAGE_KEYS }
      }
    })

    const result: Record<string, string> = {}
    HOMEPAGE_KEYS.forEach(key => {
      const config = configs.find(c => c.key === key)
      result[key] = config?.value || ''
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching homepage config:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()

    // Update each config
    for (const key of HOMEPAGE_KEYS) {
      if (body[key] !== undefined) {
        await prisma.siteConfig.upsert({
          where: { key },
          create: {
            key,
            value: body[key],
            type: 'STRING',
            category: 'homepage',
            label: getLabel(key)
          },
          update: {
            value: body[key]
          }
        })
      }
    }

    revalidatePath('/')
    revalidatePath('/admin/pages/home')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving homepage config:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function getLabel(key: string): string {
  const labels: Record<string, string> = {
    home_hero_title: 'Titre Hero',
    home_hero_subtitle: 'Sous-titre Hero',
    home_hero_image: 'Image Hero',
    home_hero_cta_text: 'Texte bouton Hero',
    home_hero_cta_link: 'Lien bouton Hero'
  }
  return labels[key] || key
}
