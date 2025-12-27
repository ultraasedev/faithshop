import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CollectionsClient } from './CollectionsClient'

export const dynamic = 'force-dynamic'

export default async function CollectionsPage() {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  // Get collections with product count
  const collections = await prisma.collection.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      products: {
        select: { id: true }
      }
    }
  })

  // Get some products for selection
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      price: true
    },
    orderBy: { name: 'asc' }
  })

  const formattedCollections = collections.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description,
    slug: c.slug,
    image: c.image,
    isActive: c.isActive,
    isFeatured: c.isFeatured,
    sortOrder: c.sortOrder,
    productCount: c.products.length,
    metaTitle: c.metaTitle,
    metaDescription: c.metaDescription,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt
  }))

  return (
    <CollectionsClient
      collections={formattedCollections}
      products={products}
    />
  )
}
