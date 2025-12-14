'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Save, RefreshCw, Trash2 } from 'lucide-react'
import { updateProduct, deleteProduct } from '@/app/actions/admin/products'
import { Prisma } from '@prisma/client'
import MediaGallery from '@/components/admin/MediaGallery'
import CollectionSelect from '@/components/admin/CollectionSelect'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Product {
  id: string
  name: string
  description: string | null
  price: Prisma.Decimal
  stock: number
  images: string[]
  sizes: string[]
  colors: string[]
  isActive: boolean
  stripeProductId: string | null
  collections: { id: string; collectionId: string; collection: { id: string; name: string } }[]
}

interface Category {
  id: string
  name: string
}

interface Props {
  product: Product
  categories: Category[]
}

export default function ProductEditClient({ product, categories }: Props) {
  console.log('=== DEBUG: ProductEditClient render start ===')
  console.log('=== DEBUG: Product data ===', JSON.stringify(product, null, 2))
  console.log('=== DEBUG: Categories data ===', categories)

  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [collections, setCollections] = useState(categories)

  let formDataState
  try {
    console.log('=== DEBUG: About to convert price ===', product.price, typeof product.price)

    // Conversion plus robuste du prix
    let priceNumber = 0
    if (product.price) {
      if (typeof product.price === 'object' && 'toNumber' in product.price) {
        priceNumber = product.price.toNumber()
      } else if (typeof product.price === 'number') {
        priceNumber = product.price
      } else if (typeof product.price === 'string') {
        priceNumber = parseFloat(product.price) || 0
      }
    }
    console.log('=== DEBUG: Price converted to ===', priceNumber)

    // Récupération plus robuste de la collection
    let categoryId = ''
    if (product.collections && product.collections.length > 0) {
      const firstCollection = product.collections[0]
      if (firstCollection && firstCollection.collection) {
        categoryId = firstCollection.collection.id
      } else if (firstCollection && firstCollection.collectionId) {
        categoryId = firstCollection.collectionId
      }
    }
    console.log('=== DEBUG: Category ID ===', categoryId)

    formDataState = {
      name: product.name || '',
      description: product.description || '',
      price: priceNumber,
      stock: product.stock || 0,
      images: Array.isArray(product.images) ? product.images : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      isActive: product.isActive ?? true,
      categoryId: categoryId
    }
    console.log('=== DEBUG: Form data created ===', formDataState)
  } catch (error) {
    console.error('=== DEBUG: Error creating form data ===', error)
    formDataState = {
      name: product?.name || 'Erreur de chargement',
      description: '',
      price: 0,
      stock: 0,
      images: [],
      sizes: [],
      colors: [],
      isActive: false,
      categoryId: ''
    }
  }

  const [formData, setFormData] = useState(formDataState)

  const [newSize, setNewSize] = useState('')
  const [newColor, setNewColor] = useState('')

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateProduct(product.id, {
        ...formData,
        sizes: formData.sizes.filter(s => s.trim()),
        colors: formData.colors.filter(c => c.trim())
      })

      if (result.success) {
        toast.success('Produit mis à jour et synchronisé avec Stripe')
        router.refresh()
      } else {
        toast.error(result.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const result = await deleteProduct(product.id)
      if (result.message === 'Produit supprimé') {
        toast.success('Produit supprimé avec succès')
        router.push('/admin/products')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData({ ...formData, sizes: [...formData.sizes, newSize.trim()] })
      setNewSize('')
    }
  }

  const removeSize = (size: string) => {
    setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size) })
  }

  const addColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData({ ...formData, colors: [...formData.colors, newColor.trim()] })
      setNewColor('')
    }
  }

  const removeColor = (color: string) => {
    setFormData({ ...formData, colors: formData.colors.filter(c => c !== color) })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/products')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Modifier le produit</h1>
            <p className="text-muted-foreground">{product.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 auto-rows-min">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du produit</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="category">Collection</Label>
              <CollectionSelect
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                collections={collections}
                onCollectionCreated={(newCollection) => {
                  setCollections([...collections, newCollection])
                }}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="active">Produit actif</Label>
            </div>
          </CardContent>
        </Card>

        {/* Prix et stock */}
        <Card>
          <CardHeader>
            <CardTitle>Prix et inventaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="price">Prix (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              />
            </div>

            {product.stripeProductId && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Stripe ID:</strong> {product.stripeProductId}
                </p>
              </div>
            )}

            {/* Aperçu des images existantes */}
            {formData.images.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Aperçu des médias ({formData.images.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.images.slice(0, 4).map((url, index) => (
                    <div key={index} className="relative w-16 h-16 rounded border overflow-hidden">
                      {url.includes('.mp4') || url.includes('.webm') ? (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xs text-gray-500">VID</span>
                        </div>
                      ) : (
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                  {formData.images.length > 4 && (
                    <div className="w-16 h-16 rounded border bg-gray-50 flex items-center justify-center">
                      <span className="text-xs text-gray-500">+{formData.images.length - 4}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Voir la section "Galerie média" ci-dessous pour gérer tous les fichiers
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Galerie média */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Galerie média</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaGallery
              value={formData.images}
              onChange={(urls) => setFormData({ ...formData, images: urls })}
              folder="products"
              maxFiles={8}
              label="Images et vidéos du produit"
            />
          </CardContent>
        </Card>

        {/* Variantes */}
        <Card>
          <CardHeader>
            <CardTitle>Variantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tailles */}
            <div>
              <Label>Tailles disponibles</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Ajouter une taille"
                  onKeyPress={(e) => e.key === 'Enter' && addSize()}
                />
                <Button onClick={addSize} size="sm">
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.sizes.map((size) => (
                  <Badge key={size} variant="secondary" className="cursor-pointer" onClick={() => removeSize(size)}>
                    {size} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Couleurs */}
            <div>
              <Label>Couleurs disponibles</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Ajouter une couleur"
                  onKeyPress={(e) => e.key === 'Enter' && addColor()}
                />
                <Button onClick={addColor} size="sm">
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.colors.map((color) => (
                  <Badge key={color} variant="secondary" className="cursor-pointer" onClick={() => removeColor(color)}>
                    {color} ×
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}