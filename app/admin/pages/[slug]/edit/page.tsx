import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageBuilder } from '@/components/admin/page-builder/PageBuilder'

async function getPage(slug: string) {
  return prisma.pageContent.findFirst({
    where: { slug }
  })
}

async function getCollections() {
  return prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
}

async function getProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    take: 50,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true
    }
  })
}

export default async function PageEditorPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [page, collections, products] = await Promise.all([
    getPage(slug),
    getCollections(),
    getProducts()
  ])

  if (!page) {
    notFound()
  }

  // Parse content from page safely
  // Content can be either:
  // - Array format: [{...}, {...}]
  // - Object format: { blocks: [{...}, {...}] }
  let content: { blocks: unknown[] } = { blocks: [] }
  try {
    if (page.content && typeof page.content === 'string' && page.content.trim()) {
      const parsed = JSON.parse(page.content)
      // Handle both array and object formats
      if (Array.isArray(parsed)) {
        content = { blocks: parsed }
      } else if (Array.isArray(parsed?.blocks)) {
        content = { blocks: parsed.blocks }
      }
    } else if (page.content && typeof page.content === 'object') {
      const obj = page.content as { blocks?: unknown[] } | unknown[]
      if (Array.isArray(obj)) {
        content = { blocks: obj }
      } else if (Array.isArray((obj as { blocks?: unknown[] })?.blocks)) {
        content = { blocks: (obj as { blocks: unknown[] }).blocks }
      }
    }
  } catch (e) {
    console.error('Failed to parse page content:', e)
    content = { blocks: [] }
  }

  return (
    <PageBuilder
      page={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        status: page.isPublished ? 'PUBLISHED' : 'DRAFT',
        content,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription
      }}
      collections={collections}
      products={products.map(p => ({
        ...p,
        price: Number(p.price)
      }))}
    />
  )
}
