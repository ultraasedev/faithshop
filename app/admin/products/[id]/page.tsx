import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductEditClient from './ProductEditClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  try {
    console.log('=== DEBUG: Starting EditProductPage ===')

    const { id } = await params
    console.log('=== DEBUG: Product ID ===', id)

    console.log('=== DEBUG: About to query product ===')

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: true
      }
    })

    console.log('=== DEBUG: Product query complete ===', product ? 'Found' : 'Not found')

    if (!product) {
      console.log('=== DEBUG: Product not found, calling notFound ===')
      notFound()
    }

    console.log('=== DEBUG: About to query categories ===')

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })

    console.log('=== DEBUG: Categories query complete ===', categories.length, 'categories found')

    console.log('=== DEBUG: About to render ProductEditClient ===')

    return <ProductEditClient product={product} categories={categories} />

  } catch (error) {
    console.error('=== DEBUG: Error in EditProductPage ===', error)

    // Return a debug error page instead of crashing
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Server Error in Product Edit</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error Details:</p>
          <pre className="text-sm text-red-700 mt-2 whitespace-pre-wrap">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
          {error instanceof Error && error.stack && (
            <details className="mt-4">
              <summary className="text-red-700 cursor-pointer">Stack Trace</summary>
              <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }
}