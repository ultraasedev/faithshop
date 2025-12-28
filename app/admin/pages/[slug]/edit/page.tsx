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

  // Parse content from page
  const content = page.content
    ? (typeof page.content === 'string'
        ? JSON.parse(page.content)
        : page.content)
    : { blocks: [] }

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
