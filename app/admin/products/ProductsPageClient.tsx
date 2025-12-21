'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, Package, Grid, List, Filter, SortAsc } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import DragDropGrid from '@/components/admin/DragDropGrid'
import { SyncStripeButton } from '@/components/admin/SyncStripeButton'
import StripeSyncButton from '@/components/admin/StripeSyncButton'
import { ProductActions } from './ProductActions'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  stock: number
  isActive: boolean
  description?: string
  category?: string
}

interface ProductsPageClientProps {
  products: Product[]
}

export default function ProductsPageClient({ products: initialProducts }: ProductsPageClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'date'>('date')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'low-stock'>('all')

  // Filtrage et tri des produits
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'active' && product.isActive) ||
        (filterStatus === 'inactive' && !product.isActive) ||
        (filterStatus === 'low-stock' && product.stock <= 10)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price':
          return a.price - b.price
        case 'stock':
          return b.stock - a.stock
        default:
          return 0 // Pour 'date', garder l'ordre initial
      }
    })

  const handleReorder = async (reorderedProducts: Product[]) => {
    setProducts(reorderedProducts)
    // TODO: Sauvegarder l'ordre en base de données
    console.log('Nouvel ordre des produits:', reorderedProducts.map(p => p.id))
  }

  const handleEdit = (productId: string) => {
    window.location.href = `/admin/products/${productId}`
  }

  const handleDelete = async (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      setProducts(prev => prev.filter(p => p.id !== productId))
      // TODO: Appeler l'API de suppression
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock > 10) return { label: 'En stock', color: 'default' }
    if (stock > 0) return { label: 'Stock faible', color: 'secondary' }
    return { label: 'Rupture', color: 'destructive' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Produits</h1>
          <p className="text-muted-foreground mt-2">
            Gérez votre catalogue avec le drag & drop, l'édition en temps réel et l'aperçu instantané.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StripeSyncButton />
          <SyncStripeButton />
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un produit
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits Actifs</CardTitle>
            <Badge variant="default" className="text-xs">Actif</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => p.isActive).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
            <Badge variant="secondary" className="text-xs">⚠️</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => p.stock <= 10 && p.stock > 0).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Rupture</CardTitle>
            <Badge variant="destructive" className="text-xs">Rupture</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => p.stock === 0).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et contrôles */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
                <option value="low-stock">Stock faible</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="date">Tri par date</option>
                <option value="name">Tri par nom</option>
                <option value="price">Tri par prix</option>
                <option value="stock">Tri par stock</option>
              </select>
            </div>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList>
                <TabsTrigger value="grid">
                  <Grid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
            {searchQuery && ` pour "${searchQuery}"`}
          </p>
          <Badge variant="outline">
            Glisser-déposer pour réorganiser
          </Badge>
        </div>

        {filteredProducts.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Aucun produit ne correspond à votre recherche."
                  : "Commencez par ajouter votre premier produit."
                }
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/admin/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un produit
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <DragDropGrid
            products={filteredProducts}
            onReorder={handleReorder}
            onEdit={handleEdit}
            onDelete={handleDelete}
            gridView={viewMode === 'grid'}
          />
        )}
      </div>
    </div>
  )
}