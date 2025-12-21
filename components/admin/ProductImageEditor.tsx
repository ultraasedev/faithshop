'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  Save,
  Eye,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  colors: string[]
  sizes: string[]
  isActive: boolean
  stripeProductId?: string
}

interface ProductImageEditorProps {
  products: Product[]
}

export default function ProductImageEditor({ products: initialProducts }: ProductImageEditorProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newImages, setNewImages] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  const selectProduct = (product: Product) => {
    setSelectedProduct(product)
    setEditingProduct({ ...product })
    setNewImages('')
  }

  const addImageUrl = () => {
    if (newImages.trim() && editingProduct) {
      const urls = newImages.split(',').map(url => url.trim()).filter(url => url)
      setEditingProduct({
        ...editingProduct,
        images: [...editingProduct.images, ...urls]
      })
      setNewImages('')
    }
  }

  const removeImage = (index: number) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        images: editingProduct.images.filter((_, i) => i !== index)
      })
    }
  }

  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (editingProduct) {
      const newImages = [...editingProduct.images]
      const [removed] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, removed)
      setEditingProduct({
        ...editingProduct,
        images: newImages
      })
    }
  }

  const updateProductField = (field: keyof Product, value: any) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [field]: value
      })
    }
  }

  const saveProduct = async () => {
    if (!editingProduct) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          images: editingProduct.images,
          colors: editingProduct.colors,
          sizes: editingProduct.sizes,
          isActive: editingProduct.isActive
        })
      })

      if (response.ok) {
        const updatedProduct = await response.json()
        setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct.product : p))
        setSelectedProduct(updatedProduct.product)
        toast.success('Produit mis à jour avec succès', {
          description: 'Les modifications ont été synchronisées avec Stripe'
        })
      } else {
        toast.error('Erreur lors de la mise à jour du produit')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const uploadToBlob = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/blob', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        return result.url
      } else {
        throw new Error('Échec de l\'upload')
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      toast.error('Erreur lors de l\'upload de l\'image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !editingProduct) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const url = await uploadToBlob(file)
        if (url && editingProduct) {
          setEditingProduct({
            ...editingProduct,
            images: [...editingProduct.images, url]
          })
        }
      }
    }
  }

  return (
    <div className="space-y-6">

      {/* Sélecteur de produit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Édition des Images Produits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => selectProduct(product)}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedProduct?.id === product.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.images.length} image(s)
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={product.isActive ? 'default' : 'outline'}>
                        {product.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                      {product.stripeProductId && (
                        <Badge variant="outline" className="text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Stripe
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Éditeur */}
      {editingProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Édition : {editingProduct.name}</span>
              <Button onClick={saveProduct} disabled={saving}>
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Sauvegarder
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Nom du produit</Label>
                <Input
                  id="product-name"
                  value={editingProduct.name}
                  onChange={(e) => updateProductField('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-price">Prix (€)</Label>
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) => updateProductField('price', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                value={editingProduct.description}
                onChange={(e) => updateProductField('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Gestion des images */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Images du produit</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {/* Ajouter URLs manuellement */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter URLs d'images (séparées par des virgules)"
                  value={newImages}
                  onChange={(e) => setNewImages(e.target.value)}
                />
                <Button onClick={addImageUrl} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Grille des images */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {editingProduct.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`Image ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Contrôles */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(image, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Badge position */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                        {index === 0 && ' (Principale)'}
                      </Badge>
                    </div>

                    {/* Contrôles de réorganisation */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {index > 0 && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 w-6 p-0"
                          onClick={() => reorderImages(index, index - 1)}
                        >
                          ←
                        </Button>
                      )}
                      {index < editingProduct.images.length - 1 && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 w-6 p-0"
                          onClick={() => reorderImages(index, index + 1)}
                        >
                          →
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {editingProduct.images.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune image ajoutée
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      )}

      {!selectedProduct && (
        <Card>
          <CardContent className="text-center py-8">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Sélectionnez un produit pour commencer à éditer ses images
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}