import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import { BlockRenderer } from '@/components/page-blocks/BlockRenderer'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.pageContent.findUnique({
    where: { slug: 'home' }
  })

  return {
    title: page?.metaTitle || 'Faith Shop - Vêtements de Foi',
    description: page?.metaDescription || 'Découvrez notre collection de vêtements inspirés par la foi',
  }
}

interface PageBlock {
  id: string
  type: string
  content: Record<string, unknown>
  settings?: Record<string, unknown>
}

function parsePageContent(content: string): PageBlock[] {
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) return parsed
    if (parsed?.blocks && Array.isArray(parsed.blocks)) return parsed.blocks
    return []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const page = await prisma.pageContent.findUnique({
    where: { slug: 'home' }
  })

  const blocks = page ? parsePageContent(page.content) : []

  // Fetch collections and products for block rendering
  const [collections, products] = await Promise.all([
    prisma.collection.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true }
    }),
    prisma.product.findMany({
      where: { isActive: true },
      take: 50,
      select: { id: true, name: true, slug: true, price: true, images: true }
    })
  ])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <BlockRenderer
          blocks={blocks}
          collections={collections}
          products={products.map(p => ({
            ...p,
            price: Number(p.price),
            images: p.images as string[]
          }))}
        />
      </main>
      <Footer />
    </div>
  )
}
