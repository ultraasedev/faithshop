'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Save,
  Eye,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  Package,
  Tag,
  Settings,
  Globe,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'
import RichTextEditor from '@/components/admin/RichTextEditor'
import LivePreview from '@/components/admin/LivePreview'
import MediaGallery from '@/components/admin/MediaGallery'
import CollectionSelect from '@/components/admin/CollectionSelect'
import { updateProduct, deleteProduct } from '@/app/actions/admin/products'
import { Prisma } from '@prisma/client'

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
  category?: string
  tags?: string[]
  sku?: string
  weight?: number
  dimensions?: string
  metaTitle?: string
  metaDescription?: string
}

interface Category {
  id: string
  name: string
}

interface Props {
  product: Product
  categories: Category[]
}

export default function ProductEditEnhanced({ product, categories }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showPreview, setShowPreview] = useState(false)

  // État du formulaire
  const [formData, setFormData] = useState(() => {
    const priceNumber = typeof product.price === 'object' && 'toNumber' in product.price
      ? product.price.toNumber()
      : Number(product.price) || 0

    const categoryId = product.collections?.[0]?.collection?.id || ''

    return {
      name: product.name || '',
      description: product.description || '',
      price: priceNumber,
      stock: product.stock || 0,
      images: Array.isArray(product.images) ? product.images : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      isActive: product.isActive || false,
      categoryId,
      tags: product.tags || [],
      sku: product.sku || '',
      weight: product.weight || 0,
      dimensions: product.dimensions || '',
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || ''
    }
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: string, value: string) => {
    const values = value.split(',').map(s => s.trim()).filter(Boolean)
    handleInputChange(field, values)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProduct(product.id, {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        images: formData.images,
        sizes: formData.sizes,
        colors: formData.colors,
        isActive: formData.isActive,
        categoryId: formData.categoryId || undefined
      })
      toast.success('Produit mis à jour avec succès')
      router.refresh()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduct(product.id)
        toast.success('Produit supprimé')
        router.push('/admin/products')
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        toast.error('Erreur lors de la suppression')
      }
    }
  }

  const previewData = {
    title: formData.name,
    description: formData.description,
    price: formData.price,
    images: formData.images,
    content: formData.description,
    isActive: formData.isActive,
    tags: formData.tags,
    category: categories.find(c => c.id === formData.categoryId)?.name
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Éditer le produit</h1>
            <p className="text-muted-foreground">
              ID: {product.id} | SKU: {formData.sku || 'Non défini'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Masquer' : 'Aperçu'}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(`/products/${product.id}`, '_blank')}
          >
            <Globe className="h-4 w-4 mr-2" />
            Voir en ligne
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire principal */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Général
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Médias
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Stock
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Avancé
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
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
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nom du produit"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <RichTextEditor
                      content={formData.description}
                      onChange={(content) => handleInputChange('description', content)}
                      placeholder="Décrivez votre produit..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Prix (€) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Catégorie</Label>
                      <CollectionSelect
                        collections={categories}
                        selectedIds={formData.categoryId ? [formData.categoryId] : []}
                        onSelectionChange={(ids) => handleInputChange('categoryId', ids[0] || '')}
                        maxSelections={1}
                        placeholder="Sélectionner une catégorie"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                    <Input
                      id="tags"
                      value={formData.tags.join(', ')}
                      onChange={(e) => handleArrayChange('tags', e.target.value)}
                      placeholder="mode, premium, nouveauté"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Médias du produit</CardTitle>
                </CardHeader>
                <CardContent>
                  <MediaGallery
                    images={formData.images}
                    onImagesChange={(images) => handleInputChange('images', images)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des stocks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stock">Quantité en stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        placeholder="SKU-123"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sizes">Tailles disponibles (séparées par des virgules)</Label>
                    <Input
                      id="sizes"
                      value={formData.sizes.join(', ')}
                      onChange={(e) => handleArrayChange('sizes', e.target.value)}
                      placeholder="XS, S, M, L, XL"
                    />
                  </div>

                  <div>
                    <Label htmlFor="colors">Couleurs disponibles (séparées par des virgules)</Label>
                    <Input
                      id="colors"
                      value={formData.colors.join(', ')}
                      onChange={(e) => handleArrayChange('colors', e.target.value)}
                      placeholder="Blanc, Noir, Rouge"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight">Poids (g)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dimensions">Dimensions (L x l x H)</Label>
                      <Input
                        id="dimensions"
                        value={formData.dimensions}
                        onChange={(e) => handleInputChange('dimensions', e.target.value)}
                        placeholder="20 x 15 x 5 cm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Optimisation SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">Titre SEO</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                      placeholder="Titre optimisé pour les moteurs de recherche"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.metaTitle.length}/60 caractères
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="metaDescription">Description SEO</Label>
                    <textarea
                      id="metaDescription"
                      className="w-full h-24 p-3 border rounded-md resize-none"
                      value={formData.metaDescription}
                      onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                      placeholder="Description optimisée pour les moteurs de recherche"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.metaDescription.length}/160 caractères
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres avancés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isActive">Produit actif</Label>
                      <p className="text-xs text-muted-foreground">
                        Définit si le produit est visible sur le site
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                  </div>

                  <Separator />

                  {product.stripeProductId && (
                    <div>
                      <Label>Synchronisation Stripe</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">ID Stripe: {product.stripeProductId}</Badge>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Synchroniser
                        </Button>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="pt-4">
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer le produit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Aperçu */}
        {showPreview && (
          <div className="lg:col-span-1">
            <LivePreview
              data={previewData}
              type="product"
            />
          </div>
        )}
      </div>
    </div>
  )
}