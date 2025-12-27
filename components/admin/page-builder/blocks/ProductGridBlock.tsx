'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ShoppingBag } from 'lucide-react'

interface ProductGridContent {
  title?: string
  source?: 'manual' | 'collection' | 'featured' | 'new'
  productIds?: string[]
  collectionId?: string
  columns?: number
  limit?: number
  showPrice?: boolean
  showAddToCart?: boolean
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
}

interface ProductGridPreviewProps {
  content: Record<string, unknown>
  products: Product[]
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function ProductGridPreview({ content, products, viewMode }: ProductGridPreviewProps) {
  const {
    title = 'Nos produits',
    source = 'manual',
    productIds = [],
    columns = 4,
    limit = 8,
    showPrice = true,
    showAddToCart = true
  } = content as ProductGridContent

  // Filter products based on source
  let displayProducts = products
  if (source === 'manual' && productIds.length > 0) {
    displayProducts = products.filter(p => productIds.includes(p.id))
  }
  displayProducts = displayProducts.slice(0, limit)

  const gridColumns = viewMode === 'mobile' ? 2 : viewMode === 'tablet' ? 3 : columns

  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Aucun produit à afficher</p>
        <p className="text-sm text-gray-400">Configurez les produits dans les paramètres du bloc</p>
      </div>
    )
  }

  return (
    <div>
      {title && (
        <h2 className={cn(
          "font-bold mb-8 text-center",
          viewMode === 'desktop' && "text-3xl",
          viewMode === 'tablet' && "text-2xl",
          viewMode === 'mobile' && "text-xl"
        )}>
          {title}
        </h2>
      )}

      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}
      >
        {displayProducts.map((product) => (
          <div key={product.id} className="group">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ShoppingBag className="h-8 w-8 text-gray-300" />
                </div>
              )}
            </div>

            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-gray-600 transition-colors">
              {product.name}
            </h3>

            {showPrice && (
              <p className="mt-1 font-semibold">
                {product.price.toFixed(2)} €
              </p>
            )}

            {showAddToCart && (
              <button className="mt-3 w-full py-2 px-4 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors">
                Ajouter au panier
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
