'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DataTable, Column } from '@/components/admin/common/DataTable'
import { StatusBadge } from '@/components/admin/common/StatusBadge'
import {
  Plus,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  stock: number
  totalStock: number
  isActive: boolean
  isFeatured: boolean
  sku: string | null
  hasVariants: boolean
  variantCount: number
  collections: string[]
  orderCount: number
  stripeProductId: string | null
  createdAt: Date
  updatedAt: Date
}

interface ProductsClientProps {
  products: Product[]
  stats: {
    total: number
    active: number
    outOfStock: number
    lowStock: number
  }
}

export function ProductsClient({ products, stats }: ProductsClientProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'out_of_stock' | 'low_stock'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredProducts = products.filter(product => {
    switch (filter) {
      case 'active':
        return product.isActive
      case 'inactive':
        return !product.isActive
      case 'out_of_stock':
        return product.totalStock === 0
      case 'low_stock':
        return product.totalStock > 0 && product.totalStock <= 5
      default:
        return true
    }
  })

  const getStockStatus = (stock: number): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    if (stock === 0) return 'out_of_stock'
    if (stock <= 5) return 'low_stock'
    return 'in_stock'
  }

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      toast.success('Produit supprimé')
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      router.refresh()
    } catch (error) {
      toast.error('Erreur lors de la suppression du produit')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDuplicate = async (product: Product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}/duplicate`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la duplication')
      }

      toast.success('Produit dupliqué')
      router.refresh()
    } catch (error) {
      toast.error('Erreur lors de la duplication du produit')
    }
  }

  const columns: Column<Product>[] = [
    {
      key: 'product',
      header: 'Produit',
      render: (product) => (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
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
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {product.name}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {product.sku || 'Sans SKU'}
              {product.hasVariants && ` • ${product.variantCount} variante(s)`}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Statut',
      sortable: true,
      render: (product) => (
        <StatusBadge
          status={product.isActive ? 'active' : 'inactive'}
          type="product"
        />
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      render: (product) => (
        <div className="flex items-center gap-2">
          <StatusBadge
            status={getStockStatus(product.totalStock)}
            type="stock"
            size="sm"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ({product.totalStock})
          </span>
        </div>
      )
    },
    {
      key: 'price',
      header: 'Prix',
      sortable: true,
      render: (product) => (
        <span className="font-medium">
          {product.price.toLocaleString('fr-FR')} €
        </span>
      )
    },
    {
      key: 'collections',
      header: 'Collections',
      render: (product) => (
        <div className="flex flex-wrap gap-1">
          {product.collections.length > 0 ? (
            product.collections.slice(0, 2).map((collection, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded"
              >
                {collection}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          )}
          {product.collections.length > 2 && (
            <span className="text-xs text-gray-500">
              +{product.collections.length - 2}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'sync',
      header: 'Stripe',
      render: (product) => (
        product.stripeProductId ? (
          <span className="text-green-600 dark:text-green-400" title="Synchronisé avec Stripe">
            <CheckCircle className="h-4 w-4" />
          </span>
        ) : (
          <span className="text-gray-400" title="Non synchronisé">
            <XCircle className="h-4 w-4" />
          </span>
        )
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Produits
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Gérez votre catalogue de produits
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Nouveau produit
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card
          className={cn(
            "cursor-pointer transition-all",
            filter === 'all' && "ring-2 ring-gray-900 dark:ring-white"
          )}
          onClick={() => setFilter('all')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all",
            filter === 'active' && "ring-2 ring-green-500"
          )}
          onClick={() => setFilter('active')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.active}
                </p>
                <p className="text-sm text-gray-500">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all",
            filter === 'out_of_stock' && "ring-2 ring-red-500"
          )}
          onClick={() => setFilter('out_of_stock')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.outOfStock}
                </p>
                <p className="text-sm text-gray-500">Rupture</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all",
            filter === 'low_stock' && "ring-2 ring-yellow-500"
          )}
          onClick={() => setFilter('low_stock')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.lowStock}
                </p>
                <p className="text-sm text-gray-500">Stock bas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            data={filteredProducts}
            columns={columns}
            keyField="id"
            searchPlaceholder="Rechercher un produit..."
            searchFields={['name', 'sku', 'description']}
            selectable
            onRowClick={(product) => router.push(`/admin/products/${product.id}`)}
            actions={[
              {
                label: 'Voir',
                icon: <Eye className="h-4 w-4 mr-2" />,
                onClick: (product) => router.push(`/admin/products/${product.id}`)
              },
              {
                label: 'Modifier',
                icon: <Edit className="h-4 w-4 mr-2" />,
                onClick: (product) => router.push(`/admin/products/${product.id}/edit`)
              },
              {
                label: 'Dupliquer',
                icon: <Copy className="h-4 w-4 mr-2" />,
                onClick: handleDuplicate
              },
              {
                label: 'Voir sur le site',
                icon: <ExternalLink className="h-4 w-4 mr-2" />,
                onClick: (product) => window.open(`/products/${product.id}`, '_blank')
              },
              {
                label: 'Supprimer',
                icon: <Trash2 className="h-4 w-4 mr-2" />,
                onClick: openDeleteDialog,
                variant: 'destructive'
              }
            ]}
            bulkActions={[
              {
                label: 'Supprimer',
                icon: <Trash2 className="h-4 w-4 mr-2" />,
                onClick: async (products) => {
                  if (!confirm(`Supprimer ${products.length} produit(s) ?`)) return
                  // TODO: Implement bulk delete
                  toast.info('Suppression en masse - à implémenter')
                },
                variant: 'destructive'
              }
            ]}
            emptyMessage="Aucun produit trouvé"
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le produit</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{productToDelete?.name}&quot; ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
