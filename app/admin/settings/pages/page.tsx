'use client'

import { useState } from 'react'
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
  GripVertical
} from 'lucide-react'

interface PageSection {
  id: string
  type: 'hero' | 'text' | 'image' | 'cta' | 'products' | 'testimonials'
  content: Record<string, string>
}

interface Page {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  isPublished: boolean
  sections: PageSection[]
}

const sectionTypes = [
  { type: 'hero', label: 'Hero Banner', icon: Image },
  { type: 'text', label: 'Texte', icon: Type },
  { type: 'image', label: 'Image', icon: Image },
  { type: 'cta', label: 'Call to Action', icon: LinkIcon },
  { type: 'products', label: 'Produits', icon: FileText },
]

export default function PagesPage() {
  const [selectedPage, setSelectedPage] = useState<string | null>('home')
  const [editingSection, setEditingSection] = useState<string | null>(null)

  // Simulation de données
  const pages: Page[] = [
    {
      slug: 'home',
      title: 'Accueil',
      metaTitle: 'FAITH SHOP - Boutique de mode premium',
      metaDescription: 'Découvrez notre collection exclusive de vêtements et accessoires de mode.',
      isPublished: true,
      sections: [
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            title: 'Nouvelle Collection',
            subtitle: 'Découvrez notre sélection exclusive',
            image: '/hero.jpg',
            ctaText: 'Découvrir',
            ctaLink: '/shop',
          },
        },
        {
          id: 'text-1',
          type: 'text',
          content: {
            title: 'Notre Philosophie',
            text: 'Chez FAITH SHOP, nous croyons en la mode responsable et intemporelle.',
          },
        },
        {
          id: 'products-1',
          type: 'products',
          content: {
            title: 'Produits Populaires',
            count: '4',
            category: 'featured',
          },
        },
      ],
    },
    {
      slug: 'about',
      title: 'À propos',
      metaTitle: 'À propos de FAITH SHOP',
      metaDescription: 'Découvrez l\'histoire de FAITH SHOP et nos valeurs.',
      isPublished: true,
      sections: [
        {
          id: 'hero-2',
          type: 'hero',
          content: {
            title: 'Notre Histoire',
            subtitle: 'Depuis 2020',
            image: '/about-hero.jpg',
          },
        },
        {
          id: 'text-2',
          type: 'text',
          content: {
            title: 'Qui sommes-nous ?',
            text: 'FAITH SHOP est née de la passion pour la mode éthique...',
          },
        },
      ],
    },
    {
      slug: 'contact',
      title: 'Contact',
      metaTitle: 'Contactez FAITH SHOP',
      metaDescription: 'Nous sommes à votre écoute. Contactez-nous !',
      isPublished: true,
      sections: [],
    },
  ]

  const currentPage = pages.find(p => p.slug === selectedPage)

  const renderSectionEditor = (section: PageSection) => {
    return (
      <div className="space-y-3 p-4 bg-gray-50 rounded-md">
        {section.type === 'hero' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500">Titre</label>
              <Input defaultValue={section.content.title} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Sous-titre</label>
              <Input defaultValue={section.content.subtitle} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Image</label>
              <div className="flex gap-2 mt-1">
                <Input defaultValue={section.content.image} />
                <Button variant="outline" size="icon">
                  <Image className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {section.content.ctaText && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-500">Texte bouton</label>
                  <Input defaultValue={section.content.ctaText} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Lien bouton</label>
                  <Input defaultValue={section.content.ctaLink} className="mt-1" />
                </div>
              </div>
            )}
          </>
        )}
        {section.type === 'text' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500">Titre</label>
              <Input defaultValue={section.content.title} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Contenu</label>
              <textarea
                defaultValue={section.content.text}
                className="w-full mt-1 p-2 border rounded-md text-sm"
                rows={4}
              />
            </div>
          </>
        )}
        {section.type === 'products' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500">Titre</label>
              <Input defaultValue={section.content.title} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-500">Nombre de produits</label>
                <Input type="number" defaultValue={section.content.count} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Catégorie</label>
                <select defaultValue={section.content.category} className="w-full mt-1 p-2 border rounded-md text-sm">
                  <option value="featured">Produits vedettes</option>
                  <option value="new">Nouveautés</option>
                  <option value="bestsellers">Meilleures ventes</option>
                </select>
              </div>
            </div>
          </>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => setEditingSection(null)}>
            Annuler
          </Button>
          <Button size="sm" onClick={() => setEditingSection(null)}>
            <Save className="h-3 w-3 mr-1" />
            Sauvegarder
          </Button>
        </div>
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
                    selectedPage === page.slug
                      ? 'bg-gray-100 text-gray-900'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                  onClick={() => setSelectedPage(page.slug)}
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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Prévisualiser
                      </Button>
                      <Button size="sm">
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
                      <Input defaultValue={currentPage.title} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Slug (URL)</label>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm text-muted-foreground">/</span>
                        <Input defaultValue={currentPage.slug} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Titre SEO (meta title)</label>
                    <Input defaultValue={currentPage.metaTitle} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description SEO (meta description)</label>
                    <textarea
                      defaultValue={currentPage.metaDescription}
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
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une section
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentPage.sections.length > 0 ? (
                    <div className="space-y-4">
                      {currentPage.sections.map((section) => {
                        const sectionType = sectionTypes.find(t => t.type === section.type)
                        const Icon = sectionType?.icon || FileText

                        return (
                          <div key={section.id} className="border rounded-lg">
                            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                              <div className="flex items-center gap-3">
                                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
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
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {editingSection === section.id ? (
                              renderSectionEditor(section)
                            ) : (
                              <div className="p-4">
                                {section.type === 'hero' && (
                                  <div className="flex items-center gap-4">
                                    <div className="h-20 w-32 bg-gray-200 rounded flex items-center justify-center">
                                      <Image className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{section.content.title}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {section.content.subtitle}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {section.type === 'text' && (
                                  <div>
                                    <p className="font-medium">{section.content.title}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {section.content.text}
                                    </p>
                                  </div>
                                )}
                                {section.type === 'products' && (
                                  <div>
                                    <p className="font-medium">{section.content.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {section.content.count} produits - {section.content.category}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Cette page n'a pas encore de contenu
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une section
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Types de sections disponibles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Types de sections disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {sectionTypes.map((type) => (
                      <button
                        key={type.type}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
                      >
                        <type.icon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm font-medium">{type.label}</p>
                      </button>
                    ))}
                  </div>
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
