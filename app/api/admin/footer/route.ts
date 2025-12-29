import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { copyright, socialLinks } = await req.json()

    // Upsert copyright setting
    await prisma.siteConfig.upsert({
      where: { key: 'footer_copyright' },
      update: { value: copyright },
      create: {
        key: 'footer_copyright',
        value: copyright,
        type: 'text',
        category: 'footer',
        label: 'Copyright'
      }
    })

    // Upsert social links setting
    await prisma.siteConfig.upsert({
      where: { key: 'footer_social_links' },
      update: { value: JSON.stringify(socialLinks) },
      create: {
        key: 'footer_social_links',
        value: JSON.stringify(socialLinks),
        type: 'json',
        category: 'footer',
        label: 'Réseaux sociaux'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving footer settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const settings = await prisma.siteConfig.findMany({
      where: { category: 'footer' }
    })

    const settingsMap: Record<string, string> = {}
    settings.forEach(s => {
      settingsMap[s.key] = s.value
    })

    let socialLinks: Array<{ platform: string; url: string }> = []
    try {
      if (settingsMap['footer_social_links']) {
        socialLinks = JSON.parse(settingsMap['footer_social_links'])
      }
    } catch {
      socialLinks = []
    }

    return NextResponse.json({
      copyright: settingsMap['footer_copyright'] || '© {year} Faith Shop. Tous droits réservés.',
      socialLinks
    })
  } catch (error) {
    console.error('Error fetching footer settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
