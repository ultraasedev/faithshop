import { prisma } from '@/lib/prisma'
import ProductsPageClient from './ProductsPageClient'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      price: true,
      images: true,
      stock: true,
      isActive: true,
      description: true,
      category: true
    }
  })

  // Transformer les données pour le client
  const transformedProducts = products.map(product => ({
    ...product,
    price: Number(product.price)
  }))

  return <ProductsPageClient products={transformedProducts} />
}