'use client'

import { cn } from '@/lib/utils'
import { Star, Quote } from 'lucide-react'

interface Testimonial {
  name: string
  text: string
  rating: number
  image?: string
  role?: string
}

interface TestimonialsContent {
  title?: string
  items?: Testimonial[]
  layout?: 'grid' | 'carousel' | 'stack'
}

interface TestimonialsPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function TestimonialsPreview({ content, viewMode }: TestimonialsPreviewProps) {
  const {
    title = 'Ce que disent nos clients',
    items = [
      { name: 'Client 1', text: 'Super produit !', rating: 5 },
      { name: 'Client 2', text: 'Très satisfait de ma commande', rating: 5 },
      { name: 'Client 3', text: 'Je recommande vivement', rating: 4 }
    ],
    layout = 'grid'
  } = content as TestimonialsContent

  const columns = viewMode === 'mobile' ? 1 : viewMode === 'tablet' ? 2 : 3

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
        className={cn(
          "gap-6",
          layout === 'grid' && "grid",
          layout === 'stack' && "space-y-6",
          layout === 'carousel' && "flex overflow-x-auto gap-6 pb-4"
        )}
        style={layout === 'grid' ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6",
              layout === 'carousel' && "flex-shrink-0 w-80"
            )}
          >
            <Quote className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
              "{item.text}"
            </p>

            {/* Rating */}
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < item.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>

            {/* Author */}
            <div className="flex items-center gap-3">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {item.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {item.name}
                </p>
                {item.role && (
                  <p className="text-sm text-gray-500">{item.role}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
