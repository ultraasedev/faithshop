'use client'

import { cn } from '@/lib/utils'

interface QuoteContent {
  text?: string
  author?: string
  backgroundColor?: string
}

interface QuoteBlockPreviewProps {
  content: Record<string, unknown>
  viewMode?: 'desktop' | 'tablet' | 'mobile'
}

export function QuoteBlockPreview({ content, viewMode = 'desktop' }: QuoteBlockPreviewProps) {
  const c = content as QuoteContent
  const text = c.text || "La mode passe, le style reste. La foi est éternelle."
  const author = c.author || '— Le Fondateur'
  const backgroundColor = c.backgroundColor || 'hsl(var(--secondary) / 0.1)'

  const isMobile = viewMode === 'mobile'
  const isTablet = viewMode === 'tablet'

  return (
    <div
      className="py-32 px-4 text-center"
      style={{ backgroundColor }}
    >
      <blockquote className="max-w-4xl mx-auto">
        <p className={cn(
          "font-serif italic leading-tight mb-8",
          isMobile ? "text-2xl" : isTablet ? "text-3xl" : "text-3xl md:text-5xl"
        )}>
          &quot;{text}&quot;
        </p>
        <footer className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          {author}
        </footer>
      </blockquote>
    </div>
  )
}
