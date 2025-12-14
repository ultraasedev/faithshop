'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  Loader2,
  Monitor,
  Settings,
  Layout,
  Globe,
  Smartphone,
  Search,
  ChevronDown,
  ArrowRight
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const sectionTypes = [
  { type: 'hero', label: 'Hero Banner', icon: Image, category: 'Bannières' },
  { type: 'text', label: 'Texte', icon: Type, category: 'Contenu' },
  { type: 'image', label: 'Image', icon: Image, category: 'Média' },
  { type: 'cta', label: 'Call to Action', icon: LinkIcon, category: 'Interaction' },
  { type: 'products', label: 'Produits', icon: FileText, category: 'Commerce' },
  { type: 'gallery', label: 'Galerie', icon: Image, category: 'Média' },
  { type: 'faq', label: 'FAQ', icon: FileText, category: 'Contenu' },
  { type: 'newsletter', label: 'Newsletter', icon: LinkIcon, category: 'Interaction' },
  { type: 'stats', label: 'Statistiques', icon: FileText, category: 'Contenu' },
  { type: 'team', label: 'Équipe', icon: FileText, category: 'Contenu' },
  { type: 'contact', label: 'Contact', icon: FileText, category: 'Interaction' },
  { type: 'video', label: 'Vidéo', icon: Image, category: 'Média' },
  { type: 'spacer', label: 'Espacement', icon: Type, category: 'Structure' },
  { type: 'divider', label: 'Séparateur', icon: Type, category: 'Structure' },
]

const sectionCategories = [
  'Bannières',
  'Contenu',
  'Média',
  'Commerce',
  'Interaction',
  'Structure'
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
    <div ref={setNodeRef} style={style} className="border rounded-lg bg-card shadow-sm">
      <div className="flex items-center justify-between p-4 border-b bg-muted/50 dark:bg-muted/20">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm text-foreground">
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
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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
          <p className="font-medium text-foreground">{section.content.title || 'Sans titre'}</p>
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
      const data = await getPages()
      setPages(data)
      if (data.length > 0 && !selectedPageSlug) {
        setSelectedPageSlug(data[0].slug)
      }
    } catch (error) {
      console.error('Failed to load pages', error)
      toast.error('Erreur lors du chargement des pages')
      // Set empty array on error to avoid infinite loading
      setPages([])
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
      <div className="space-y-4 p-4 bg-muted/30 dark:bg-muted/10 border-t">
        {section.type === 'hero' && (
          <>
            <div className="space-y-2">
              <Label htmlFor={`${section.id}-title`} className="text-xs font-medium text-muted-foreground">
                Titre
              </Label>
              <Input
                id={`${section.id}-title`}
                value={section.content.title || ''}
                onChange={e => updateField('title', e.target.value)}
                placeholder="Votre titre principal"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${section.id}-subtitle`} className="text-xs font-medium text-muted-foreground">
                Sous-titre
              </Label>
              <Input
                id={`${section.id}-subtitle`}
                value={section.content.subtitle || ''}
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder="Description ou sous-titre"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${section.id}-image`} className="text-xs font-medium text-muted-foreground">
                Image URL
              </Label>
              <Input
                id={`${section.id}-image`}
                value={section.content.image || ''}
                onChange={e => updateField('image', e.target.value)}
                placeholder="https://..."
                className="bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${section.id}-cta-text`} className="text-xs font-medium text-muted-foreground">
                  Texte bouton
                </Label>
                <Input
                  id={`${section.id}-cta-text`}
                  value={section.content.ctaText || ''}
                  onChange={e => updateField('ctaText', e.target.value)}
                  placeholder="Découvrir"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${section.id}-cta-link`} className="text-xs font-medium text-muted-foreground">
                  Lien bouton
                </Label>
                <Input
                  id={`${section.id}-cta-link`}
                  value={section.content.ctaLink || ''}
                  onChange={e => updateField('ctaLink', e.target.value)}
                  placeholder="/shop"
                  className="bg-background"
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Personnalisation</h1>
          <p className="text-muted-foreground">Gérez le contenu et l'apparence de votre boutique</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Monitor className="h-4 w-4 mr-2" />
            Prévisualiser
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger
            value="pages"
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            <Layout className="h-4 w-4" />
            <span className="hidden sm:inline">Pages</span>
          </TabsTrigger>
          <TabsTrigger
            value="theme"
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Thème</span>
          </TabsTrigger>
          <TabsTrigger
            value="navigation"
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Navigation</span>
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Liste des pages */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Pages
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 p-2">
                  {pages.map((page) => (
                    <button
                      key={page.slug}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all hover:shadow-sm ${
                        selectedPageSlug === page.slug
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setSelectedPageSlug(page.slug)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          page.isPublished ? 'bg-green-500' : 'bg-muted-foreground'
                        }`} />
                        <span className="text-sm font-medium">{page.title}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-50" />
                    </button>
                  ))}
                  {pages.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">Aucune page trouvée</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Éditeur de page */}
            <div className="lg:col-span-3 space-y-6">
              {currentPage ? (
                <>
                  {/* Page Header avec actions */}
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              currentPage.isPublished ? 'bg-green-500' : 'bg-yellow-500'
                            }`} />
                            <CardTitle className="text-xl">{currentPage.title}</CardTitle>
                          </div>
                          <Badge variant={currentPage.isPublished ? 'default' : 'secondary'}>
                            {currentPage.isPublished ? 'Publié' : 'Brouillon'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Aperçu
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saving}
                          >
                            {saving ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Enregistrer
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Paramètres de la page */}
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Paramètres de la page</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="page-title">Titre de la page</Label>
                            <Input
                              id="page-title"
                              value={currentPage.title}
                              onChange={e => setCurrentPage({ ...currentPage, title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="page-slug">URL</Label>
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-muted-foreground px-3 py-2 bg-muted rounded-l border border-r-0">
                                /{currentPage.slug === 'home' ? '' : currentPage.slug}
                              </span>
                              <Input
                                id="page-slug"
                                value=""
                                disabled
                                className="bg-muted border-l-0 rounded-l-none"
                                placeholder="URL automatique"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Page visible</Label>
                              <div className="text-sm text-muted-foreground">
                                Publier cette page sur le site
                              </div>
                            </div>
                            <Switch
                              checked={currentPage.isPublished}
                              onCheckedChange={(checked) =>
                                setCurrentPage({ ...currentPage, isPublished: checked })
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">SEO</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="meta-title">Titre SEO</Label>
                            <Input
                              id="meta-title"
                              value={currentPage.metaTitle || ''}
                              onChange={e => setCurrentPage({ ...currentPage, metaTitle: e.target.value })}
                              placeholder="Titre pour les moteurs de recherche"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="meta-description">Description SEO</Label>
                            <Textarea
                              id="meta-description"
                              value={currentPage.metaDescription || ''}
                              onChange={e => setCurrentPage({ ...currentPage, metaDescription: e.target.value })}
                              placeholder="Description pour les moteurs de recherche"
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Éditeur de contenu */}
                    <div className="lg:col-span-2 space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Contenu de la page</CardTitle>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Ajouter section
                                  <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                {sectionCategories.map(category => (
                                  <div key={category} className="px-2 py-1.5">
                                    <div className="text-xs font-semibold text-muted-foreground mb-1">
                                      {category}
                                    </div>
                                    {sectionTypes
                                      .filter(type => type.category === category)
                                      .map(type => (
                                        <DropdownMenuItem
                                          key={type.type}
                                          onClick={() => handleAddSection(type.type)}
                                          className="flex items-center gap-2 py-2"
                                        >
                                          <type.icon className="h-4 w-4" />
                                          {type.label}
                                        </DropdownMenuItem>
                                      ))
                                    }
                                  </div>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                            <div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                              <Layout className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                              <p className="text-muted-foreground mb-4 font-medium">
                                Cette page n'a pas encore de contenu
                              </p>
                              <p className="text-sm text-muted-foreground mb-4">
                                Ajoutez des sections pour créer le contenu de votre page
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddSection('hero')}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter une section Hero
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune page sélectionnée</h3>
                    <p className="text-muted-foreground">
                      Sélectionnez une page dans la liste de gauche pour commencer à modifier son contenu
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Placeholder tabs pour les futures fonctionnalités */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardContent className="py-16 text-center">
              <Settings className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Paramètres du thème</h3>
              <p className="text-muted-foreground">
                Personnalisez les couleurs, polices et style général de votre boutique
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <Card>
            <CardContent className="py-16 text-center">
              <Globe className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Navigation</h3>
              <p className="text-muted-foreground">
                Gérez les menus et la navigation de votre boutique
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardContent className="py-16 text-center">
              <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Paramètres SEO</h3>
              <p className="text-muted-foreground">
                Optimisez votre référencement naturel et vos métadonnées
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
