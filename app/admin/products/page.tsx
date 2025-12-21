import { prisma } from '@/lib/prisma'
import { ProductsManagement } from '@/components/admin/ProductsManagement'

async function getProductsData() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        stock: true,
        isActive: true,
        isFeatured: true,
        category: true,
        brand: true,
        sku: true,
        tags: true,
        colors: true,
        sizes: true,
        weight: true,
        dimensions: true,
        lowStockThreshold: true,
        trackQuantity: true,
        hasVariants: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return products.map(product => ({
      ...product,
      price: Number(product.price)
    }))
  } catch (error) {
    console.error('Erreur chargement produits:', error)
    return []
  }
}

export default async function ProductsPage() {
  const products = await getProductsData()

  return <ProductsManagement products={products} />
}