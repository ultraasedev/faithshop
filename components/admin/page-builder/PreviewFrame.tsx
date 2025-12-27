'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PageBlock } from './PageBuilder'

// Import block previews
import { HeroBlockPreview } from './blocks/HeroBlock'
import { TextBlockPreview } from './blocks/TextBlock'
import { ImageBlockPreview } from './blocks/ImageBlock'
import { VideoBlockPreview } from './blocks/VideoBlock'
import { GalleryBlockPreview } from './blocks/GalleryBlock'
import { ProductGridPreview } from './blocks/ProductGridBlock'
import { ProductCarouselPreview } from './blocks/ProductCarouselBlock'
import { TestimonialsPreview } from './blocks/TestimonialsBlock'
import { FAQPreview } from './blocks/FAQBlock'
import { NewsletterPreview } from './blocks/NewsletterBlock'
import { ContactFormPreview } from './blocks/ContactFormBlock'
import { ColumnsPreview } from './blocks/ColumnsBlock'
import { SpacerPreview } from './blocks/SpacerBlock'
import { DividerPreview } from './blocks/DividerBlock'

interface PreviewFrameProps {
  blocks: PageBlock[]
  viewMode: 'desktop' | 'tablet' | 'mobile'
  onClose: () => void
  collections: Array<{ id: string; name: string; slug: string }>
  products: Array<{ id: string; name: string; slug: string; price: number; images: string[] }>
}

export function PreviewFrame({
  blocks,
  viewMode: initialViewMode,
  onClose,
  collections,
  products
}: PreviewFrameProps) {
  const [viewMode, setViewMode] = useState(initialViewMode)

  const getBlockPreview = (type: string) => {
    const previews: Record<string, React.FC<{
      content: Record<string, unknown>
      collections: typeof collections
      products: typeof products
      viewMode: 'desktop' | 'tablet' | 'mobile'
    }>> = {
      hero: HeroBlockPreview,
      text: TextBlockPreview,
      image: ImageBlockPreview,
      video: VideoBlockPreview,
      gallery: GalleryBlockPreview,
      'product-grid': ProductGridPreview,
      'product-carousel': ProductCarouselPreview,
      testimonials: TestimonialsPreview,
      faq: FAQPreview,
      newsletter: NewsletterPreview,
      'contact-form': ContactFormPreview,
      columns: ColumnsPreview,
      spacer: SpacerPreview,
      divider: DividerPreview,
    }
    return previews[type]
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      {/* Header */}
      <div className="h-14 bg-white dark:bg-gray-900 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className="font-medium">Prévisualisation</span>

          {/* View Mode Switcher */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            {[
              { mode: 'desktop' as const, icon: Monitor, label: 'Ordinateur' },
              { mode: 'tablet' as const, icon: Tablet, label: 'Tablette' },
              { mode: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
            ].map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(mode)}
                className={cn(
                  "rounded-none",
                  viewMode === mode && "bg-gray-100 dark:bg-gray-800"
                )}
                title={label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-8 flex justify-center">
        <div
          className={cn(
            "bg-white dark:bg-gray-950 shadow-2xl transition-all overflow-auto",
            viewMode === 'desktop' && "w-full max-w-6xl",
            viewMode === 'tablet' && "w-[768px]",
            viewMode === 'mobile' && "w-[375px]"
          )}
          style={{
            minHeight: 'calc(100vh - 150px)',
            borderRadius: viewMode !== 'desktop' ? '20px' : '0'
          }}
        >
          {/* Device Frame for Mobile/Tablet */}
          {viewMode !== 'desktop' && (
            <div className="h-6 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="w-20 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
          )}

          {/* Page Content */}
          <div className="min-h-full">
            {blocks.map((block) => {
              // Check visibility
              const isVisible = block.settings.visibility?.[viewMode] ?? true
              if (!isVisible) return null

              const BlockPreview = getBlockPreview(block.type)
              if (!BlockPreview) return null

              return (
                <div
                  key={block.id}
                  style={{
                    paddingTop: block.settings.padding?.top || 0,
                    paddingBottom: block.settings.padding?.bottom || 0,
                    paddingLeft: block.settings.padding?.left || 0,
                    paddingRight: block.settings.padding?.right || 0,
                    marginTop: block.settings.margin?.top || 0,
                    marginBottom: block.settings.margin?.bottom || 0,
                    backgroundColor: block.settings.backgroundColor || undefined,
                    color: block.settings.textColor || undefined,
                  }}
                >
                  <BlockPreview
                    content={block.content}
                    collections={collections}
                    products={products}
                    viewMode={viewMode}
                  />
                </div>
              )
            })}

            {blocks.length === 0 && (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <p>Aucun contenu à afficher</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
