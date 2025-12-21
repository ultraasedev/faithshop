'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Package,
  Eye,
  ImageIcon
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  status: string
  images: any[]
  stock: number
}

interface SimpleProductManagerProps {
  products: Product[]
}

export default function SimpleProductManager({ products }: SimpleProductManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsEditing(true)
  }

  const handleSave = async () => {
    // API call to save product
    setIsEditing(false)
    setSelectedProduct(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Produits</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{products.length} produits au total</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un produit..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url || product.images[0].src}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    €{Number(product.price).toFixed(2)}
                  </p>
                </div>

                {/* Status & Stock */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className={product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {product.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Stock: {product.stock || 0}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-3"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Aucun produit ne correspond à votre recherche.' : 'Commencez par ajouter votre premier produit.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal (simplified) */}
      {isEditing && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Modifier le produit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Nom du produit"
                value={selectedProduct.name}
                onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
              />
              <Input
                type="number"
                placeholder="Prix"
                value={selectedProduct.price}
                onChange={(e) => setSelectedProduct({...selectedProduct, price: Number(e.target.value)})}
              />
              <Textarea
                placeholder="Description"
                value={selectedProduct.description || ''}
                onChange={(e) => setSelectedProduct({...selectedProduct, description: e.target.value})}
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">Sauvegarder</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}