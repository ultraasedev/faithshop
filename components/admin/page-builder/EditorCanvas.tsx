'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import {
  GripVertical,
  Trash2,
  Copy,
  Settings,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PageBlock } from './PageBuilder'

// Block Renderers
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
import { CustomFormPreview } from './blocks/CustomFormBlock'
import { ButtonPreview } from './blocks/ButtonBlock'
import { AccordionTabsPreview } from './blocks/AccordionTabsBlock'
import { FeaturesPreview } from './blocks/FeaturesBlock'
import { SocialLinksPreview } from './blocks/SocialLinksBlock'
import { MapPreview } from './blocks/MapBlock'
import { CounterPreview } from './blocks/CounterBlock'
import { PricingPreview } from './blocks/PricingBlock'
import { ManifestoBlockPreview } from './blocks/ManifestoBlock'
import { ValuesBlockPreview } from './blocks/ValuesBlock'
import { QuoteBlockPreview } from './blocks/QuoteBlock'
import { SliderBlockPreview } from './blocks/SliderBlock'

interface EditorCanvasProps {
  blocks: PageBlock[]
  selectedBlockId: string | null
  onSelectBlock: (id: string | null) => void
  onDeleteBlock: (id: string) => void
  onDuplicateBlock: (id: string) => void
  collections: Array<{ id: string; name: string; slug: string }>
  products: Array<{ id: string; name: string; slug: string; price: number; images: string[] }>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

interface SortableBlockProps {
  block: PageBlock
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  collections: Array<{ id: string; name: string; slug: string }>
  products: Array<{ id: string; name: string; slug: string; price: number; images: string[] }>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

function SortableBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  collections,
  products,
  viewMode
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const BlockPreview = getBlockPreview(block.type)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50 z-50"
      )}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {/* Block Outline */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none transition-all",
          isSelected
            ? "ring-2 ring-blue-500 ring-offset-2"
            : "ring-0 group-hover:ring-2 group-hover:ring-gray-300"
        )}
      />

      {/* Block Controls */}
      <div
        className={cn(
          "absolute -top-10 left-1/2 -translate-x-1/2 z-10",
          "flex items-center gap-1 p-1 rounded-lg bg-white dark:bg-gray-800 shadow-lg",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          isSelected && "opacity-100"
        )}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-grab"
        >
          <GripVertical className="h-4 w-4 text-gray-500" />
        </button>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />

        {/* Block Type Label */}
        <span className="px-2 text-xs font-medium text-gray-600 dark:text-gray-400">
          {getBlockLabel(block.type)}
        </span>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />

        {/* Duplicate */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate()
          }}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Copy className="h-4 w-4 text-gray-500" />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>

      {/* Block Content */}
      <div
        style={{
          paddingTop: block.settings?.padding?.top || 0,
          paddingBottom: block.settings?.padding?.bottom || 0,
          paddingLeft: block.settings?.padding?.left || 0,
          paddingRight: block.settings?.padding?.right || 0,
          marginTop: block.settings?.margin?.top || 0,
          marginBottom: block.settings?.margin?.bottom || 0,
          backgroundColor: block.settings?.backgroundColor || undefined,
          color: block.settings?.textColor || undefined,
        }}
      >
        <BlockPreview
          content={block.content}
          collections={collections}
          products={products}
          viewMode={viewMode}
        />
      </div>
    </div>
  )
}

export function EditorCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
  collections,
  products,
  viewMode
}: EditorCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop-area'
  })

  if (blocks.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg m-8 transition-colors",
          isOver
            ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-700"
        )}
        onClick={() => onSelectBlock(null)}
      >
        <div className="text-center">
          <Plus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-500 mb-2">
            Commencez à construire votre page
          </p>
          <p className="text-sm text-gray-400">
            Glissez des blocs depuis la palette de gauche
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      className="min-h-full"
      onClick={() => onSelectBlock(null)}
    >
      {blocks.map((block) => (
        <SortableBlock
          key={block.id}
          block={block}
          isSelected={selectedBlockId === block.id}
          onSelect={() => onSelectBlock(block.id)}
          onDelete={() => onDeleteBlock(block.id)}
          onDuplicate={() => onDuplicateBlock(block.id)}
          collections={collections}
          products={products}
          viewMode={viewMode}
        />
      ))}
    </div>
  )
}

function getBlockPreview(type: string) {
  const previews: Record<string, React.FC<{
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
    'contact': ContactFormPreview, // Alias
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
    slider: SliderBlockPreview,
  }

  return previews[type] || DefaultBlockPreview
}

function DefaultBlockPreview({ content }: { content: Record<string, unknown> }) {
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
      <p className="text-sm text-gray-500">Bloc non reconnu</p>
      <pre className="text-xs mt-2 overflow-auto">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  )
}

function getBlockLabel(type: string): string {
  const labels: Record<string, string> = {
    hero: 'Hero',
    text: 'Texte',
    image: 'Image',
    video: 'Vidéo',
    gallery: 'Galerie',
    'product-grid': 'Grille produits',
    'product-carousel': 'Carrousel',
    testimonials: 'Témoignages',
    faq: 'FAQ',
    newsletter: 'Newsletter',
    'contact-form': 'Contact',
    'contact': 'Contact',
    columns: 'Colonnes',
    spacer: 'Espace',
    divider: 'Séparateur',
    'custom-form': 'Formulaire',
    button: 'Bouton',
    'accordion-tabs': 'Accordéon/Tabs',
    features: 'Fonctionnalités',
    'social-links': 'Réseaux sociaux',
    map: 'Carte',
    counter: 'Compteurs',
    pricing: 'Tarification',
    manifesto: 'Manifesto',
    values: 'Valeurs',
    quote: 'Citation',
    slider: 'Slider',
  }

  return labels[type] || type
}
