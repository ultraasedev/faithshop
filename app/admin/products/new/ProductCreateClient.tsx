'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { createProductNew } from '@/app/actions/admin/products'
import MediaGallery from '@/components/admin/MediaGallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Category {
  id: string
  name: string
}

interface Props {
  categories: Category[]
}

export default function ProductCreateClient({ categories }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    images: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    isActive: true,
    categoryId: ''
  })

  const [newSize, setNewSize] = useState('')
  const [newColor, setNewColor] = useState('')

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSaving(true)
    try {
      const result = await createProductNew({
        ...formData,
        sizes: formData.sizes.filter(s => s.trim()),
        colors: formData.colors.filter(c => c.trim())
      })

      if (result.success) {
        toast.success('Produit créé avec succès')
        router.push(`/admin/products/${result.product.id}`)
      } else {
        toast.error(result.message || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de la création')
    } finally {
      setSaving(false)
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
            <h1 className="text-3xl font-bold">Créer un produit</h1>
            <p className="text-muted-foreground">Ajoutez un nouveau produit à votre catalogue</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Créer le produit
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 auto-rows-min">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du produit *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: T-Shirt Faith Collection"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Décrivez votre produit..."
              />
            </div>

            <div>
              <Label htmlFor="category">Catégorie *</Label>
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
              <Label htmlFor="price">Prix (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="45.00"
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock initial *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                placeholder="100"
              />
            </div>
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
        <Card className="lg:col-span-2">
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
                  placeholder="Ex: M"
                  onKeyPress={(e) => e.key === 'Enter' && addSize()}
                />
                <Button onClick={addSize} size="sm" type="button">
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
                  placeholder="Ex: Blanc"
                  onKeyPress={(e) => e.key === 'Enter' && addColor()}
                />
                <Button onClick={addColor} size="sm" type="button">
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