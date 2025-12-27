'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FolderOpen,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  GripVertical,
  Search,
  Package,
  Link as LinkIcon
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Collection {
  id: string
  name: string
  description: string | null
  slug: string
  image: string | null
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
  productCount: number
  metaTitle: string | null
  metaDescription: string | null
  createdAt: Date
  updatedAt: Date
}

interface Product {
  id: string
  name: string
  slug: string
  images: string[]
  price: number
}

interface CollectionsClientProps {
  collections: Collection[]
  products: Product[]
}

export function CollectionsClient({ collections, products }: CollectionsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    image: '',
    isActive: true,
    isFeatured: false,
    metaTitle: '',
    metaDescription: ''
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      image: '',
      isActive: true,
      isFeatured: false,
      metaTitle: '',
      metaDescription: ''
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleCreate = async () => {
    if (!formData.name) return
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || generateSlug(formData.name)
        })
      })

      if (res.ok) {
        setIsCreating(false)
        resetForm()
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!isEditing) return
    setIsLoading(true)

    try {
      const res = await fetch(`/api/admin/collections/${isEditing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setIsEditing(null)
        resetForm()
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette collection ? Les produits ne seront pas supprimés.')) return

    await fetch(`/api/admin/collections/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await fetch(`/api/admin/collections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentStatus })
    })
    router.refresh()
  }

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    await fetch(`/api/admin/collections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !currentStatus })
    })
    router.refresh()
  }

  const openEditModal = (collection: Collection) => {
    setFormData({
      name: collection.name,
      description: collection.description || '',
      slug: collection.slug,
      image: collection.image || '',
      isActive: collection.isActive,
      isFeatured: collection.isFeatured,
      metaTitle: collection.metaTitle || '',
      metaDescription: collection.metaDescription || ''
    })
    setIsEditing(collection)
  }

  const filteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Collections
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {collections.length} collection{collections.length > 1 ? 's' : ''}
          </p>
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              Nouvelle collection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une collection</DialogTitle>
              <DialogDescription>
                Organisez vos produits en collections
              </DialogDescription>
            </DialogHeader>

            <CollectionForm
              formData={formData}
              setFormData={setFormData}
              generateSlug={generateSlug}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={isLoading || !formData.name}>
                {isLoading ? 'Création...' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((collection) => (
          <Card key={collection.id} className="group relative overflow-hidden">
            {/* Image */}
            <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
              {collection.image ? (
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FolderOpen className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                </div>
              )}

              {/* Status badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {!collection.isActive && (
                  <span className="px-2 py-1 text-xs font-medium rounded bg-gray-900/70 text-white">
                    Masquée
                  </span>
                )}
                {collection.isFeatured && (
                  <span className="px-2 py-1 text-xs font-medium rounded bg-amber-500/90 text-white flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Vedette
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditModal(collection)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleActive(collection.id, collection.isActive)}>
                      {collection.isActive ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Masquer
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Afficher
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleFeatured(collection.id, collection.isFeatured)}>
                      <Star className={cn("h-4 w-4 mr-2", collection.isFeatured && "fill-current")} />
                      {collection.isFeatured ? 'Retirer des vedettes' : 'Mettre en vedette'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(collection.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {collection.name}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {collection.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {collection.productCount} produit{collection.productCount > 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  /{collection.slug}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCollections.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune collection
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Aucun résultat pour cette recherche' : 'Créez votre première collection'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une collection
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!isEditing} onOpenChange={(open) => !open && setIsEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la collection</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la collection
            </DialogDescription>
          </DialogHeader>

          <CollectionForm
            formData={formData}
            setFormData={setFormData}
            generateSlug={generateSlug}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(null)}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface CollectionFormProps {
  formData: {
    name: string
    description: string
    slug: string
    image: string
    isActive: boolean
    isFeatured: boolean
    metaTitle: string
    metaDescription: string
  }
  setFormData: React.Dispatch<React.SetStateAction<typeof formData>>
  generateSlug: (name: string) => string
}

function CollectionForm({ formData, setFormData, generateSlug }: CollectionFormProps) {
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label>Nom</Label>
        <Input
          value={formData.name}
          onChange={(e) => {
            const name = e.target.value
            setFormData({
              ...formData,
              name,
              slug: formData.slug || generateSlug(name)
            })
          }}
          placeholder="Nouveautés"
        />
      </div>

      <div className="space-y-2">
        <Label>Slug (URL)</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">/collections/</span>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="nouveautes"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Découvrez nos dernières nouveautés..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Image de couverture</Label>
        <Input
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Active</p>
            <p className="text-xs text-gray-500">Visible sur le site</p>
          </div>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Mise en avant</p>
            <p className="text-xs text-gray-500">Afficher sur la page d'accueil</p>
          </div>
          <Switch
            checked={formData.isFeatured}
            onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <Search className="h-4 w-4" />
          SEO
        </h4>

        <div className="space-y-2">
          <Label>Meta titre</Label>
          <Input
            value={formData.metaTitle}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
            placeholder={formData.name || 'Titre pour les moteurs de recherche'}
          />
        </div>

        <div className="space-y-2">
          <Label>Meta description</Label>
          <Textarea
            value={formData.metaDescription}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            placeholder="Description pour les moteurs de recherche..."
            rows={2}
          />
        </div>
      </div>
    </div>
  )
}
