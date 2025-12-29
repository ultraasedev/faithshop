import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { BlockRenderer } from '@/components/page-blocks/BlockRenderer'

// Generate Metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = await prisma.pageContent.findUnique({
    where: { slug }
  })

  if (!page) return {}

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
  }
}

interface PageBlock {
  id: string
  type: string
  content: Record<string, unknown>
  settings?: Record<string, unknown>
}

interface PageContent {
  blocks?: PageBlock[]
}

function parsePageContent(content: string): PageBlock[] {
  try {
    const parsed = JSON.parse(content)

    // If it's an array, it's directly the blocks
    if (Array.isArray(parsed)) {
      return parsed
    }

    // If it's an object with blocks property
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed.blocks
    }

    // Otherwise, it's legacy HTML content - return empty
    return []
  } catch {
    // If parsing fails, it's HTML content
    return []
  }
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Fetch page with related data for product blocks
  const page = await prisma.pageContent.findUnique({
    where: { slug }
  })

  if (!page || !page.isPublished) {
    notFound()
  }

  // Parse the content to get blocks
  const blocks = parsePageContent(page.content)

  // Fetch collections and products for block rendering
  const [collections, products] = await Promise.all([
    prisma.collection.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true }
    }),
    prisma.product.findMany({
      where: { isActive: true },
      take: 50,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true
      }
    })
  ])

  // If we have blocks, render them with BlockRenderer
  if (blocks.length > 0) {
    return (
      <div className="min-h-screen bg-background">
        <BlockRenderer
          blocks={blocks}
          collections={collections}
          products={products.map(p => ({
            ...p,
            price: Number(p.price),
            images: p.images as string[]
          }))}
        />
      </div>
    )
  }

  // Fallback: render legacy HTML content
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">{page.title}</h1>

        {/* Render HTML Content safely */}
        <div
          className="prose prose-lg dark:prose-invert mx-auto"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  )
}
