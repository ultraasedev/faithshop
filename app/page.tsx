import { prisma } from '@/lib/prisma'
import { getSiteConfigs } from '@/app/actions/admin/settings'
import HomeClient from '@/components/home/HomeClient'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch site configuration
  const configs = await getSiteConfigs('homepage')
  const configMap = configs.reduce((acc, config) => {
    acc[config.key] = config.value
    return acc
  }, {} as Record<string, string>)

  // Fetch featured products
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true },
    take: 3,
    orderBy: { createdAt: 'desc' }
  })

  // If no featured products, fallback to recent ones
  const productsToShow = featuredProducts.length > 0 
    ? featuredProducts 
    : await prisma.product.findMany({ take: 3, orderBy: { createdAt: 'desc' } })

  return (
    <HomeClient
      heroTitle={configMap['home_hero_title']}
      heroSubtitle={configMap['home_hero_subtitle']}
      heroImage={configMap['home_hero_image']}
      heroCtaText={configMap['home_hero_cta_text']}
      heroCtaLink={configMap['home_hero_cta_link']}
      featuredProducts={productsToShow}
    />
  )
}
