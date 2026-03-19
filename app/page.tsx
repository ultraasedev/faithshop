import { prisma } from '@/lib/prisma'
import { getSiteConfigs } from '@/app/actions/admin/settings'
import HomeClient from '@/components/home/HomeClient'
import HeroSlider from '@/components/home/HeroSlider'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

interface Slide {
  id: string
  image: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
}

function parseSlides(configMap: Record<string, string>) {
  let parsedSlides: Slide[] = []

  if (configMap['home_hero_slides']) {
    try {
      const parsed = JSON.parse(configMap['home_hero_slides'])
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsedSlides = parsed
      }
    } catch {}
  }

  if (parsedSlides.length === 0) {
    parsedSlides = [{
      id: '1',
      image: configMap['home_hero_image'] || '/hero-bg.png',
      title: configMap['home_hero_title'] || "L'Élégance de la Foi",
      subtitle: configMap['home_hero_subtitle'] || 'Collection Hiver 2025',
      ctaText: configMap['home_hero_cta_text'] || 'Découvrir',
      ctaLink: configMap['home_hero_cta_link'] || '/shop'
    }]
  }

  return parsedSlides.map(slide => ({
    id: slide.id,
    image: slide.image || '/hero-bg.png',
    subtitle: slide.subtitle || 'Collection Hiver 2025',
    title: slide.title || "L'Élégance de la Foi",
    description: "Une expression intemporelle de spiritualité à travers des pièces d'exception.",
    cta: slide.ctaText || 'Découvrir',
    link: slide.ctaLink || '/shop',
    isVideo: slide.image?.endsWith('.mp4') || slide.image?.endsWith('.webm') || false
  }))
}

export default async function Home() {
  noStore()
  let configMap: Record<string, string> = {}
  let productsToShow: any[] = []
  let instagramUrl: string | undefined
  let instagramPosts: Array<{ id: string; image: string; url: string }> = []

  try {
    // Fetch site configuration
    const configs = await getSiteConfigs('homepage')
    configMap = configs.reduce((acc, config) => {
      acc[config.key] = config.value
      return acc
    }, {} as Record<string, string>)

    // Fetch footer social links to find Instagram
    const socialConfig = await prisma.siteConfig.findUnique({
      where: { key: 'footer_social_links' }
    })
    if (socialConfig) {
      try {
        const socialLinks: Array<{ platform: string; url: string }> = JSON.parse(socialConfig.value)
        const instaLink = socialLinks.find(l => l.platform === 'instagram')
        if (instaLink?.url) {
          instagramUrl = instaLink.url
        }
      } catch {}
    }

    // Parse Instagram posts from homepage config
    if (configMap['home_instagram_posts']) {
      try {
        const parsed = JSON.parse(configMap['home_instagram_posts'])
        if (Array.isArray(parsed)) {
          instagramPosts = parsed.filter((p: any) => p.image)
        }
      } catch {}
    }

    // Fetch featured products
    const featuredProducts = await prisma.product.findMany({
      where: { isFeatured: true },
      take: 3,
      orderBy: { createdAt: 'desc' }
    })

    // If no featured products, fallback to recent ones
    const rawProducts = featuredProducts.length > 0
      ? featuredProducts
      : await prisma.product.findMany({ take: 3, orderBy: { createdAt: 'desc' } })

    // Properly serialize products (avoid Decimal, Date serialization issues)
    productsToShow = rawProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price.toNumber(),
      images: p.images || [],
      badge: p.badge || null
    }))
  } catch (error) {
    console.error('Failed to fetch homepage data:', error)
  }

  // Parse slides server-side (no client JS needed)
  const slides = parseSlides(configMap)

  return (
    <>
      {/* HeroSlider rendered from server component with inline script — no React hydration needed */}
      <HeroSlider slides={slides} />
      <HomeClient
        featuredProducts={productsToShow}
        instagramUrl={instagramUrl}
        instagramPosts={instagramPosts}
      />
    </>
  )
}
