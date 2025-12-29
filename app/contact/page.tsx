import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import { BlockRenderer } from '@/components/page-blocks/BlockRenderer'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const dynamic = 'force-dynamic'

const PAGE_SLUG = 'contact'

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.pageContent.findUnique({
    where: { slug: PAGE_SLUG }
  })

  return {
    title: page?.metaTitle || page?.title || 'Contact - Faith Shop',
    description: page?.metaDescription || 'Contactez l\'équipe Faith Shop',
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

export default async function ContactPage() {
  const page = await prisma.pageContent.findUnique({
    where: { slug: PAGE_SLUG }
  })

  const blocks = page ? parsePageContent(page.content) : []

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
