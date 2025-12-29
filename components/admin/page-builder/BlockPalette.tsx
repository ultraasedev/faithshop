'use client'

import { useDraggable } from '@dnd-kit/core'
import {
  Type,
  Image,
  Video,
  Grid3X3,
  Quote,
  HelpCircle,
  Mail,
  MessageSquare,
  Columns,
  Minus,
  MoveVertical,
  Star,
  ShoppingBag,
  ArrowRight,
  Layout,
  FormInput,
  MousePointer,
  PanelTop,
  LayoutGrid,
  Share2,
  MapPin,
  Hash,
  CreditCard,
  FileText,
  ListOrdered,
  MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlockType {
  type: string
  label: string
  icon: typeof Type
  category: string
  description: string
}

const blockTypes: BlockType[] = [
  // Layout
  {
    type: 'hero',
    label: 'Hero',
    icon: Layout,
    category: 'layout',
    description: 'Bannière principale avec image de fond'
  },
  {
    type: 'columns',
    label: 'Colonnes',
    icon: Columns,
    category: 'layout',
    description: 'Mise en page en colonnes'
  },
  {
    type: 'spacer',
    label: 'Espacement',
    icon: MoveVertical,
    category: 'layout',
    description: 'Ajouter de l\'espace vertical'
  },
  {
    type: 'divider',
    label: 'Séparateur',
    icon: Minus,
    category: 'layout',
    description: 'Ligne de séparation'
  },

  // Contenu
  {
    type: 'text',
    label: 'Texte',
    icon: Type,
    category: 'content',
    description: 'Bloc de texte riche'
  },
  {
    type: 'image',
    label: 'Image',
    icon: Image,
    category: 'content',
    description: 'Image simple ou avec lien'
  },
  {
    type: 'video',
    label: 'Vidéo',
    icon: Video,
    category: 'content',
    description: 'YouTube, Vimeo ou upload'
  },
  {
    type: 'gallery',
    label: 'Galerie',
    icon: Grid3X3,
    category: 'content',
    description: 'Grille d\'images avec lightbox'
  },

  // Commerce
  {
    type: 'product-grid',
    label: 'Grille produits',
    icon: ShoppingBag,
    category: 'commerce',
    description: 'Afficher des produits en grille'
  },
  {
    type: 'product-carousel',
    label: 'Carrousel',
    icon: ArrowRight,
    category: 'commerce',
    description: 'Carousel de produits'
  },

  // Engagement
  {
    type: 'testimonials',
    label: 'Témoignages',
    icon: Quote,
    category: 'engagement',
    description: 'Avis et témoignages clients'
  },
  {
    type: 'faq',
    label: 'FAQ',
    icon: HelpCircle,
    category: 'engagement',
    description: 'Questions fréquentes accordion'
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    icon: Mail,
    category: 'engagement',
    description: 'Formulaire d\'inscription'
  },
  {
    type: 'contact-form',
    label: 'Contact',
    icon: MessageSquare,
    category: 'engagement',
    description: 'Formulaire de contact'
  },

  // Formulaires
  {
    type: 'custom-form',
    label: 'Formulaire',
    icon: FormInput,
    category: 'forms',
    description: 'Formulaire personnalisé avec champs'
  },
  {
    type: 'button',
    label: 'Bouton',
    icon: MousePointer,
    category: 'content',
    description: 'Bouton avec lien personnalisé'
  },

  // Avancé
  {
    type: 'accordion-tabs',
    label: 'Accordéon/Tabs',
    icon: PanelTop,
    category: 'advanced',
    description: 'Contenu en accordéon ou onglets'
  },
  {
    type: 'features',
    label: 'Fonctionnalités',
    icon: LayoutGrid,
    category: 'advanced',
    description: 'Grille de fonctionnalités avec icônes'
  },
  {
    type: 'social-links',
    label: 'Réseaux sociaux',
    icon: Share2,
    category: 'advanced',
    description: 'Liens vers réseaux sociaux'
  },
  {
    type: 'map',
    label: 'Carte',
    icon: MapPin,
    category: 'advanced',
    description: 'Carte de localisation'
  },
  {
    type: 'counter',
    label: 'Compteurs',
    icon: Hash,
    category: 'advanced',
    description: 'Statistiques et chiffres clés'
  },
  {
    type: 'pricing',
    label: 'Tarification',
    icon: CreditCard,
    category: 'advanced',
    description: 'Tableaux de prix'
  },

  // Sections de page
  {
    type: 'manifesto',
    label: 'Manifesto',
    icon: FileText,
    category: 'layout',
    description: 'Section manifeste avec texte et branding'
  },
  {
    type: 'values',
    label: 'Valeurs',
    icon: ListOrdered,
    category: 'layout',
    description: 'Section de valeurs numérotées'
  },
  {
    type: 'quote',
    label: 'Citation',
    icon: MessageCircle,
    category: 'content',
    description: 'Citation avec auteur'
  },
]

const categories = [
  { id: 'layout', label: 'Mise en page' },
  { id: 'content', label: 'Contenu' },
  { id: 'commerce', label: 'Commerce' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'forms', label: 'Formulaires' },
  { id: 'advanced', label: 'Avancé' },
]

function DraggableBlock({ block }: { block: BlockType }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${block.type}`,
    data: { type: block.type }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const Icon = block.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border cursor-grab",
        "bg-white dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600",
        "transition-all hover:shadow-sm",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800">
        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 dark:text-white">
          {block.label}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {block.description}
        </p>
      </div>
    </div>
  )
}

export function BlockPalette() {
  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categoryBlocks = blockTypes.filter(b => b.category === category.id)

        return (
          <div key={category.id}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {category.label}
            </h3>
            <div className="space-y-2">
              {categoryBlocks.map((block) => (
                <DraggableBlock key={block.type} block={block} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
