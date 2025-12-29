import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_SOCIAL_LINKS = [
  { platform: 'instagram', url: 'https://instagram.com/faithshop' },
  { platform: 'facebook', url: 'https://facebook.com/faithshop' },
  { platform: 'twitter', url: 'https://x.com/faithshop' },
  { platform: 'tiktok', url: 'https://tiktok.com/@faithshop' },
]

async function main() {
  console.log('Initializing footer social links...')

  // Check if social links already exist
  const existing = await prisma.siteConfig.findFirst({
    where: { key: 'footer_social_links' }
  })

  if (existing) {
    console.log('Social links already exist in database:')
    console.log(existing.value)
    return
  }

  // Create the social links
  await prisma.siteConfig.create({
    data: {
      key: 'footer_social_links',
      value: JSON.stringify(DEFAULT_SOCIAL_LINKS),
      category: 'footer',
      type: 'json'
    }
  })

  console.log('Default social links created:')
  console.log(JSON.stringify(DEFAULT_SOCIAL_LINKS, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
