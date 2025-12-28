import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '../../ProductForm'

export const dynamic = 'force-dynamic'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      collections: {
        include: {
          collection: true
        }
      },
      videos: true,
      variants: true,
      variantAttributes: true
    }
  })
}

async function getCollections() {
  return prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const { id } = await params
  const [product, collections] = await Promise.all([
    getProduct(id),
    getCollections()
  ])

  if (!product) {
    notFound()
  }

  // Convert Decimal to number for client component
  const productData = {
    ...product,
    price: product.price.toNumber(),
    collections: product.collections.map(c => ({
      collectionId: c.collectionId
    })),
    videos: product.videos.map(v => ({
      id: v.id,
      type: v.type as 'upload' | 'youtube' | 'vimeo',
      url: v.url,
      thumbnail: v.thumbnail,
      title: v.title
    })),
    variants: product.variants.map(v => ({
      id: v.id,
      sku: v.sku,
      title: v.title,
      attributes: v.customAttributes ? JSON.parse(v.customAttributes) : {},
      price: v.price.toNumber(),
      comparePrice: v.comparePrice?.toNumber(),
      stock: v.stock,
      images: v.images
    })),
    variantAttributes: product.variantAttributes.map(a => ({
      id: a.id,
      name: a.name,
      values: a.values
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Modifier le produit
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          {product.name}
        </p>
      </div>

      <ProductForm product={productData} collections={collections} />
    </div>
  )
}
