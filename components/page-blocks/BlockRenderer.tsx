'use client'

import { HeroBlockPreview } from '@/components/admin/page-builder/blocks/HeroBlock'
import { TextBlockPreview } from '@/components/admin/page-builder/blocks/TextBlock'
import { ImageBlockPreview } from '@/components/admin/page-builder/blocks/ImageBlock'
import { VideoBlockPreview } from '@/components/admin/page-builder/blocks/VideoBlock'
import { GalleryBlockPreview } from '@/components/admin/page-builder/blocks/GalleryBlock'
import { ProductGridPreview } from '@/components/admin/page-builder/blocks/ProductGridBlock'
import { ProductCarouselPreview } from '@/components/admin/page-builder/blocks/ProductCarouselBlock'
import { TestimonialsPreview } from '@/components/admin/page-builder/blocks/TestimonialsBlock'
import { FAQPreview } from '@/components/admin/page-builder/blocks/FAQBlock'
import { NewsletterPreview } from '@/components/admin/page-builder/blocks/NewsletterBlock'
import { ContactFormPreview } from '@/components/admin/page-builder/blocks/ContactFormBlock'
import { ColumnsPreview } from '@/components/admin/page-builder/blocks/ColumnsBlock'
import { SpacerPreview } from '@/components/admin/page-builder/blocks/SpacerBlock'
import { DividerPreview } from '@/components/admin/page-builder/blocks/DividerBlock'
import { CustomFormPreview } from '@/components/admin/page-builder/blocks/CustomFormBlock'
import { ButtonPreview } from '@/components/admin/page-builder/blocks/ButtonBlock'
import { AccordionTabsPreview } from '@/components/admin/page-builder/blocks/AccordionTabsBlock'
import { FeaturesPreview } from '@/components/admin/page-builder/blocks/FeaturesBlock'
import { SocialLinksPreview } from '@/components/admin/page-builder/blocks/SocialLinksBlock'
import { MapPreview } from '@/components/admin/page-builder/blocks/MapBlock'
import { CounterPreview } from '@/components/admin/page-builder/blocks/CounterBlock'
import { PricingPreview } from '@/components/admin/page-builder/blocks/PricingBlock'
import { ManifestoBlockPreview } from '@/components/admin/page-builder/blocks/ManifestoBlock'
import { ValuesBlockPreview } from '@/components/admin/page-builder/blocks/ValuesBlock'
import { QuoteBlockPreview } from '@/components/admin/page-builder/blocks/QuoteBlock'

interface PageBlock {
  id: string
  type: string
  content: Record<string, unknown>
  settings?: {
    padding?: { top: number; bottom: number; left: number; right: number }
    margin?: { top: number; bottom: number }
    backgroundColor?: string
    textColor?: string
    visibility?: { desktop: boolean; tablet: boolean; mobile: boolean }
  }
}

interface BlockRendererProps {
  blocks: PageBlock[]
  collections?: Array<{ id: string; name: string; slug: string }>
  products?: Array<{ id: string; name: string; slug: string; price: number; images: string[] }>
}

const blockComponents: Record<string, React.FC<{
  content: Record<string, unknown>
  collections: Array<{ id: string; name: string; slug: string }>
  products: Array<{ id: string; name: string; slug: string; price: number; images: string[] }>
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
  contact: ContactFormPreview,
  columns: ColumnsPreview,
  spacer: SpacerPreview,
  divider: DividerPreview,
  'custom-form': CustomFormPreview,
  button: ButtonPreview,
  'accordion-tabs': AccordionTabsPreview,
  features: FeaturesPreview,
  'social-links': SocialLinksPreview,
  map: MapPreview,
  counter: CounterPreview,
  pricing: PricingPreview,
  manifesto: ManifestoBlockPreview,
  values: ValuesBlockPreview,
  quote: QuoteBlockPreview,
}

export function BlockRenderer({ blocks, collections = [], products = [] }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      {blocks.map((block) => {
        const BlockComponent = blockComponents[block.type]

        if (!BlockComponent) {
          console.warn(`Unknown block type: ${block.type}`)
          return null
        }

        const settings = block.settings || {}

        return (
          <div
            key={block.id}
            style={{
              paddingTop: settings.padding?.top || 0,
              paddingBottom: settings.padding?.bottom || 0,
              paddingLeft: settings.padding?.left || 0,
              paddingRight: settings.padding?.right || 0,
              marginTop: settings.margin?.top || 0,
              marginBottom: settings.margin?.bottom || 0,
              backgroundColor: settings.backgroundColor || undefined,
              color: settings.textColor || undefined,
            }}
          >
            <BlockComponent
              content={block.content}
              collections={collections}
              products={products}
              viewMode="desktop"
            />
          </div>
        )
      })}
    </div>
  )
}
