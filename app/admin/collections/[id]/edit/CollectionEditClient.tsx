'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/admin/common'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  GripVertical,
  Package,
  Search,
  Trash2,
  Eye,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  images: string[]
  price: number
  isActive: boolean
  stock: number
  sortOrder?: number
}

interface Collection {
  id: string
  name: string
  description: string | null
  slug: string
  image: string | null
  isActive: boolean
  isFeatured: boolean
  metaTitle: string | null
  metaDescription: string | null
  products: Product[]
}

interface CollectionEditClientProps {
  collection: Collection
  allProducts: Product[]
}

export function CollectionEditClient({ collection, allProducts }: CollectionEditClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    name: collection.name,
    description: collection.description || '',
    slug: collection.slug,
    image: collection.image || '',
    isActive: collection.isActive,
    isFeatured: collection.isFeatured,
    metaTitle: collection.metaTitle || '',
    metaDescription: collection.metaDescription || ''
  })

  const [collectionProducts, setCollectionProducts] = useState<Product[]>(collection.products)

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // Update collection info
      const res = await fetch(`/api/admin/collections/${collection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productIds: collectionProducts.map((p, i) => ({ id: p.id, sortOrder: i }))
        })
      })

      if (res.ok) {
        router.push('/admin/collections')
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const addProduct = (product: Product) => {
    if (!collectionProducts.find(p => p.id === product.id)) {
      setCollectionProducts([...collectionProducts, { ...product, sortOrder: collectionProducts.length }])
    }
    setShowProductPicker(false)
    setSearchQuery('')
  }

  const removeProduct = (productId: string) => {
    setCollectionProducts(collectionProducts.filter(p => p.id !== productId))
  }

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    const newProducts = [...collectionProducts]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= newProducts.length) return

    const temp = newProducts[index]
    newProducts[index] = newProducts[newIndex]
    newProducts[newIndex] = temp

    setCollectionProducts(newProducts)
  }

  const availableProducts = allProducts.filter(
    p => !collectionProducts.find(cp => cp.id === p.id) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/collections">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {collection.name}
            </h1>
            <p className="text-sm text-gray-500">
              Modifier la collection et ses produits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/collections/${collection.slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Voir
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: formData.slug === generateSlug(formData.name)
                        ? generateSlug(e.target.value)
                        : formData.slug
                    })}
                    placeholder="Nouveautés"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="nouveautes"
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
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Produits</CardTitle>
                <CardDescription>
                  {collectionProducts.length} produit{collectionProducts.length > 1 ? 's' : ''} dans cette collection
                </CardDescription>
              </div>
              <Button onClick={() => setShowProductPicker(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </CardHeader>
            <CardContent>
              {collectionProducts.length > 0 ? (
                <div className="space-y-2">
                  {collectionProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg group"
                    >
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveProduct(index, 'up')}
                          disabled={index === 0}
                        >
                          <GripVertical className="h-4 w-4 rotate-90" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveProduct(index, 'down')}
                          disabled={index === collectionProducts.length - 1}
                        >
                          <GripVertical className="h-4 w-4 rotate-90" />
                        </Button>
                      </div>

                      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.price.toFixed(2)} EUR</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!product.isActive && (
                          <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">
                            Inactif
                          </span>
                        )}
                        <span className={cn(
                          "px-2 py-0.5 text-xs rounded",
                          product.stock > 0
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => removeProduct(product.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Aucun produit dans cette collection</p>
                  <Button variant="outline" onClick={() => setShowProductPicker(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter des produits
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                type="collection"
                aspectRatio="video"
              />
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Statut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <p className="text-xs text-gray-500">Page d'accueil</p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delete */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600">Zone de danger</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                La suppression est irréversible. Les produits ne seront pas supprimés.
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={async () => {
                  if (!confirm('Supprimer cette collection ?')) return
                  await fetch(`/api/admin/collections/${collection.id}`, { method: 'DELETE' })
                  router.push('/admin/collections')
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer la collection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Picker Modal */}
      <Dialog open={showProductPicker} onOpenChange={setShowProductPicker}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Ajouter des produits</DialogTitle>
            <DialogDescription>
              Sélectionnez les produits à ajouter à cette collection
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {availableProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                onClick={() => addProduct(product)}
              >
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.price.toFixed(2)} EUR</p>
                </div>

                <div className="flex items-center gap-2">
                  {!product.isActive && (
                    <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">
                      Inactif
                    </span>
                  )}
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {availableProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'Aucun produit trouvé' : 'Tous les produits sont déjà dans cette collection'}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductPicker(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
