import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductEditClient from './ProductEditClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      categories: true
    }
  })

  if (!product) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return <ProductEditClient product={product} categories={categories} />
}