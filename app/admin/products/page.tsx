import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Produits</h1>
          <p className="text-foreground/70 mt-2">
            Gérez votre catalogue de produits
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Produit
        </Link>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">Image</th>
                <th className="text-left py-3 px-4">Nom</th>
                <th className="text-left py-3 px-4">Catégorie</th>
                <th className="text-left py-3 px-4">Prix</th>
                <th className="text-left py-3 px-4">Stock</th>
                <th className="text-left py-3 px-4">Statut</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="text-foreground/70">
                      <p className="text-lg mb-2">Aucun produit</p>
                      <p className="text-sm">Commencez par créer votre premier produit</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-2xl">✝</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">{product.category.name}</td>
                    <td className="py-3 px-4 font-medium">{formatPrice(product.price)}</td>
                    <td className="py-3 px-4">
                      <span className={`${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {product.featured ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          Vedette
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
