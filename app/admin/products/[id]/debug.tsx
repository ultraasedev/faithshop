import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DebugProductPage({ params }: Props) {
  try {
    console.log('=== DEBUG: Starting product page ===')

    const { id } = await params
    console.log('=== DEBUG: Product ID ===', id)

    console.log('=== DEBUG: About to query database ===')

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        isActive: true
      }
    })

    console.log('=== DEBUG: Product found ===', product)

    if (!product) {
      console.log('=== DEBUG: Product not found ===')
      notFound()
    }

    console.log('=== DEBUG: About to convert price ===')
    const price = product.price.toNumber()
    console.log('=== DEBUG: Price converted ===', price)

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">DEBUG Product Edit</h1>
        <div className="space-y-2">
          <p><strong>ID:</strong> {product.id}</p>
          <p><strong>Name:</strong> {product.name}</p>
          <p><strong>Price:</strong> {price}€</p>
          <p><strong>Stock:</strong> {product.stock}</p>
          <p><strong>Active:</strong> {product.isActive ? 'Yes' : 'No'}</p>
        </div>
      </div>
    )
  } catch (error) {
    console.error('=== DEBUG: Error in product page ===', error)

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">DEBUG Error</h1>
        <pre className="bg-red-100 p-4 rounded text-sm">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
        <pre className="bg-gray-100 p-4 rounded text-xs mt-4">
          {error instanceof Error ? error.stack : ''}
        </pre>
      </div>
    )
  }
}