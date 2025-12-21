'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Package,
  Eye,
  ImageIcon,
  Upload,
  DollarSign,
  Palette
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  isActive: boolean
  images: any[]
  stock: number
  colors?: string[]
  sizes?: string[]
  sku?: string
  brand?: string
}

interface AdvancedProductManagerProps {
  products: Product[]
}

export default function AdvancedProductManager({ products: initialProducts }: AdvancedProductManagerProps) {
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && product.isActive) ||
                         (statusFilter === 'inactive' && !product.isActive) ||
                         (statusFilter === 'low_stock' && product.stock < 10)

    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

  const handleSave = async (productData: Partial<Product>) => {
    try {
      const url = selectedProduct ? `/api/admin/products/${selectedProduct.id}` : '/api/admin/products'
      const method = selectedProduct ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        const updatedProduct = await response.json()

        if (selectedProduct) {
          setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct.product : p))
        } else {
          setProducts([updatedProduct.product, ...products])
        }

        setIsEditing(false)
        setIsCreating(false)
        setSelectedProduct(null)
      }
    } catch (error) {
      console.error('Erreur sauvegarde produit:', error)
    }
  }

  const handleDelete = async (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setProducts(products.filter(p => p.id !== productId))
        }
      } catch (error) {
        console.error('Erreur suppression produit:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des produits</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Catalogue complet avec {products.length} produits
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {products.filter(p => p.isActive).length}
            </p>
            <p className="text-xs text-green-600 font-medium">Actifs</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {products.filter(p => p.stock < 10).length}
            </p>
            <p className="text-xs text-orange-600 font-medium">Stock faible</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              €{products.reduce((total, p) => total + Number(p.price), 0).toFixed(2)}
            </p>
            <p className="text-xs text-purple-600 font-medium">Valeur totale</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {categories.length}
            </p>
            <p className="text-xs text-blue-600 font-medium">Catégories</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou SKU..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
                <SelectItem value="low_stock">Stock faible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="border-0 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url || product.images[0].src}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={product.isActive ? 'default' : 'secondary'}
                      className={`text-xs ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {product.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    €{Number(product.price).toFixed(2)}
                  </p>
                  {product.sku && (
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  )}
                </div>

                {/* Stock & Colors */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                    <span className={`font-medium ${
                      product.stock < 10 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {product.stock}
                    </span>
                  </div>

                  {product.colors && product.colors.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Palette className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{product.colors.length} couleur(s)</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => {
                      setSelectedProduct(product)
                      setIsEditing(true)
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-2"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Aucun produit ne correspond à vos filtres.'
                : 'Commencez par ajouter votre premier produit.'}
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit/Create Modal */}
      {(isEditing || isCreating) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {isCreating ? 'Nouveau produit' : `Modifier ${selectedProduct?.name}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductForm
                product={selectedProduct}
                onSave={handleSave}
                onCancel={() => {
                  setIsEditing(false)
                  setIsCreating(false)
                  setSelectedProduct(null)
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function ProductForm({ product, onSave, onCancel }: {
  product?: Product | null
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    sku: product?.sku || '',
    category: product?.category || '',
    brand: product?.brand || '',
    isActive: product?.isActive ?? true,
    colors: product?.colors?.join(', ') || '',
    sizes: product?.sizes?.join(', ') || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      ...formData,
      colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean)
    }

    onSave(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom du produit</label>
          <Input
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">SKU</label>
          <Input
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prix (€)</label>
          <Input
            type="number"
            step="0.01"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <Input
            type="number"
            required
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Catégorie</label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Couleurs (séparées par virgule)</label>
          <Input
            value={formData.colors}
            onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
            placeholder="Rouge, Bleu, Vert..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tailles (séparées par virgule)</label>
          <Input
            value={formData.sizes}
            onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
            placeholder="S, M, L, XL..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
        />
        <label htmlFor="isActive" className="text-sm font-medium">Produit actif</label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {product ? 'Mettre à jour' : 'Créer le produit'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  )
}