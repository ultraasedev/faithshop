import { prisma } from '@/lib/prisma'
import ProductCreateClient from './ProductCreateClient'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return <ProductCreateClient categories={categories} />
}
