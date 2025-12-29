'use client'

import { cn } from '@/lib/utils'

interface ManifestoContent {
  title?: string
  text1?: string
  text2?: string
  brandName?: string
  imageUrl?: string
  layout?: 'left' | 'right'
}

interface ManifestoBlockPreviewProps {
  content: Record<string, unknown>
  viewMode?: 'desktop' | 'tablet' | 'mobile'
}

export function ManifestoBlockPreview({ content, viewMode = 'desktop' }: ManifestoBlockPreviewProps) {
  const c = content as ManifestoContent
  const title = c.title || "Plus qu'une marque, un mouvement."
  const text1 = c.text1 || "Faith Shop est né d'une conviction simple : la mode peut être un vecteur de valeurs."
  const text2 = c.text2 || "Chaque vêtement est conçu comme une toile vierge sur laquelle s'expriment la foi, l'espoir et l'amour."
  const brandName = c.brandName || 'Faith-Shop'
  const imageUrl = c.imageUrl || ''
  const layout = c.layout || 'left'

  const isMobile = viewMode === 'mobile'
  const isTablet = viewMode === 'tablet'

  return (
    <div className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <div className={cn(
        "grid gap-16 items-center",
        isMobile ? "grid-cols-1" : "md:grid-cols-2",
        layout === 'right' && !isMobile && "direction-rtl"
      )}>
        <div className="space-y-8" style={{ direction: 'ltr' }}>
          <h2 className={cn(
            "font-serif leading-tight",
            isMobile ? "text-3xl" : isTablet ? "text-4xl" : "text-4xl md:text-5xl"
          )}>
            {title.split(',').map((part, i) => (
              <span key={i}>{part.trim()}{i === 0 && title.includes(',') ? ',' : ''}<br/></span>
            ))}
          </h2>
          <div className="w-20 h-1 bg-foreground" />
          <p className="text-lg text-muted-foreground leading-relaxed">
            {text1}
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {text2}
          </p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt={brandName} className="w-full h-full object-cover" />
          ) : (
            <span className={cn(
              "font-serif font-bold tracking-tighter text-gray-900 dark:text-gray-100",
              isMobile ? "text-4xl" : "text-5xl md:text-6xl"
            )}>
              {brandName}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
