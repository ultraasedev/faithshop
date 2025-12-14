'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Package,
  Eye,
  Save,
  X,
  Search,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getCollections, createCollection, deleteCollection } from '@/app/actions/admin/collections'
import { toast } from 'sonner'

interface Collection {
  id: string
  name: string
  description: string | null
  slug: string
  image: string | null
  isActive: boolean
  isFeatured: boolean
  products: { product: { name: string } }[]
  createdAt: Date
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [search, setSearch] = useState('')

  // Formulaire de création
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    image: '',
    metaTitle: '',
    metaDescription: '',
    isActive: true,
    isFeatured: false
  })

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    try {
      const data = await getCollections()
      setCollections(data)
    } catch (error) {
      console.error('Failed to load collections', error)
      toast.error('Erreur lors du chargement des collections')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value.toString())
    })

    try {
      const result = await createCollection({ message: '' }, form)
      if (result.message && !result.errors) {
        toast.success('Collection créée avec succès')
        setShowCreateForm(false)
        setFormData({
          name: '',
          description: '',
          slug: '',
          image: '',
          metaTitle: '',
          metaDescription: '',
          isActive: true,
          isFeatured: false
        })
        loadCollections()
      } else if (result.errors) {
        Object.values(result.errors).flat().forEach(error => {
          toast.error(error)
        })
      }
    } catch (error) {
      console.error('Error creating collection:', error)
      toast.error('Erreur lors de la création')
    }
  }

  const handleDeleteCollection = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la collection "${name}" ?`)) {
      return
    }

    try {
      const result = await deleteCollection(id)
      if (result.message) {
        toast.success(result.message)
        loadCollections()
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  // Auto-générer le slug depuis le nom
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    })
  }

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">
            Organisez vos produits en collections thématiques
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Collection
        </Button>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Créer une nouvelle collection</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nom de la collection *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Nouvelle Collection"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Slug (URL)</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="nouvelle-collection"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la collection..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Image de collection</label>
                <Input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Titre SEO</label>
                  <Input
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="Titre pour les moteurs de recherche"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description SEO</label>
                  <Input
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="Description pour les moteurs de recherche"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">Collection active</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                    />
                    <label htmlFor="isFeatured" className="text-sm font-medium">Collection en vedette</label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Créer la collection
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une collection..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des collections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCollections.map((collection) => (
          <Card key={collection.id} className="group">
            <CardContent className="p-0">
              {/* Image de collection */}
              <div className="relative h-48 bg-gray-100">
                {collection.image ? (
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <Button size="sm" asChild>
                      <Link href={`/admin/collections/${collection.id}`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/collections/${collection.slug}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{collection.name}</h3>
                  <div className="flex gap-1">
                    {collection.isFeatured && (
                      <Badge variant="secondary" className="text-xs">Vedette</Badge>
                    )}
                    <Badge variant={collection.isActive ? "default" : "secondary"} className="text-xs">
                      {collection.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                {collection.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {collection.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>{collection.products.length} produit(s)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCollection(collection.id, collection.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCollections.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {search ? 'Aucune collection trouvée' : 'Aucune collection'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {search ? 'Essayez avec d\'autres mots-clés' : 'Commencez par créer votre première collection'}
            </p>
            {!search && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une collection
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}