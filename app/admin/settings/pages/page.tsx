'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Edit,
  Eye,
  Save,
  Image,
  Type,
  Link as LinkIcon,
  Plus,
  Trash2,
  GripVertical,
  Loader2
} from 'lucide-react'
import { getPages, savePage, deletePage, PageContentData, PageSection } from '@/app/actions/admin/pages'
import { toast } from 'sonner'
import {
  DndContext,
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
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const sectionTypes = [
  { type: 'hero', label: 'Hero Banner', icon: Image },
  { type: 'text', label: 'Texte', icon: Type },
  { type: 'image', label: 'Image', icon: Image },
  { type: 'cta', label: 'Call to Action', icon: LinkIcon },
  { type: 'products', label: 'Produits', icon: FileText },
  { type: 'gallery', label: 'Galerie', icon: Image },
  { type: 'faq', label: 'FAQ', icon: FileText },
  { type: 'newsletter', label: 'Newsletter', icon: LinkIcon },
  { type: 'stats', label: 'Statistiques', icon: FileText },
  { type: 'team', label: 'Équipe', icon: FileText },
  { type: 'contact', label: 'Contact', icon: FileText },
  { type: 'video', label: 'Vidéo', icon: Image },
  { type: 'spacer', label: 'Espacement', icon: Type },
  { type: 'divider', label: 'Séparateur', icon: Type },
]

// Composant pour une section draggable
function SortableSection({
  section,
  editingSection,
  setEditingSection,
  handleRemoveSection,
  handleUpdateSection,
  renderSectionEditor
}: {
  section: PageSection
  editingSection: string | null
  setEditingSection: (id: string | null) => void
  handleRemoveSection: (id: string) => void
  handleUpdateSection: (id: string, content: Record<string, any>) => void
  renderSectionEditor: (section: PageSection) => React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const sectionTypes = [
    { type: 'hero', label: 'Hero Banner', icon: Image },
    { type: 'text', label: 'Texte', icon: Type },
    { type: 'image', label: 'Image', icon: Image },
    { type: 'cta', label: 'Call to Action', icon: LinkIcon },
    { type: 'products', label: 'Produits', icon: FileText },
    { type: 'gallery', label: 'Galerie', icon: Image },
    { type: 'faq', label: 'FAQ', icon: FileText },
    { type: 'newsletter', label: 'Newsletter', icon: LinkIcon },
    { type: 'stats', label: 'Statistiques', icon: FileText },
    { type: 'team', label: 'Équipe', icon: FileText },
    { type: 'contact', label: 'Contact', icon: FileText },
    { type: 'video', label: 'Vidéo', icon: Image },
    { type: 'spacer', label: 'Espacement', icon: Type },
    { type: 'divider', label: 'Séparateur', icon: Type },
  ]

  const sectionType = sectionTypes.find(t => t.type === section.type)
  const Icon = sectionType?.icon || FileText

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg bg-white">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <Icon className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-sm">
            {sectionType?.label || section.type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setEditingSection(
              editingSection === section.id ? null : section.id
            )}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500"
            onClick={() => handleRemoveSection(section.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {editingSection === section.id ? (
        renderSectionEditor(section)
      ) : (
        <div className="p-4">
          <p className="font-medium">{section.content.title || 'Sans titre'}</p>
          {section.content.subtitle && (
            <p className="text-sm text-muted-foreground">{section.content.subtitle}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function PagesPage() {
  const [pages, setPages] = useState<PageContentData[]>([])
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Local state for the page being edited
  const [currentPage, setCurrentPage] = useState<PageContentData | null>(null)

  // Sensors pour le drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadPages()
  }, [])

  useEffect(() => {
    if (selectedPageSlug) {
      const page = pages.find(p => p.slug === selectedPageSlug)
      setCurrentPage(page ? JSON.parse(JSON.stringify(page)) : null) // Deep copy
    } else {
      setCurrentPage(null)
    }
  }, [selectedPageSlug, pages])

  async function loadPages() {
    setLoading(true)
    try {
      // @ts-ignore - Types mismatch between Prisma return and PageContentData
      const data = await getPages()
      setPages(data as unknown as PageContentData[])
      if (data.length > 0 && !selectedPageSlug) {
        setSelectedPageSlug(data[0].slug)
      }
    } catch (error) {
      console.error('Failed to load pages', error)
      toast.error('Erreur lors du chargement des pages')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentPage) return
    setSaving(true)
    try {
      await savePage(currentPage)
      toast.success('Page enregistrée avec succès')
      await loadPages()
    } catch (error) {
      console.error('Failed to save page', error)
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const handleAddSection = (type: string) => {
    if (!currentPage) return
    const newSection: PageSection = {
      id: Math.random().toString(36).substr(2, 9),
      type: type as any,
      content: { title: 'Nouvelle section' }
    }
    setCurrentPage({
      ...currentPage,
      sections: [...currentPage.sections, newSection]
    })
    setEditingSection(newSection.id)
  }

  const handleRemoveSection = (sectionId: string) => {
    if (!currentPage) return
    setCurrentPage({
      ...currentPage,
      sections: currentPage.sections.filter(s => s.id !== sectionId)
    })
  }

  const handleUpdateSection = (sectionId: string, content: Record<string, any>) => {
    if (!currentPage) return
    setCurrentPage({
      ...currentPage,
      sections: currentPage.sections.map(s =>
        s.id === sectionId ? { ...s, content: { ...s.content, ...content } } : s
      )
    })
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id && currentPage) {
      const oldIndex = currentPage.sections.findIndex(s => s.id === active.id)
      const newIndex = currentPage.sections.findIndex(s => s.id === over.id)

      setCurrentPage({
        ...currentPage,
        sections: arrayMove(currentPage.sections, oldIndex, newIndex)
      })
    }
  }

  const renderSectionEditor = (section: PageSection) => {
    // Helper to update specific field
    const updateField = (key: string, value: string) => {
      handleUpdateSection(section.id, { [key]: value })
    }

    return (
      <div className="space-y-3 p-4 bg-gray-50 rounded-md">
        {section.type === 'hero' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500">Titre</label>
              <Input 
                value={section.content.title || ''} 
                onChange={e => updateField('title', e.target.value)}
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Sous-titre</label>
              <Input 
                value={section.content.subtitle || ''} 
                onChange={e => updateField('subtitle', e.target.value)}
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Image URL</label>
              <Input 
                value={section.content.image || ''} 
                onChange={e => updateField('image', e.target.value)}
                className="mt-1" 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-500">Texte bouton</label>
                <Input 
                  value={section.content.ctaText || ''} 
                  onChange={e => updateField('ctaText', e.target.value)}
                  className="mt-1" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Lien bouton</label>
                <Input 
                  value={section.content.ctaLink || ''} 
                  onChange={e => updateField('ctaLink', e.target.value)}
                  className="mt-1" 
                />
              </div>
            </div>
          </>
        )}
        {section.type === 'text' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500">Titre</label>
              <Input
                value={section.content.title || ''}
                onChange={e => updateField('title', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Contenu</label>
              <textarea
                value={section.content.text || ''}
                onChange={e => updateField('text', e.target.value)}
                className="w-full mt-1 p-2 border rounded-md text-sm"
                rows={4}
              />
            </div>
          </>
        )}
        {section.type === 'image' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500">URL de l'image</label>
              <Input
                value={section.content.src || ''}
                onChange={e => updateField('src', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Texte alternatif</label>
              <Input
                value={section.content.alt || ''}
                onChange={e => updateField('alt', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Légende (optionnel)</label>
              <Input
                value={section.content.caption || ''}
                onChange={e => updateField('caption', e.target.value)}
                className="mt-1"
              />
            </div>
          </>
        )}
        {section.type === 'cta' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500">Titre</label>
              <Input
                value={section.content.title || ''}
                onChange={e => updateField('title', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Description</label>
              <textarea
                value={section.content.description || ''}
                onChange={e => updateField('description', e.target.value)}
                className="w-full mt-1 p-2 border rounded-md text-sm"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-500">Texte du bouton</label>
                <Input
                  value={section.content.buttonText || ''}
                  onChange={e => updateField('buttonText', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Lien</label>
                <Input
                  value={section.content.buttonLink || ''}
                  onChange={e => updateField('buttonLink', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </>
        )}
        {section.type === 'gallery' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500">Titre</label>
              <Input
                value={section.content.title || ''}
                onChange={e => updateField('title', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Images (une URL par ligne)</label>
              <textarea
                value={section.content.images || ''}
                onChange={e => updateField('images', e.target.value)}
                className="w-full mt-1 p-2 border rounded-md text-sm"
                rows={4}
                placeholder="https://..."
              />
            </div>
          </>
        )}
        {section.type === 'faq' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500">Titre</label>
              <Input
                value={section.content.title || ''}
                onChange={e => updateField('title', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Questions/Réponses (format: Question|Réponse, une par ligne)</label>
              <textarea
                value={section.content.items || ''}
                onChange={e => updateField('items', e.target.value)}
                className="w-full mt-1 p-2 border rounded-md text-sm"
                rows={6}
                placeholder="Quelle est votre politique de retour ?|Nous acceptons les retours sous 30 jours..."
              />
            </div>
          </>
        )}
        {section.type === 'newsletter' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500">Titre</label>
              <Input
                value={section.content.title || ''}
                onChange={e => updateField('title', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Description</label>
              <Input
                value={section.content.description || ''}
                onChange={e => updateField('description', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Placeholder email</label>
              <Input
                value={section.content.placeholder || 'Votre adresse email'}
                onChange={e => updateField('placeholder', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Texte du bouton</label>
              <Input
                value={section.content.buttonText || 'S\'inscrire'}
                onChange={e => updateField('buttonText', e.target.value)}
                className="mt-1"
              />
            </div>
          </>
        )}
        {section.type === 'stats' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500">Titre</label>
              <Input
                value={section.content.title || ''}
                onChange={e => updateField('title', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Statistiques (format: Nombre|Label, une par ligne)</label>
              <textarea
                value={section.content.stats || ''}
                onChange={e => updateField('stats', e.target.value)}
                className="w-full mt-1 p-2 border rounded-md text-sm"
                rows={4}
                placeholder="1000+|Clients satisfaits"
              />
            </div>
          </>
        )}
        {section.type === 'video' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500">URL de la vidéo</label>
              <Input
                value={section.content.src || ''}
                onChange={e => updateField('src', e.target.value)}
                className="mt-1"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Image de couverture</label>
              <Input
                value={section.content.poster || ''}
                onChange={e => updateField('poster', e.target.value)}
                className="mt-1"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Titre (optionnel)</label>
              <Input
                value={section.content.title || ''}
                onChange={e => updateField('title', e.target.value)}
                className="mt-1"
              />
            </div>
          </>
        )}
        {section.type === 'spacer' && (
          <div>
            <label className="text-xs font-medium text-gray-500">Hauteur (px)</label>
            <Input
              type="number"
              value={section.content.height || '50'}
              onChange={e => updateField('height', e.target.value)}
              className="mt-1"
              min="10"
              max="200"
            />
          </div>
        )}
        {section.type === 'divider' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500">Style</label>
              <select
                value={section.content.style || 'line'}
                onChange={e => updateField('style', e.target.value)}
                className="w-full mt-1 p-2 border rounded-md text-sm"
              >
                <option value="line">Ligne simple</option>
                <option value="dashed">Ligne pointillée</option>
                <option value="dotted">Ligne ponctuée</option>
                <option value="double">Ligne double</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Couleur</label>
              <Input
                type="color"
                value={section.content.color || '#e5e7eb'}
                onChange={e => updateField('color', e.target.value)}
                className="mt-1"
              />
            </div>
          </>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button size="sm" onClick={() => setEditingSection(null)}>
            <Save className="h-3 w-3 mr-1" />
            Terminer
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pages & Contenu</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Liste des pages */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Pages</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-1">
              {pages.map((page) => (
                <button
                  key={page.slug}
                  className={`w-full flex items-center justify-between p-3 rounded-md text-left transition-colors ${
                    selectedPageSlug === page.slug
                      ? 'bg-gray-100 text-gray-900'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                  onClick={() => setSelectedPageSlug(page.slug)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{page.title}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={page.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100'}
                  >
                    {page.isPublished ? 'Publié' : 'Brouillon'}
                  </Badge>
                </button>
              ))}
              {pages.length === 0 && (
                <p className="text-sm text-muted-foreground p-2">Aucune page trouvée.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Éditeur de page */}
        <div className="lg:col-span-3 space-y-6">
          {currentPage ? (
            <>
              {/* Métadonnées */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Paramètres de la page</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Titre de la page</label>
                      <Input 
                        value={currentPage.title} 
                        onChange={e => setCurrentPage({ ...currentPage, title: e.target.value })}
                        className="mt-1" 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Slug (URL)</label>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm text-muted-foreground">/</span>
                        <Input 
                          value={currentPage.slug} 
                          disabled // Slug editing disabled for now to prevent issues
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Titre SEO (meta title)</label>
                    <Input 
                      value={currentPage.metaTitle || ''} 
                      onChange={e => setCurrentPage({ ...currentPage, metaTitle: e.target.value })}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description SEO (meta description)</label>
                    <textarea
                      value={currentPage.metaDescription || ''}
                      onChange={e => setCurrentPage({ ...currentPage, metaDescription: e.target.value })}
                      className="w-full mt-1 p-2 border rounded-md text-sm"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sections */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Contenu de la page</CardTitle>
                    <div className="flex gap-2">
                      {sectionTypes.map(type => (
                        <Button 
                          key={type.type} 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAddSection(type.type)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentPage.sections.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={currentPage.sections.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {currentPage.sections.map((section) => (
                            <SortableSection
                              key={section.id}
                              section={section}
                              editingSection={editingSection}
                              setEditingSection={setEditingSection}
                              handleRemoveSection={handleRemoveSection}
                              handleUpdateSection={handleUpdateSection}
                              renderSectionEditor={renderSectionEditor}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Cette page n'a pas encore de contenu
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-muted-foreground">
                  Sélectionnez une page à modifier
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
