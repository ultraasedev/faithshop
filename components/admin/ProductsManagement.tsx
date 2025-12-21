'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Plus,
  Filter,
  Edit,
  Eye,
  Trash2,
  Package,
  ImageIcon,
  MoreVertical,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'

interface ProductsManagementProps {
  products: any[]
}

export function ProductsManagement({ products: initialProducts }: ProductsManagementProps) {
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && product.isActive) ||
                         (filterStatus === 'draft' && !product.isActive) ||
                         (filterStatus === 'low-stock' && product.stock < (product.lowStockThreshold || 10)) ||
                         (filterStatus === 'featured' && product.isFeatured) ||
                         (filterStatus === 'out-of-stock' && product.stock === 0)

    return matchesSearch && matchesFilter
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name?.localeCompare(b.name) || 0
      case 'price':
        return Number(b.price) - Number(a.price)
      case 'stock':
        return (b.stock || 0) - (a.stock || 0)
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    setSelectedProducts(
      selectedProducts.length === filteredProducts.length
        ? []
        : filteredProducts.map(p => p.id)
    )
  }

  const handleUpdateProduct = async (productId: string, updates: any) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        setProducts(prev =>
          prev.map(product =>
            product.id === productId ? { ...product, ...updates } : product
          )
        )
        toast.success('Produit mis à jour avec succès')

        if (selectedProduct?.id === productId) {
          setSelectedProduct(prev => ({ ...prev, ...updates }))
        }
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur mise à jour produit:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (product: any) => {
    if (!product.isActive) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">Brouillon</Badge>
    }
    if (product.stock === 0) {
      return <Badge className="bg-red-100 text-red-700 border-red-200">Épuisé</Badge>
    }
    if (product.stock < (product.lowStockThreshold || 10)) {
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Stock faible</Badge>
    }
    if (product.isFeatured) {
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Mis en avant</Badge>
    }
    return <Badge className="bg-green-100 text-green-700 border-green-200">Actif</Badge>
  }

  const getProductStats = () => {
    return {
      total: products.length,
      active: products.filter(p => p.isActive).length,
      lowStock: products.filter(p => p.stock < (p.lowStockThreshold || 10)).length,
      featured: products.filter(p => p.isFeatured).length,
      totalValue: products.reduce((sum, p) => sum + (Number(p.price) * (p.stock || 0)), 0)
    }
  }

  const stats = getProductStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Produits
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredProducts.length} produit(s) • {stats.active} actif(s) • {stats.lowStock} stock faible
          </p>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-200">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stock faible</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mis en avant</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.featured}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valeur stock</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">€{stats.totalValue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher des produits par nom, SKU ou catégorie..."
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="draft">Brouillons</option>
                <option value="featured">Mis en avant</option>
                <option value="low-stock">Stock faible</option>
                <option value="out-of-stock">Rupture de stock</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
              >
                <option value="name">Trier par nom</option>
                <option value="price">Trier par prix</option>
                <option value="stock">Trier par stock</option>
                <option value="created">Trier par date</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="text-left py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Produit
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Statut
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stock
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prix
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                    SKU
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Catégorie
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].url || product.images[0].src}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                            {product.name}
                          </p>
                          {product.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(product)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${
                        product.stock === 0 ? 'text-red-600' :
                        product.stock < (product.lowStockThreshold || 10) ? 'text-orange-600' :
                        'text-gray-900 dark:text-white'
                      }`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900 dark:text-white">
                        €{Number(product.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {product.sku || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {product.category || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProduct(product)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-red-600"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || filterStatus !== 'all'
                  ? 'Aucun produit ne correspond à vos critères de recherche.'
                  : 'Commencez par ajouter votre premier produit à votre boutique.'}
              </p>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <Card className="shadow-lg border-0 bg-gray-900 text-white">
            <CardContent className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedProducts.length} produit(s) sélectionné(s)
                </span>
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                  Modifier le statut
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                  Modifier le prix
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                  Exporter
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-900"
                  onClick={() => setSelectedProducts([])}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {selectedProduct.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    SKU: {selectedProduct.sku || 'Non défini'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Product Status and Price */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Statut du produit</p>
                  {getStatusBadge(selectedProduct)}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    €{Number(selectedProduct.price).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Prix de vente</p>
                </div>
              </div>

              {/* Product Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Informations générales
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Catégorie</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedProduct.category || 'Non catégorisé'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Marque</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedProduct.brand || 'Non spécifié'}
                      </p>
                    </div>
                    {selectedProduct.description && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedProduct.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Stock et inventaire
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Stock actuel</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedProduct.stock || 0} unités
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Seuil d'alerte</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedProduct.lowStockThreshold || 10} unités
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Suivi stock</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedProduct.trackQuantity ? 'Activé' : 'Désactivé'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Images du produit
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedProduct.images.map((image: any, index: number) => (
                      <div key={index} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={image.url || image.src}
                          alt={`${selectedProduct.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateProduct(selectedProduct.id, { isActive: !selectedProduct.isActive })}
                  disabled={isUpdating}
                >
                  {selectedProduct.isActive ? 'Désactiver' : 'Activer'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateProduct(selectedProduct.id, { isFeatured: !selectedProduct.isFeatured })}
                  disabled={isUpdating}
                >
                  {selectedProduct.isFeatured ? 'Retirer de la une' : 'Mettre en avant'}
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}