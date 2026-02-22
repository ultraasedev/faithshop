import { describe, it, expect, vi } from 'vitest'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn().mockResolvedValue([
        { id: 'p1', slug: 'tshirt-faith', updatedAt: new Date('2025-01-01') },
        { id: 'p2', slug: null, updatedAt: new Date('2025-02-01') },
      ]),
    },
    collection: {
      findMany: vi.fn().mockResolvedValue([
        { slug: 'streetwear', updatedAt: new Date('2025-01-15') },
      ]),
    },
  },
}))

describe('sitemap.ts', () => {
  it('should return static pages, products, and collections', async () => {
    const { default: sitemap } = await import('@/app/sitemap')
    const result = await sitemap()

    // Static pages
    const urls = result.map(entry => entry.url)
    expect(urls).toContain('https://faith-shop.fr')
    expect(urls).toContain('https://faith-shop.fr/shop')
    expect(urls).toContain('https://faith-shop.fr/about')
    expect(urls).toContain('https://faith-shop.fr/contact')
    expect(urls).toContain('https://faith-shop.fr/legal')
    expect(urls).toContain('https://faith-shop.fr/privacy')
    expect(urls).toContain('https://faith-shop.fr/cgv')
    expect(urls).toContain('https://faith-shop.fr/livraison')
    expect(urls).toContain('https://faith-shop.fr/new')

    // Products (slug-based and id-based fallback)
    expect(urls).toContain('https://faith-shop.fr/products/tshirt-faith')
    expect(urls).toContain('https://faith-shop.fr/products/p2')

    // Collections
    expect(urls).toContain('https://faith-shop.fr/streetwear')
  })

  it('should set correct priorities', async () => {
    const { default: sitemap } = await import('@/app/sitemap')
    const result = await sitemap()

    const homeEntry = result.find(e => e.url === 'https://faith-shop.fr')
    expect(homeEntry?.priority).toBe(1)

    const shopEntry = result.find(e => e.url === 'https://faith-shop.fr/shop')
    expect(shopEntry?.priority).toBe(0.9)

    const productEntry = result.find(e => e.url.includes('/products/'))
    expect(productEntry?.priority).toBe(0.8)

    const collectionEntry = result.find(e => e.url === 'https://faith-shop.fr/streetwear')
    expect(collectionEntry?.priority).toBe(0.7)
  })
})

describe('robots.ts', () => {
  it('should return correct robots configuration', async () => {
    const { default: robots } = await import('@/app/robots')
    const result = robots()

    expect(result.rules).toBeDefined()
    expect(Array.isArray(result.rules)).toBe(true)

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
    const mainRule = rules[0]

    expect(mainRule.userAgent).toBe('*')
    expect(mainRule.allow).toBe('/')
    expect(mainRule.disallow).toContain('/admin/')
    expect(mainRule.disallow).toContain('/api/')
    expect(mainRule.disallow).toContain('/checkout/')
    expect(mainRule.disallow).toContain('/account/')

    expect(result.sitemap).toBe('https://faith-shop.fr/sitemap.xml')
  })
})
