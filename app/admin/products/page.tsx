import { Button } from '@/components/ui/button'
import { Plus, Search, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SyncStripeButton } from '@/components/admin/SyncStripeButton'
import StripeSyncButton from '@/components/admin/StripeSyncButton'
import { ProductActions } from './ProductActions'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground mt-2">Gérez votre catalogue, vos stocks et vos prix.</p>
        </div>
        <div className="flex items-center gap-2">
          <StripeSyncButton />
          <SyncStripeButton />
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {/* Search and filter section */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full pl-9 pr-4 h-10 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="px-6 py-4 w-[80px]">Image</th>
              <th className="px-6 py-4">Nom</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4">Prix</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Aucun produit</h3>
                    <p className="text-sm text-muted-foreground mb-4">Commencez par ajouter votre premier produit.</p>
                    <Button asChild size="sm">
                      <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un produit
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product: any) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted border border-border">
                      {product.images[0] && (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{product.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">ID: {product.id.slice(-8)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {product.stock > 10 ? 'En stock' : product.stock > 0 ? 'Stock faible' : 'Rupture'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">{Number(product.price).toFixed(2)} €</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${
                      product.stock > 10 ? 'text-green-600 dark:text-green-400' :
                      product.stock > 0 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8"
                      >
                        <Link href={`/admin/products/${product.id}`}>
                          Modifier
                        </Link>
                      </Button>
                      <ProductActions productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}