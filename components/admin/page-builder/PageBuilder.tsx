'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  ArrowLeft,
  Save,
  Eye,
  Undo,
  Redo,
  Monitor,
  Tablet,
  Smartphone,
  Settings,
  Layers,
  Search,
  Globe,
  Menu,
  X,
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BlockPalette } from './BlockPalette'
import { EditorCanvas } from './EditorCanvas'
import { BlockSettings } from './BlockSettings'
import { PreviewFrame } from './PreviewFrame'

export interface PageBlock {
  id: string
  type: string
  content: Record<string, unknown>
  settings: {
    padding?: { top: number; bottom: number; left: number; right: number }
    margin?: { top: number; bottom: number }
    backgroundColor?: string
    textColor?: string
    visibility?: { mobile: boolean; tablet: boolean; desktop: boolean }
  }
  children?: PageBlock[]
}

interface PageBuilderProps {
  page: {
    id: string
    title: string
    slug: string
    status: string
    content: { blocks: PageBlock[] }
    metaTitle: string | null
    metaDescription: string | null
  }
  collections: Array<{ id: string; name: string; slug: string }>
  products: Array<{ id: string; name: string; slug: string; price: number; images: string[] }>
}

type ViewMode = 'desktop' | 'tablet' | 'mobile'

export function PageBuilder({ page, collections, products }: PageBuilderProps) {
  const router = useRouter()
  const [blocks, setBlocks] = useState<PageBlock[]>(page.content.blocks || [])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [history, setHistory] = useState<PageBlock[][]>([blocks])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showLeftPanel, setShowLeftPanel] = useState(false)
  const [showRightPanel, setShowRightPanel] = useState(false)

  // SEO settings
  const [metaTitle, setMetaTitle] = useState(page.metaTitle || '')
  const [metaDescription, setMetaDescription] = useState(page.metaDescription || '')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const selectedBlock = blocks.find(b => b.id === selectedBlockId)

  // History management
  const pushHistory = useCallback((newBlocks: PageBlock[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newBlocks)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setBlocks(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setBlocks(history[historyIndex + 1])
    }
  }

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    // Check if dropping a new block from palette
    if (active.id.toString().startsWith('palette-')) {
      const blockType = active.id.toString().replace('palette-', '')
      const newBlock = createNewBlock(blockType)

      const overIndex = blocks.findIndex(b => b.id === over.id)
      const newBlocks = [...blocks]

      if (overIndex === -1) {
        newBlocks.push(newBlock)
      } else {
        newBlocks.splice(overIndex + 1, 0, newBlock)
      }

      setBlocks(newBlocks)
      pushHistory(newBlocks)
      setSelectedBlockId(newBlock.id)
      return
    }

    // Reorder existing blocks
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id)
      const newIndex = blocks.findIndex(b => b.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = arrayMove(blocks, oldIndex, newIndex)
        setBlocks(newBlocks)
        pushHistory(newBlocks)
      }
    }
  }

  // Block operations
  const createNewBlock = (type: string): PageBlock => {
    return {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: getDefaultContent(type),
      settings: {
        padding: { top: 40, bottom: 40, left: 20, right: 20 },
        margin: { top: 0, bottom: 0 },
        visibility: { mobile: true, tablet: true, desktop: true }
      }
    }
  }

  const updateBlock = (blockId: string, updates: Partial<PageBlock>) => {
    const newBlocks = blocks.map(b =>
      b.id === blockId ? { ...b, ...updates } : b
    )
    setBlocks(newBlocks)
    pushHistory(newBlocks)
  }

  const deleteBlock = (blockId: string) => {
    const newBlocks = blocks.filter(b => b.id !== blockId)
    setBlocks(newBlocks)
    pushHistory(newBlocks)
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null)
    }
  }

  const duplicateBlock = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId)
    if (!block) return

    const newBlock: PageBlock = {
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    const index = blocks.findIndex(b => b.id === blockId)
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    setBlocks(newBlocks)
    pushHistory(newBlocks)
    setSelectedBlockId(newBlock.id)
  }

  // Save page
  const handleSave = async (publish = false) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { blocks },
          status: publish ? 'PUBLISHED' : page.status,
          metaTitle,
          metaDescription
        })
      })

      if (res.ok) {
        router.refresh()
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 -m-8">
      {/* Top Bar */}
      <div className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between px-2 sm:px-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/pages')} className="hidden sm:flex">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Retour</span>
          </Button>

          <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-800" />

          <div className="hidden sm:block">
            <h1 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
              {page.title}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">/{page.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Undo/Redo */}
          <div className="hidden sm:flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={historyIndex === 0}
              className="rounded-none h-8 w-8 p-0"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="rounded-none h-8 w-8 p-0"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          {/* View Mode - Hidden on mobile */}
          <div className="hidden md:flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {[
              { mode: 'desktop' as const, icon: Monitor },
              { mode: 'tablet' as const, icon: Tablet },
              { mode: 'mobile' as const, icon: Smartphone },
            ].map(({ mode, icon: Icon }) => (
              <Button
                key={mode}
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(mode)}
                className={cn(
                  "rounded-none h-8 w-8 p-0",
                  viewMode === mode && "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-800" />

          {/* Preview */}
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="h-8 px-2 sm:px-3">
            <Eye className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Prévisualiser</span>
          </Button>

          {/* Settings */}
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>

          {/* Save */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="h-8 px-2 sm:px-3"
          >
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Enregistrer</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="h-8"
          >
            <span className="hidden sm:inline">Publier</span>
            <span className="sm:hidden">OK</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Mobile Left Panel Overlay */}
          {showLeftPanel && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowLeftPanel(false)}
            />
          )}

          {/* Left Sidebar - Block Palette */}
          <div className={cn(
            "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto",
            "w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col overflow-hidden",
            "transform transition-transform duration-200 ease-in-out lg:transform-none",
            showLeftPanel ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}>
            {/* Mobile close button */}
            <div className="lg:hidden flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
              <span className="font-medium text-gray-900 dark:text-white">Blocs</span>
              <Button variant="ghost" size="sm" onClick={() => setShowLeftPanel(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue="blocks" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-gray-200 dark:border-gray-700 px-2 bg-transparent">
                <TabsTrigger value="blocks" className="gap-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800">
                  <Layers className="h-4 w-4" />
                  Blocs
                </TabsTrigger>
                <TabsTrigger value="layers" className="gap-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800">
                  <Search className="h-4 w-4" />
                  Structure
                </TabsTrigger>
              </TabsList>

              <TabsContent value="blocks" className="flex-1 overflow-auto p-4 mt-0">
                <BlockPalette />
              </TabsContent>

              <TabsContent value="layers" className="flex-1 overflow-auto p-4 mt-0">
                <div className="space-y-2">
                  {blocks.map((block, index) => (
                    <button
                      key={block.id}
                      onClick={() => {
                        setSelectedBlockId(block.id)
                        setShowLeftPanel(false)
                      }}
                      className={cn(
                        "w-full p-2 text-left rounded-lg border text-sm transition-colors",
                        selectedBlockId === block.id
                          ? "border-gray-900 bg-gray-50 dark:border-white dark:bg-gray-800"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      )}
                    >
                      <span className="text-gray-500 dark:text-gray-400 mr-2">{index + 1}.</span>
                      <span className="text-gray-900 dark:text-white">{block.type}</span>
                    </button>
                  ))}
                  {blocks.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                      Glissez des blocs ici pour commencer
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div
              className={cn(
                "mx-auto bg-white dark:bg-gray-950 min-h-full shadow-xl transition-all rounded-lg overflow-hidden",
                viewMode === 'desktop' && "w-full max-w-6xl",
                viewMode === 'tablet' && "max-w-[768px]",
                viewMode === 'mobile' && "max-w-[375px]"
              )}
            >
              <SortableContext
                items={blocks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <EditorCanvas
                  blocks={blocks}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={(id) => {
                    setSelectedBlockId(id)
                    if (id) setShowRightPanel(true)
                  }}
                  onDeleteBlock={deleteBlock}
                  onDuplicateBlock={duplicateBlock}
                  collections={collections}
                  products={products}
                  viewMode={viewMode}
                />
              </SortableContext>
            </div>
          </div>

          <DragOverlay>
            {activeId && activeId.toString().startsWith('palette-') && (
              <div className="p-4 bg-white dark:bg-gray-900 shadow-xl rounded-lg border-2 border-gray-900 dark:border-white">
                <span className="text-gray-900 dark:text-white">{activeId.toString().replace('palette-', '')}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Mobile Right Panel Overlay */}
        {selectedBlock && showRightPanel && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowRightPanel(false)}
          />
        )}

        {/* Right Sidebar - Block Settings */}
        {selectedBlock && (
          <div className={cn(
            "fixed lg:relative inset-y-0 right-0 z-50 lg:z-auto",
            "w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-auto",
            "transform transition-transform duration-200 ease-in-out lg:transform-none",
            showRightPanel ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          )}>
            <BlockSettings
              block={selectedBlock}
              onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
              onClose={() => setSelectedBlockId(null)}
              collections={collections}
              products={products}
            />
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewFrame
          blocks={blocks}
          viewMode={viewMode}
          onClose={() => setShowPreview(false)}
          collections={collections}
          products={products}
        />
      )}

      {/* Page Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Paramètres de la page</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                SEO
              </h3>

              <div className="space-y-2">
                <Label>Meta titre</Label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={page.title}
                />
                <p className="text-xs text-gray-500">
                  {metaTitle.length}/60 caractères recommandés
                </p>
              </div>

              <div className="space-y-2">
                <Label>Meta description</Label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Description de la page pour les moteurs de recherche..."
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm"
                />
                <p className="text-xs text-gray-500">
                  {metaDescription.length}/160 caractères recommandés
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function getDefaultContent(type: string): Record<string, unknown> {
  const defaults: Record<string, Record<string, unknown>> = {
    hero: {
      title: 'Titre principal',
      subtitle: 'Sous-titre accrocheur',
      buttonText: 'Découvrir',
      buttonLink: '/shop',
      backgroundImage: '',
      alignment: 'center',
      overlay: true,
      overlayOpacity: 50
    },
    text: {
      content: '<p>Votre texte ici...</p>',
      alignment: 'left'
    },
    image: {
      src: '',
      alt: '',
      caption: '',
      width: 'full',
      link: ''
    },
    video: {
      type: 'youtube',
      url: '',
      autoplay: false,
      loop: false,
      muted: true
    },
    gallery: {
      images: [],
      columns: 3,
      gap: 16,
      lightbox: true
    },
    'product-grid': {
      title: 'Nos produits',
      source: 'manual',
      productIds: [],
      collectionId: '',
      columns: 4,
      limit: 8,
      showPrice: true,
      showAddToCart: true
    },
    'product-carousel': {
      title: 'À découvrir',
      source: 'featured',
      productIds: [],
      collectionId: '',
      autoplay: true,
      showDots: true,
      showArrows: true
    },
    testimonials: {
      title: 'Ce que disent nos clients',
      items: [
        { name: 'Client 1', text: 'Super produit !', rating: 5 }
      ],
      layout: 'grid'
    },
    faq: {
      title: 'Questions fréquentes',
      items: [
        { question: 'Question 1 ?', answer: 'Réponse 1' }
      ]
    },
    newsletter: {
      title: 'Restez informé',
      description: 'Inscrivez-vous à notre newsletter',
      buttonText: "S'inscrire",
      backgroundColor: '#000000'
    },
    'contact-form': {
      title: 'Contactez-nous',
      fields: ['name', 'email', 'message'],
      submitText: 'Envoyer',
      successMessage: 'Message envoyé !'
    },
    columns: {
      columns: 2,
      gap: 24,
      children: []
    },
    spacer: {
      height: 60
    },
    divider: {
      style: 'solid',
      color: '#e5e7eb',
      width: 1
    }
  }

  return defaults[type] || {}
}
