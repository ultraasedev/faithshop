import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductDetailClient from '@/components/product/ProductDetailClient'

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: true
    }
  })

  if (!product) {
    notFound()
  }

  // Convert Decimal to number for Client Component
  const productJson = {
    ...product,
    price: product.price.toNumber()
  }

  return <ProductDetailClient product={productJson} />
}

