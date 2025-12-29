'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { X, Plus, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PageBlock } from './PageBuilder'

interface BlockSettingsProps {
  block: PageBlock
  onUpdate: (updates: Partial<PageBlock>) => void
  onClose: () => void
  collections: Array<{ id: string; name: string; slug: string }>
  products: Array<{ id: string; name: string; slug: string; price: number; images: string[] }>
}

export function BlockSettings({
  block,
  onUpdate,
  onClose,
  collections,
  products
}: BlockSettingsProps) {
  // Ensure settings always has default values
  const settings = block.settings || {
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
    margin: { top: 0, bottom: 0 },
    visibility: { desktop: true, tablet: true, mobile: true }
  }

  const updateContent = (updates: Record<string, unknown>) => {
    onUpdate({
      content: { ...block.content, ...updates }
    })
  }

  const updateSettings = (updates: Partial<PageBlock['settings']>) => {
    onUpdate({
      settings: { ...settings, ...updates }
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Paramètres</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <Tabs defaultValue="content" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b px-4">
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="content" className="p-4 space-y-4 mt-0">
            <ContentSettings
              type={block.type}
              content={block.content}
              onUpdate={updateContent}
              collections={collections}
              products={products}
            />
          </TabsContent>

          <TabsContent value="style" className="p-4 space-y-6 mt-0">
            {/* Padding */}
            <div className="space-y-4">
              <Label>Marges internes (padding)</Label>
              <div className="grid grid-cols-2 gap-3">
                {['top', 'bottom', 'left', 'right'].map((side) => (
                  <div key={side}>
                    <label className="text-xs text-gray-500 capitalize mb-1 block">
                      {side === 'top' ? 'Haut' : side === 'bottom' ? 'Bas' : side === 'left' ? 'Gauche' : 'Droite'}
                    </label>
                    <Input
                      type="number"
                      value={settings.padding?.[side as keyof typeof settings.padding] || 0}
                      onChange={(e) => updateSettings({
                        padding: {
                          ...settings.padding,
                          top: settings.padding?.top || 0,
                          bottom: settings.padding?.bottom || 0,
                          left: settings.padding?.left || 0,
                          right: settings.padding?.right || 0,
                          [side]: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Margin */}
            <div className="space-y-4">
              <Label>Marges externes (margin)</Label>
              <div className="grid grid-cols-2 gap-3">
                {['top', 'bottom'].map((side) => (
                  <div key={side}>
                    <label className="text-xs text-gray-500 capitalize mb-1 block">
                      {side === 'top' ? 'Haut' : 'Bas'}
                    </label>
                    <Input
                      type="number"
                      value={settings.margin?.[side as keyof typeof settings.margin] || 0}
                      onChange={(e) => updateSettings({
                        margin: {
                          ...settings.margin,
                          top: settings.margin?.top || 0,
                          bottom: settings.margin?.bottom || 0,
                          [side]: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <Label>Couleur de fond</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={settings.backgroundColor || '#ffffff'}
                  onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={settings.backgroundColor || ''}
                  onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                  placeholder="Transparent"
                />
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <Label>Couleur du texte</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={settings.textColor || '#000000'}
                  onChange={(e) => updateSettings({ textColor: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={settings.textColor || ''}
                  onChange={(e) => updateSettings({ textColor: e.target.value })}
                  placeholder="Par défaut"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="p-4 space-y-6 mt-0">
            {/* Visibility */}
            <div className="space-y-4">
              <Label>Visibilité par appareil</Label>
              {['desktop', 'tablet', 'mobile'].map((device) => (
                <div key={device} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {device === 'desktop' ? 'Ordinateur' : device === 'tablet' ? 'Tablette' : 'Mobile'}
                  </span>
                  <Switch
                    checked={settings.visibility?.[device as keyof typeof settings.visibility] ?? true}
                    onCheckedChange={(checked) => updateSettings({
                      visibility: {
                        ...settings.visibility,
                        desktop: settings.visibility?.desktop ?? true,
                        tablet: settings.visibility?.tablet ?? true,
                        mobile: settings.visibility?.mobile ?? true,
                        [device]: checked
                      }
                    })}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

interface ContentSettingsProps {
  type: string
  content: Record<string, unknown>
  onUpdate: (updates: Record<string, unknown>) => void
  collections: Array<{ id: string; name: string; slug: string }>
  products: Array<{ id: string; name: string; slug: string; price: number; images: string[] }>
}

function ContentSettings({ type, content, onUpdate, collections, products }: ContentSettingsProps) {
  switch (type) {
    case 'hero':
      return <HeroSettings content={content} onUpdate={onUpdate} />
    case 'text':
      return <TextSettings content={content} onUpdate={onUpdate} />
    case 'image':
      return <ImageSettings content={content} onUpdate={onUpdate} />
    case 'video':
      return <VideoSettings content={content} onUpdate={onUpdate} />
    case 'gallery':
      return <GallerySettings content={content} onUpdate={onUpdate} />
    case 'product-grid':
      return <ProductGridSettings content={content} onUpdate={onUpdate} collections={collections} products={products} />
    case 'product-carousel':
      return <ProductCarouselSettings content={content} onUpdate={onUpdate} collections={collections} products={products} />
    case 'testimonials':
      return <TestimonialsSettings content={content} onUpdate={onUpdate} />
    case 'faq':
      return <FAQSettings content={content} onUpdate={onUpdate} />
    case 'newsletter':
      return <NewsletterSettings content={content} onUpdate={onUpdate} />
    case 'contact-form':
      return <ContactFormSettings content={content} onUpdate={onUpdate} />
    case 'spacer':
      return <SpacerSettings content={content} onUpdate={onUpdate} />
    case 'divider':
      return <DividerSettings content={content} onUpdate={onUpdate} />
    case 'columns':
      return <ColumnsSettings content={content} onUpdate={onUpdate} />
    case 'custom-form':
      return <CustomFormSettings content={content} onUpdate={onUpdate} />
    case 'button':
      return <ButtonSettings content={content} onUpdate={onUpdate} />
    case 'accordion-tabs':
      return <AccordionTabsSettings content={content} onUpdate={onUpdate} />
    case 'features':
      return <FeaturesSettings content={content} onUpdate={onUpdate} />
    case 'social-links':
      return <SocialLinksSettings content={content} onUpdate={onUpdate} />
    case 'map':
      return <MapSettings content={content} onUpdate={onUpdate} />
    case 'counter':
      return <CounterSettings content={content} onUpdate={onUpdate} />
    case 'pricing':
      return <PricingSettings content={content} onUpdate={onUpdate} />
    default:
      return <p className="text-sm text-gray-500">Aucun paramètre disponible</p>
  }
}

function HeroSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Sous-titre</Label>
        <Input
          value={(content.subtitle as string) || ''}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Texte du bouton</Label>
        <Input
          value={(content.buttonText as string) || ''}
          onChange={(e) => onUpdate({ buttonText: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Lien du bouton</Label>
        <Input
          value={(content.buttonLink as string) || ''}
          onChange={(e) => onUpdate({ buttonLink: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Image de fond (URL)</Label>
        <Input
          value={(content.backgroundImage as string) || ''}
          onChange={(e) => onUpdate({ backgroundImage: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div className="space-y-2">
        <Label>Alignement</Label>
        <Select
          value={(content.alignment as string) || 'center'}
          onValueChange={(value) => onUpdate({ alignment: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Gauche</SelectItem>
            <SelectItem value="center">Centre</SelectItem>
            <SelectItem value="right">Droite</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label>Overlay sombre</Label>
        <Switch
          checked={(content.overlay as boolean) ?? true}
          onCheckedChange={(checked) => onUpdate({ overlay: checked })}
        />
      </div>
      {content.overlay && (
        <div className="space-y-2">
          <Label>Opacité de l'overlay ({content.overlayOpacity || 50}%)</Label>
          <Slider
            value={[(content.overlayOpacity as number) || 50]}
            onValueChange={([value]) => onUpdate({ overlayOpacity: value })}
            min={0}
            max={100}
            step={10}
          />
        </div>
      )}
    </div>
  )
}

function TextSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Contenu</Label>
        <textarea
          value={(content.content as string) || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          rows={8}
          className="w-full px-3 py-2 border rounded-md text-sm"
          placeholder="<p>Votre texte...</p>"
        />
        <p className="text-xs text-gray-500">Supporte le HTML</p>
      </div>
      <div className="space-y-2">
        <Label>Alignement</Label>
        <Select
          value={(content.alignment as string) || 'left'}
          onValueChange={(value) => onUpdate({ alignment: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Gauche</SelectItem>
            <SelectItem value="center">Centre</SelectItem>
            <SelectItem value="right">Droite</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function ImageSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>URL de l'image</Label>
        <Input
          value={(content.src as string) || ''}
          onChange={(e) => onUpdate({ src: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div className="space-y-2">
        <Label>Texte alternatif</Label>
        <Input
          value={(content.alt as string) || ''}
          onChange={(e) => onUpdate({ alt: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Légende</Label>
        <Input
          value={(content.caption as string) || ''}
          onChange={(e) => onUpdate({ caption: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Largeur</Label>
        <Select
          value={(content.width as string) || 'full'}
          onValueChange={(value) => onUpdate({ width: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Pleine largeur</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="small">Petite</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Lien (optionnel)</Label>
        <Input
          value={(content.link as string) || ''}
          onChange={(e) => onUpdate({ link: e.target.value })}
          placeholder="https://..."
        />
      </div>
    </div>
  )
}

function VideoSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Type</Label>
        <Select
          value={(content.type as string) || 'youtube'}
          onValueChange={(value) => onUpdate({ type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="vimeo">Vimeo</SelectItem>
            <SelectItem value="upload">Fichier uploadé</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>URL de la vidéo</Label>
        <Input
          value={(content.url as string) || ''}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Lecture automatique</Label>
        <Switch
          checked={(content.autoplay as boolean) || false}
          onCheckedChange={(checked) => onUpdate({ autoplay: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Boucle</Label>
        <Switch
          checked={(content.loop as boolean) || false}
          onCheckedChange={(checked) => onUpdate({ loop: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Son désactivé</Label>
        <Switch
          checked={(content.muted as boolean) ?? true}
          onCheckedChange={(checked) => onUpdate({ muted: checked })}
        />
      </div>
    </div>
  )
}

function GallerySettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  const images = (content.images as string[]) || []

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Images</Label>
        {images.map((image, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={image}
              onChange={(e) => {
                const newImages = [...images]
                newImages[index] = e.target.value
                onUpdate({ images: newImages })
              }}
              placeholder="URL de l'image"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newImages = images.filter((_, i) => i !== index)
                onUpdate({ images: newImages })
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdate({ images: [...images, ''] })}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une image
        </Button>
      </div>
      <div className="space-y-2">
        <Label>Colonnes</Label>
        <Select
          value={String((content.columns as number) || 3)}
          onValueChange={(value) => onUpdate({ columns: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2, 3, 4, 5, 6].map((n) => (
              <SelectItem key={n} value={String(n)}>{n} colonnes</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Espacement ({(content.gap as number) || 16}px)</Label>
        <Slider
          value={[(content.gap as number) || 16]}
          onValueChange={([value]) => onUpdate({ gap: value })}
          min={0}
          max={48}
          step={4}
        />
      </div>
    </div>
  )
}

function ProductGridSettings({
  content,
  onUpdate,
  collections,
  products
}: {
  content: Record<string, unknown>
  onUpdate: (u: Record<string, unknown>) => void
  collections: Array<{ id: string; name: string }>
  products: Array<{ id: string; name: string }>
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Source des produits</Label>
        <Select
          value={(content.source as string) || 'manual'}
          onValueChange={(value) => onUpdate({ source: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Sélection manuelle</SelectItem>
            <SelectItem value="collection">Collection</SelectItem>
            <SelectItem value="featured">Produits vedettes</SelectItem>
            <SelectItem value="new">Nouveautés</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {content.source === 'collection' && (
        <div className="space-y-2">
          <Label>Collection</Label>
          <Select
            value={(content.collectionId as string) || ''}
            onValueChange={(value) => onUpdate({ collectionId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une collection" />
            </SelectTrigger>
            <SelectContent>
              {collections.map((col) => (
                <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label>Colonnes</Label>
        <Select
          value={String((content.columns as number) || 4)}
          onValueChange={(value) => onUpdate({ columns: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2, 3, 4, 5, 6].map((n) => (
              <SelectItem key={n} value={String(n)}>{n} colonnes</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Nombre de produits</Label>
        <Input
          type="number"
          value={(content.limit as number) || 8}
          onChange={(e) => onUpdate({ limit: parseInt(e.target.value) || 8 })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Afficher le prix</Label>
        <Switch
          checked={(content.showPrice as boolean) ?? true}
          onCheckedChange={(checked) => onUpdate({ showPrice: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Bouton d'ajout au panier</Label>
        <Switch
          checked={(content.showAddToCart as boolean) ?? true}
          onCheckedChange={(checked) => onUpdate({ showAddToCart: checked })}
        />
      </div>
    </div>
  )
}

function ProductCarouselSettings({
  content,
  onUpdate,
  collections,
}: {
  content: Record<string, unknown>
  onUpdate: (u: Record<string, unknown>) => void
  collections: Array<{ id: string; name: string }>
  products: Array<{ id: string; name: string }>
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Source</Label>
        <Select
          value={(content.source as string) || 'featured'}
          onValueChange={(value) => onUpdate({ source: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Produits vedettes</SelectItem>
            <SelectItem value="new">Nouveautés</SelectItem>
            <SelectItem value="collection">Collection</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {content.source === 'collection' && (
        <div className="space-y-2">
          <Label>Collection</Label>
          <Select
            value={(content.collectionId as string) || ''}
            onValueChange={(value) => onUpdate({ collectionId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir" />
            </SelectTrigger>
            <SelectContent>
              {collections.map((col) => (
                <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex items-center justify-between">
        <Label>Lecture automatique</Label>
        <Switch
          checked={(content.autoplay as boolean) ?? true}
          onCheckedChange={(checked) => onUpdate({ autoplay: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Points de navigation</Label>
        <Switch
          checked={(content.showDots as boolean) ?? true}
          onCheckedChange={(checked) => onUpdate({ showDots: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Flèches de navigation</Label>
        <Switch
          checked={(content.showArrows as boolean) ?? true}
          onCheckedChange={(checked) => onUpdate({ showArrows: checked })}
        />
      </div>
    </div>
  )
}

function TestimonialsSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  const items = (content.items as Array<{ name: string; text: string; rating: number }>) || []

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Mise en page</Label>
        <Select
          value={(content.layout as string) || 'grid'}
          onValueChange={(value) => onUpdate({ layout: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grille</SelectItem>
            <SelectItem value="carousel">Carrousel</SelectItem>
            <SelectItem value="stack">Empilé</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Témoignages</Label>
        {items.map((item, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">#{index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newItems = items.filter((_, i) => i !== index)
                  onUpdate({ items: newItems })
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Nom"
              value={item.name}
              onChange={(e) => {
                const newItems = [...items]
                newItems[index] = { ...item, name: e.target.value }
                onUpdate({ items: newItems })
              }}
            />
            <textarea
              placeholder="Témoignage"
              value={item.text}
              onChange={(e) => {
                const newItems = [...items]
                newItems[index] = { ...item, text: e.target.value }
                onUpdate({ items: newItems })
              }}
              className="w-full px-3 py-2 border rounded-md text-sm"
              rows={2}
            />
            <Select
              value={String(item.rating)}
              onValueChange={(value) => {
                const newItems = [...items]
                newItems[index] = { ...item, rating: parseInt(value) }
                onUpdate({ items: newItems })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} étoiles</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdate({
            items: [...items, { name: '', text: '', rating: 5 }]
          })}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un témoignage
        </Button>
      </div>
    </div>
  )
}

function FAQSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  const items = (content.items as Array<{ question: string; answer: string }>) || []

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Questions</Label>
        {items.map((item, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">#{index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newItems = items.filter((_, i) => i !== index)
                  onUpdate({ items: newItems })
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Question"
              value={item.question}
              onChange={(e) => {
                const newItems = [...items]
                newItems[index] = { ...item, question: e.target.value }
                onUpdate({ items: newItems })
              }}
            />
            <textarea
              placeholder="Réponse"
              value={item.answer}
              onChange={(e) => {
                const newItems = [...items]
                newItems[index] = { ...item, answer: e.target.value }
                onUpdate({ items: newItems })
              }}
              className="w-full px-3 py-2 border rounded-md text-sm"
              rows={3}
            />
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdate({
            items: [...items, { question: '', answer: '' }]
          })}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une question
        </Button>
      </div>
    </div>
  )
}

function NewsletterSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <textarea
          value={(content.description as string) || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full px-3 py-2 border rounded-md text-sm"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Texte du bouton</Label>
        <Input
          value={(content.buttonText as string) || ''}
          onChange={(e) => onUpdate({ buttonText: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Couleur de fond</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={(content.backgroundColor as string) || '#000000'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="w-12 h-10 p-1"
          />
          <Input
            value={(content.backgroundColor as string) || ''}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

function ContactFormSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  const fields = (content.fields as string[]) || ['name', 'email', 'message']
  const availableFields = ['name', 'email', 'phone', 'subject', 'message', 'order']
  const fieldLabels: Record<string, string> = {
    name: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    subject: 'Sujet',
    message: 'Message',
    order: 'N° de commande'
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Champs du formulaire</Label>
        {availableFields.map((field) => (
          <div key={field} className="flex items-center justify-between">
            <span className="text-sm">{fieldLabels[field]}</span>
            <Switch
              checked={fields.includes(field)}
              onCheckedChange={(checked) => {
                const newFields = checked
                  ? [...fields, field]
                  : fields.filter(f => f !== field)
                onUpdate({ fields: newFields })
              }}
            />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Label>Texte du bouton</Label>
        <Input
          value={(content.submitText as string) || ''}
          onChange={(e) => onUpdate({ submitText: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Message de succès</Label>
        <Input
          value={(content.successMessage as string) || ''}
          onChange={(e) => onUpdate({ successMessage: e.target.value })}
        />
      </div>
    </div>
  )
}

function SpacerSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Hauteur ({(content.height as number) || 60}px)</Label>
        <Slider
          value={[(content.height as number) || 60]}
          onValueChange={([value]) => onUpdate({ height: value })}
          min={20}
          max={200}
          step={10}
        />
      </div>
    </div>
  )
}

function DividerSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Style</Label>
        <Select
          value={(content.style as string) || 'solid'}
          onValueChange={(value) => onUpdate({ style: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solide</SelectItem>
            <SelectItem value="dashed">Tirets</SelectItem>
            <SelectItem value="dotted">Points</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Couleur</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={(content.color as string) || '#e5e7eb'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-12 h-10 p-1"
          />
          <Input
            value={(content.color as string) || ''}
            onChange={(e) => onUpdate({ color: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Épaisseur ({(content.width as number) || 1}px)</Label>
        <Slider
          value={[(content.width as number) || 1]}
          onValueChange={([value]) => onUpdate({ width: value })}
          min={1}
          max={5}
          step={1}
        />
      </div>
    </div>
  )
}

function ColumnsSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nombre de colonnes</Label>
        <Select
          value={String((content.columns as number) || 2)}
          onValueChange={(value) => onUpdate({ columns: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2, 3, 4].map((n) => (
              <SelectItem key={n} value={String(n)}>{n} colonnes</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Espacement ({(content.gap as number) || 24}px)</Label>
        <Slider
          value={[(content.gap as number) || 24]}
          onValueChange={([value]) => onUpdate({ gap: value })}
          min={8}
          max={64}
          step={8}
        />
      </div>
    </div>
  )
}

// ========== NEW BLOCK SETTINGS ==========

interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  width?: string
}

function CustomFormSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  const fields = (content.fields as FormField[]) || []
  const fieldTypes = [
    { value: 'text', label: 'Texte' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Téléphone' },
    { value: 'number', label: 'Nombre' },
    { value: 'textarea', label: 'Zone de texte' },
    { value: 'select', label: 'Liste déroulante' },
    { value: 'checkbox', label: 'Cases à cocher' },
    { value: 'radio', label: 'Boutons radio' },
    { value: 'date', label: 'Date' },
    { value: 'file', label: 'Fichier' }
  ]

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'Nouveau champ',
      placeholder: '',
      required: false,
      width: 'full'
    }
    onUpdate({ fields: [...fields, newField] })
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    onUpdate({ fields: newFields })
  }

  const removeField = (index: number) => {
    onUpdate({ fields: fields.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <textarea
          value={(content.description as string) || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full px-3 py-2 border rounded-md text-sm"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Champs du formulaire</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-3 space-y-2 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Champ {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeField(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Label"
              value={field.label}
              onChange={(e) => updateField(index, { label: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={field.type}
                onValueChange={(value) => updateField(index, { type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={field.width || 'full'}
                onValueChange={(value) => updateField(index, { width: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Pleine largeur</SelectItem>
                  <SelectItem value="half">Demi-largeur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Placeholder"
              value={field.placeholder || ''}
              onChange={(e) => updateField(index, { placeholder: e.target.value })}
            />
            {['select', 'checkbox', 'radio'].includes(field.type) && (
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Options (une par ligne)</label>
                <textarea
                  value={(field.options || []).join('\n')}
                  onChange={(e) => updateField(index, { options: e.target.value.split('\n').filter(Boolean) })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  rows={3}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm">Obligatoire</span>
              <Switch
                checked={field.required || false}
                onCheckedChange={(checked) => updateField(index, { required: checked })}
              />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addField} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un champ
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Texte du bouton</Label>
        <Input
          value={(content.submitText as string) || ''}
          onChange={(e) => onUpdate({ submitText: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Message de succès</Label>
        <Input
          value={(content.successMessage as string) || ''}
          onChange={(e) => onUpdate({ successMessage: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Couleur du bouton</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={(content.buttonColor as string) || '#000000'}
            onChange={(e) => onUpdate({ buttonColor: e.target.value })}
            className="w-12 h-10 p-1"
          />
          <Input
            value={(content.buttonColor as string) || ''}
            onChange={(e) => onUpdate({ buttonColor: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

function ButtonSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Texte</Label>
        <Input
          value={(content.text as string) || ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Lien</Label>
        <Input
          value={(content.link as string) || ''}
          onChange={(e) => onUpdate({ link: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div className="space-y-2">
        <Label>Style</Label>
        <Select
          value={(content.style as string) || 'solid'}
          onValueChange={(value) => onUpdate({ style: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Plein</SelectItem>
            <SelectItem value="outline">Contour</SelectItem>
            <SelectItem value="ghost">Transparent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Taille</Label>
        <Select
          value={(content.size as string) || 'medium'}
          onValueChange={(value) => onUpdate({ size: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Petit</SelectItem>
            <SelectItem value="medium">Moyen</SelectItem>
            <SelectItem value="large">Grand</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Alignement</Label>
        <Select
          value={(content.alignment as string) || 'center'}
          onValueChange={(value) => onUpdate({ alignment: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Gauche</SelectItem>
            <SelectItem value="center">Centre</SelectItem>
            <SelectItem value="right">Droite</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label>Pleine largeur</Label>
        <Switch
          checked={(content.fullWidth as boolean) || false}
          onCheckedChange={(checked) => onUpdate({ fullWidth: checked })}
        />
      </div>
      <div className="space-y-2">
        <Label>Couleur de fond</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={(content.backgroundColor as string) || '#000000'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="w-12 h-10 p-1"
          />
          <Input
            value={(content.backgroundColor as string) || ''}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Couleur du texte</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={(content.textColor as string) || '#ffffff'}
            onChange={(e) => onUpdate({ textColor: e.target.value })}
            className="w-12 h-10 p-1"
          />
          <Input
            value={(content.textColor as string) || ''}
            onChange={(e) => onUpdate({ textColor: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Arrondi ({(content.borderRadius as number) || 8}px)</Label>
        <Slider
          value={[(content.borderRadius as number) || 8]}
          onValueChange={([value]) => onUpdate({ borderRadius: value })}
          min={0}
          max={50}
          step={2}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Ouvrir dans un nouvel onglet</Label>
        <Switch
          checked={(content.openInNewTab as boolean) || false}
          onCheckedChange={(checked) => onUpdate({ openInNewTab: checked })}
        />
      </div>
    </div>
  )
}

function AccordionTabsSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  const items = (content.items as Array<{ title: string; content: string }>) || []

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titre (optionnel)</Label>
        <Input
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Mode</Label>
        <Select
          value={(content.mode as string) || 'accordion'}
          onValueChange={(value) => onUpdate({ mode: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="accordion">Accordéon</SelectItem>
            <SelectItem value="tabs">Onglets</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {content.mode === 'accordion' && (
        <div className="flex items-center justify-between">
          <Label>Ouvrir plusieurs à la fois</Label>
          <Switch
            checked={(content.allowMultiple as boolean) || false}
            onCheckedChange={(checked) => onUpdate({ allowMultiple: checked })}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label>Éléments</Label>
        {items.map((item, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">#{index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdate({ items: items.filter((_, i) => i !== index) })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Titre"
              value={item.title}
              onChange={(e) => {
                const newItems = [...items]
                newItems[index] = { ...item, title: e.target.value }
                onUpdate({ items: newItems })
              }}
            />
            <textarea
              placeholder="Contenu (HTML supporté)"
              value={item.content}
              onChange={(e) => {
                const newItems = [...items]
                newItems[index] = { ...item, content: e.target.value }
                onUpdate({ items: newItems })
              }}
              className="w-full px-3 py-2 border rounded-md text-sm"
              rows={3}
            />
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdate({ items: [...items, { title: '', content: '' }] })}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un élément
        </Button>
      </div>
    </div>
  )
}

function FeaturesSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  const items = (content.items as Array<{ icon: string; title: string; description: string }>) || []
  const icons = ['truck', 'shield', 'creditCard', 'headphones', 'gift', 'clock', 'star', 'heart', 'zap', 'award', 'check', 'package']

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Sous-titre</Label>
        <Input
          value={(content.subtitle as string) || ''}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Mise en page</Label>
        <Select
          value={(content.layout as string) || 'cards'}
          onValueChange={(value) => onUpdate({ layout: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cards">Cartes</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="centered">Centré</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Colonnes</Label>
        <Select
          value={String((content.columns as number) || 3)}
          onValueChange={(value) => onUpdate({ columns: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2, 3, 4].map((n) => (
              <SelectItem key={n} value={String(n)}>{n} colonnes</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Couleur des icônes</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={(content.iconColor as string) || '#000000'}
            onChange={(e) => onUpdate({ iconColor: e.target.value })}
            className="w-12 h-10 p-1"
          />
          <Input
            value={(content.iconColor as string) || ''}
            onChange={(e) => onUpdate({ iconColor: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Fonctionnalités</Label>
        {items.map((item, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">#{index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdate({ items: items.filter((_, i) => i !== index) })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Select
              value={item.icon}
              onValueChange={(value) => {
                const newItems = [...items]
                newItems[index] = { ...item, icon: value }
                onUpdate({ items: newItems })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Icône" />
              </SelectTrigger>
              <SelectContent>
                {icons.map((icon) => (
                  <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Titre"
              value={item.title}
              onChange={(e) => {
                const newItems = [...items]
                newItems[index] = { ...item, title: e.target.value }
                onUpdate({ items: newItems })
              }}
            />
            <textarea
              placeholder="Description"
              value={item.description}
              onChange={(e) => {
                const newItems = [...items]
                newItems[index] = { ...item, description: e.target.value }
                onUpdate({ items: newItems })
              }}
              className="w-full px-3 py-2 border rounded-md text-sm"
              rows={2}
            />
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdate({ items: [...items, { icon: 'check', title: '', description: '' }] })}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une fonctionnalité
        </Button>
      </div>
    </div>
  )
}

function SocialLinksSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  const links = (content.links as Array<{ platform: string; url: string }>) || []
  const platforms = ['facebook', 'instagram', 'twitter', 'x', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'whatsapp', 'telegram', 'snapchat', 'discord']

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titre (optionnel)</Label>
        <Input
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Style</Label>
        <Select
          value={(content.style as string) || 'icons'}
          onValueChange={(value) => onUpdate({ style: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="icons">Icônes</SelectItem>
            <SelectItem value="buttons">Boutons</SelectItem>
            <SelectItem value="pills">Pilules</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Taille</Label>
        <Select
          value={(content.size as string) || 'medium'}
          onValueChange={(value) => onUpdate({ size: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Petit</SelectItem>
            <SelectItem value="medium">Moyen</SelectItem>
            <SelectItem value="large">Grand</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Alignement</Label>
        <Select
          value={(content.alignment as string) || 'center'}
          onValueChange={(value) => onUpdate({ alignment: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Gauche</SelectItem>
            <SelectItem value="center">Centre</SelectItem>
            <SelectItem value="right">Droite</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Couleur</Label>
        <Select
          value={(content.color as string) || 'brand'}
          onValueChange={(value) => onUpdate({ color: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="brand">Couleurs de marque</SelectItem>
            <SelectItem value="dark">Sombre</SelectItem>
            <SelectItem value="light">Clair</SelectItem>
            <SelectItem value="custom">Personnalisé</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {content.color === 'custom' && (
        <div className="space-y-2">
          <Label>Couleur personnalisée</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={(content.customColor as string) || '#000000'}
              onChange={(e) => onUpdate({ customColor: e.target.value })}
              className="w-12 h-10 p-1"
            />
            <Input
              value={(content.customColor as string) || ''}
              onChange={(e) => onUpdate({ customColor: e.target.value })}
            />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label>Liens</Label>
        {links.map((link, index) => (
          <div key={index} className="flex gap-2">
            <Select
              value={link.platform}
              onValueChange={(value) => {
                const newLinks = [...links]
                newLinks[index] = { ...link, platform: value }
                onUpdate({ links: newLinks })
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="URL"
              value={link.url}
              onChange={(e) => {
                const newLinks = [...links]
                newLinks[index] = { ...link, url: e.target.value }
                onUpdate({ links: newLinks })
              }}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdate({ links: links.filter((_, i) => i !== index) })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdate({ links: [...links, { platform: 'instagram', url: '' }] })}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un lien
        </Button>
      </div>
    </div>
  )
}

function MapSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titre (optionnel)</Label>
        <Input
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Adresse</Label>
        <textarea
          value={(content.address as string) || ''}
          onChange={(e) => onUpdate({ address: e.target.value })}
          className="w-full px-3 py-2 border rounded-md text-sm"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>Latitude</Label>
          <Input
            type="number"
            step="0.0001"
            value={(content.latitude as number) || 48.8566}
            onChange={(e) => onUpdate({ latitude: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Longitude</Label>
          <Input
            type="number"
            step="0.0001"
            value={(content.longitude as number) || 2.3522}
            onChange={(e) => onUpdate({ longitude: parseFloat(e.target.value) })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Hauteur ({(content.height as number) || 400}px)</Label>
        <Slider
          value={[(content.height as number) || 400]}
          onValueChange={([value]) => onUpdate({ height: value })}
          min={200}
          max={600}
          step={50}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Afficher le marqueur</Label>
        <Switch
          checked={(content.showMarker as boolean) ?? true}
          onCheckedChange={(checked) => onUpdate({ showMarker: checked })}
        />
      </div>
    </div>
  )
}

function CounterSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  const items = (content.items as Array<{ value: number; suffix?: string; prefix?: string; label: string }>) || []

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Style</Label>
        <Select
          value={(content.style as string) || 'default'}
          onValueChange={(value) => onUpdate({ style: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Par défaut</SelectItem>
            <SelectItem value="cards">Cartes</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Colonnes</Label>
        <Select
          value={String((content.columns as number) || 4)}
          onValueChange={(value) => onUpdate({ columns: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2, 3, 4].map((n) => (
              <SelectItem key={n} value={String(n)}>{n} colonnes</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Couleur des valeurs</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={(content.valueColor as string) || '#000000'}
            onChange={(e) => onUpdate({ valueColor: e.target.value })}
            className="w-12 h-10 p-1"
          />
          <Input
            value={(content.valueColor as string) || ''}
            onChange={(e) => onUpdate({ valueColor: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Compteurs</Label>
        {items.map((item, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">#{index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdate({ items: items.filter((_, i) => i !== index) })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="text"
                placeholder="Préfixe"
                value={item.prefix || ''}
                onChange={(e) => {
                  const newItems = [...items]
                  newItems[index] = { ...item, prefix: e.target.value }
                  onUpdate({ items: newItems })
                }}
              />
              <Input
                type="number"
                placeholder="Valeur"
                value={item.value}
                onChange={(e) => {
                  const newItems = [...items]
                  newItems[index] = { ...item, value: parseInt(e.target.value) || 0 }
                  onUpdate({ items: newItems })
                }}
              />
              <Input
                type="text"
                placeholder="Suffixe"
                value={item.suffix || ''}
                onChange={(e) => {
                  const newItems = [...items]
                  newItems[index] = { ...item, suffix: e.target.value }
                  onUpdate({ items: newItems })
                }}
              />
            </div>
            <Input
              placeholder="Label"
              value={item.label}
              onChange={(e) => {
                const newItems = [...items]
                newItems[index] = { ...item, label: e.target.value }
                onUpdate({ items: newItems })
              }}
            />
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdate({ items: [...items, { value: 0, label: '' }] })}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un compteur
        </Button>
      </div>
    </div>
  )
}

function PricingSettings({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (u: Record<string, unknown>) => void }) {
  const plans = (content.plans as Array<{
    name: string
    description?: string
    price: number
    currency?: string
    period?: string
    features: string[]
    buttonText?: string
    buttonLink?: string
    highlighted?: boolean
    badge?: string
  }>) || []

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Sous-titre</Label>
        <Input
          value={(content.subtitle as string) || ''}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Style</Label>
        <Select
          value={(content.style as string) || 'cards'}
          onValueChange={(value) => onUpdate({ style: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cards">Cartes</SelectItem>
            <SelectItem value="bordered">Bordures</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Colonnes</Label>
        <Select
          value={String((content.columns as number) || 3)}
          onValueChange={(value) => onUpdate({ columns: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2, 3, 4].map((n) => (
              <SelectItem key={n} value={String(n)}>{n} colonnes</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Formules</Label>
        {plans.map((plan, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Formule {index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdate({ plans: plans.filter((_, i) => i !== index) })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Nom"
              value={plan.name}
              onChange={(e) => {
                const newPlans = [...plans]
                newPlans[index] = { ...plan, name: e.target.value }
                onUpdate({ plans: newPlans })
              }}
            />
            <Input
              placeholder="Description"
              value={plan.description || ''}
              onChange={(e) => {
                const newPlans = [...plans]
                newPlans[index] = { ...plan, description: e.target.value }
                onUpdate({ plans: newPlans })
              }}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Devise"
                value={plan.currency || '€'}
                onChange={(e) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, currency: e.target.value }
                  onUpdate({ plans: newPlans })
                }}
              />
              <Input
                type="number"
                placeholder="Prix"
                value={plan.price}
                onChange={(e) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, price: parseFloat(e.target.value) || 0 }
                  onUpdate({ plans: newPlans })
                }}
              />
              <Input
                placeholder="Période"
                value={plan.period || ''}
                onChange={(e) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, period: e.target.value }
                  onUpdate({ plans: newPlans })
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Fonctionnalités (une par ligne)</label>
              <textarea
                value={plan.features.join('\n')}
                onChange={(e) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, features: e.target.value.split('\n').filter(Boolean) }
                  onUpdate({ plans: newPlans })
                }}
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Texte du bouton"
                value={plan.buttonText || ''}
                onChange={(e) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, buttonText: e.target.value }
                  onUpdate({ plans: newPlans })
                }}
              />
              <Input
                placeholder="Badge"
                value={plan.badge || ''}
                onChange={(e) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, badge: e.target.value }
                  onUpdate({ plans: newPlans })
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Mise en avant</span>
              <Switch
                checked={plan.highlighted || false}
                onCheckedChange={(checked) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, highlighted: checked }
                  onUpdate({ plans: newPlans })
                }}
              />
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdate({
            plans: [...plans, {
              name: '',
              price: 0,
              features: [],
              highlighted: false
            }]
          })}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une formule
        </Button>
      </div>
    </div>
  )
}
