import { prisma } from '@/lib/prisma'
import { ProductForm } from '../ProductForm'

async function getCollections() {
  return prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
}

export default async function NewProductPage() {
  const collections = await getCollections()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Nouveau produit
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Créez un nouveau produit pour votre boutique
        </p>
      </div>

      <ProductForm collections={collections} />
    </div>
  )
}
