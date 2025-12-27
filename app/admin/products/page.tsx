import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { ProductsClient } from './ProductsClient'
import { Skeleton } from '@/components/ui/skeleton'

async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      variants: true,
      collections: {
        include: {
          collection: {
            select: { name: true }
          }
        }
      },
      _count: {
        select: { orderItems: true }
      }
    }
  })

  return products.map(product => ({
    ...product,
    price: Number(product.price),
    totalStock: product.hasVariants
      ? product.variants.reduce((sum, v) => sum + v.stock, 0)
      : product.stock,
    variantCount: product.variants.length,
    collections: product.collections.map(pc => pc.collection.name),
    orderCount: product._count.orderItems
  }))
}

async function getStats() {
  const [total, active, outOfStock, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({
      where: {
        OR: [
          { hasVariants: false, stock: 0 },
          {
            hasVariants: true,
            variants: { every: { stock: 0 } }
          }
        ]
      }
    }),
    prisma.product.count({
      where: {
        trackQuantity: true,
        OR: [
          { hasVariants: false, stock: { lte: 5, gt: 0 } },
          {
            hasVariants: true,
            variants: { some: { stock: { lte: 5, gt: 0 } } }
          }
        ]
      }
    })
  ])

  return { total, active, outOfStock, lowStock }
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}

async function ProductsContent() {
  const [products, stats] = await Promise.all([
    getProducts(),
    getStats()
  ])

  return <ProductsClient products={products} stats={stats} />
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProductsContent />
    </Suspense>
  )
}
