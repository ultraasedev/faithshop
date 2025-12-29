import { prisma } from '@/lib/prisma'
import { FooterClient } from './FooterClient'

async function getFooterSettings() {
  const settings = await prisma.siteConfig.findMany({
    where: { category: 'footer' }
  })

  // Convert to a map for easier access
  const settingsMap: Record<string, string> = {}
  settings.forEach(s => {
    settingsMap[s.key] = s.value
  })

  // Parse social links from JSON
  let socialLinks: Array<{ platform: string; url: string }> = []
  try {
    if (settingsMap['footer_social_links']) {
      socialLinks = JSON.parse(settingsMap['footer_social_links'])
    }
  } catch {
    socialLinks = []
  }

  return {
    copyright: settingsMap['footer_copyright'] || '© {year} Faith Shop. Tous droits réservés.',
    socialLinks
  }
}

export default async function FooterPage() {
  const settings = await getFooterSettings()

  return <FooterClient initialSettings={settings} />
}
