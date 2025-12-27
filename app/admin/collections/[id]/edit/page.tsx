import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CollectionEditClient } from './CollectionEditClient'

export const dynamic = 'force-dynamic'

interface EditCollectionPageProps {
  params: Promise<{ id: string }>
}

async function getCollection(id: string) {
  return prisma.collection.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
              price: true,
              isActive: true,
              stock: true
            }
          }
        },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })
}

async function getAllProducts() {
  return prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      price: true,
      isActive: true,
      stock: true
    },
    orderBy: { name: 'asc' }
  })
}

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const { id } = await params
  const [collection, allProducts] = await Promise.all([
    getCollection(id),
    getAllProducts()
  ])

  if (!collection) {
    notFound()
  }

  // Format data for client
  const collectionData = {
    ...collection,
    products: collection.products.map(pc => ({
      ...pc.product,
      price: Number(pc.product.price),
      sortOrder: pc.sortOrder
    }))
  }

  const productsData = allProducts.map(p => ({
    ...p,
    price: Number(p.price)
  }))

  return (
    <div className="max-w-6xl mx-auto">
      <CollectionEditClient
        collection={collectionData}
        allProducts={productsData}
      />
    </div>
  )
}
