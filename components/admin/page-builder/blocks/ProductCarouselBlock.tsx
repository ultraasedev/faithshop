'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'

interface ProductCarouselContent {
  title?: string
  source?: 'manual' | 'collection' | 'featured' | 'new'
  productIds?: string[]
  collectionId?: string
  autoplay?: boolean
  showDots?: boolean
  showArrows?: boolean
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
}

interface ProductCarouselPreviewProps {
  content: Record<string, unknown>
  products: Product[]
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function ProductCarouselPreview({ content, products, viewMode }: ProductCarouselPreviewProps) {
  const {
    title = 'À découvrir',
    source = 'featured',
    productIds = [],
    showDots = true,
    showArrows = true
  } = content as ProductCarouselContent

  let displayProducts = products
  if (source === 'manual' && productIds.length > 0) {
    displayProducts = products.filter(p => productIds.includes(p.id))
  }
  displayProducts = displayProducts.slice(0, 10)

  const itemsPerView = viewMode === 'mobile' ? 2 : viewMode === 'tablet' ? 3 : 4

  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Aucun produit à afficher</p>
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

      <div className="relative">
        {/* Arrows */}
        {showArrows && (
          <>
            <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Products */}
        <div className="flex gap-4 overflow-hidden">
          {displayProducts.slice(0, itemsPerView).map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 group"
              style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)` }}
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
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
              <h3 className="font-medium text-sm truncate">{product.name}</h3>
              <p className="text-sm font-semibold">{product.price.toFixed(2)} €</p>
            </div>
          ))}
        </div>

        {/* Dots */}
        {showDots && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.ceil(displayProducts.length / itemsPerView) }).map((_, i) => (
              <button
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === 0 ? "bg-gray-900 dark:bg-white" : "bg-gray-300 dark:bg-gray-600"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
