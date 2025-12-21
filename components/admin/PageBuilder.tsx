'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Trash2,
  Move,
  Type,
  Image as ImageIcon,
  Video,
  Layout,
  Grid3X3,
  Save,
  Eye,
  Undo,
  Redo
} from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import RichTextEditor from './RichTextEditor'
import LivePreview from './LivePreview'

type BlockType = 'text' | 'image' | 'video' | 'columns' | 'hero' | 'cta' | 'gallery'

interface Block {
  id: string
  type: BlockType
  content: any
  settings: any
}

interface PageBuilderProps {
  initialBlocks?: Block[]
  onSave: (blocks: Block[]) => void
  onPreview?: (blocks: Block[]) => void
}

const blockTemplates: Record<BlockType, { icon: React.ElementType; label: string; defaultContent: any }> = {
  text: {
    icon: Type,
    label: 'Texte',
    defaultContent: { html: '<p>Votre texte ici...</p>' }
  },
  image: {
    icon: ImageIcon,
    label: 'Image',
    defaultContent: { src: '', alt: '', caption: '' }
  },
  video: {
    icon: Video,
    label: 'Vidéo',
    defaultContent: { src: '', poster: '' }
  },
  columns: {
    icon: Grid3X3,
    label: 'Colonnes',
    defaultContent: { columns: [{ html: '<p>Colonne 1</p>' }, { html: '<p>Colonne 2</p>' }] }
  },
  hero: {
    icon: Layout,
    label: 'Section Hero',
    defaultContent: {
      title: 'Titre Principal',
      subtitle: 'Sous-titre',
      backgroundImage: '',
      buttonText: 'Call to Action',
      buttonLink: '#'
    }
  },
  cta: {
    icon: Layout,
    label: 'Call to Action',
    defaultContent: {
      title: 'Titre CTA',
      description: 'Description',
      buttonText: 'Bouton',
      buttonLink: '#'
    }
  },
  gallery: {
    icon: ImageIcon,
    label: 'Galerie',
    defaultContent: { images: [] }
  }
}

interface SortableBlockProps {
  block: Block
  onUpdate: (id: string, content: any, settings?: any) => void
  onDelete: (id: string) => void
}

function SortableBlock({ block, onUpdate, onDelete }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const renderBlockEditor = () => {
    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <RichTextEditor
              content={block.content.html || ''}
              onChange={(html) => onUpdate(block.id, { html })}
              placeholder="Votre contenu..."
            />
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-src">URL de l'image</Label>
              <Input
                id="image-src"
                value={block.content.src || ''}
                onChange={(e) => onUpdate(block.id, { ...block.content, src: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="image-alt">Texte alternatif</Label>
              <Input
                id="image-alt"
                value={block.content.alt || ''}
                onChange={(e) => onUpdate(block.id, { ...block.content, alt: e.target.value })}
                placeholder="Description de l'image"
              />
            </div>
            <div>
              <Label htmlFor="image-caption">Légende (optionnel)</Label>
              <Input
                id="image-caption"
                value={block.content.caption || ''}
                onChange={(e) => onUpdate(block.id, { ...block.content, caption: e.target.value })}
                placeholder="Légende de l'image"
              />
            </div>
            {block.content.src && (
              <div className="mt-4">
                <img
                  src={block.content.src}
                  alt={block.content.alt}
                  className="max-w-full h-auto rounded-lg border"
                />
              </div>
            )}
          </div>
        )

      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="hero-title">Titre principal</Label>
              <Input
                id="hero-title"
                value={block.content.title || ''}
                onChange={(e) => onUpdate(block.id, { ...block.content, title: e.target.value })}
                placeholder="Titre principal"
              />
            </div>
            <div>
              <Label htmlFor="hero-subtitle">Sous-titre</Label>
              <Input
                id="hero-subtitle"
                value={block.content.subtitle || ''}
                onChange={(e) => onUpdate(block.id, { ...block.content, subtitle: e.target.value })}
                placeholder="Sous-titre"
              />
            </div>
            <div>
              <Label htmlFor="hero-bg">Image de fond</Label>
              <Input
                id="hero-bg"
                value={block.content.backgroundImage || ''}
                onChange={(e) => onUpdate(block.id, { ...block.content, backgroundImage: e.target.value })}
                placeholder="URL de l'image de fond"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hero-button-text">Texte du bouton</Label>
                <Input
                  id="hero-button-text"
                  value={block.content.buttonText || ''}
                  onChange={(e) => onUpdate(block.id, { ...block.content, buttonText: e.target.value })}
                  placeholder="Call to Action"
                />
              </div>
              <div>
                <Label htmlFor="hero-button-link">Lien du bouton</Label>
                <Input
                  id="hero-button-link"
                  value={block.content.buttonLink || ''}
                  onChange={(e) => onUpdate(block.id, { ...block.content, buttonLink: e.target.value })}
                  placeholder="#"
                />
              </div>
            </div>
          </div>
        )

      case 'columns':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Colonnes ({block.content.columns?.length || 0})</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newColumns = [...(block.content.columns || []), { html: '<p>Nouvelle colonne</p>' }]
                    onUpdate(block.id, { columns: newColumns })
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {block.content.columns?.map((column: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Colonne {index + 1}</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newColumns = block.content.columns.filter((_: any, i: number) => i !== index)
                        onUpdate(block.id, { columns: newColumns })
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <RichTextEditor
                    content={column.html}
                    onChange={(html) => {
                      const newColumns = [...block.content.columns]
                      newColumns[index] = { html }
                      onUpdate(block.id, { columns: newColumns })
                    }}
                    minimal
                  />
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div className="p-8 text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
              📝
            </div>
            <p>Éditeur pour {block.type} non encore implémenté</p>
          </div>
        )
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-4 ${isDragging ? 'ring-2 ring-primary' : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
          >
            <Move className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-sm font-medium">
            {blockTemplates[block.type]?.label || block.type}
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(block.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {renderBlockEditor()}
      </CardContent>
    </Card>
  )
}

export default function PageBuilder({ initialBlocks = [], onSave, onPreview }: PageBuilderProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  const addBlock = useCallback((type: BlockType) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: blockTemplates[type].defaultContent,
      settings: {}
    }
    setBlocks(prev => [...prev, newBlock])
  }, [])

  const updateBlock = useCallback((id: string, content: any, settings?: any) => {
    setBlocks(prev => prev.map(block =>
      block.id === id
        ? { ...block, content, settings: settings || block.settings }
        : block
    ))
  }, [])

  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id))
  }, [])

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setBlocks(prev => {
        const oldIndex = prev.findIndex(block => block.id === active.id)
        const newIndex = prev.findIndex(block => block.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }

    setActiveId(null)
  }

  const generatePreviewData = () => {
    return {
      title: 'Aperçu de la page',
      description: '',
      content: blocks.map(block => {
        switch (block.type) {
          case 'text':
            return block.content.html
          case 'hero':
            return `<div class="hero-section" style="background-image: url(${block.content.backgroundImage})">
              <h1>${block.content.title}</h1>
              <p>${block.content.subtitle}</p>
              <a href="${block.content.buttonLink}">${block.content.buttonText}</a>
            </div>`
          default:
            return ''
        }
      }).join(''),
      price: 0,
      images: [],
      isActive: true
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Page Builder</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Masquer' : 'Aperçu'}
              </Button>
              <Button
                size="sm"
                onClick={() => onSave(blocks)}
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(blockTemplates).map(([type, template]) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => addBlock(type as BlockType)}
                className="flex items-center gap-2"
              >
                <template.icon className="h-4 w-4" />
                {template.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          <h3 className="font-semibold">Éditeur</h3>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="text-muted-foreground">
                    <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Votre page est vide</p>
                    <p className="text-sm">Ajoutez des blocs avec la barre d'outils ci-dessus</p>
                  </div>
                </Card>
              ) : (
                blocks.map(block => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    onUpdate={updateBlock}
                    onDelete={deleteBlock}
                  />
                ))
              )}
            </SortableContext>
          </DndContext>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="space-y-4">
            <h3 className="font-semibold">Aperçu</h3>
            <LivePreview
              data={generatePreviewData()}
              type="page"
            />
          </div>
        )}
      </div>
    </div>
  )
}