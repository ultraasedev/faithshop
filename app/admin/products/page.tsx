import { Button } from '@/components/ui/button'
import { Plus, MoreHorizontal, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

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
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
          </Link>
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
        {/* ... Search bar (Client Component idealement, mais on garde simple ici) ... */}
        
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-[80px]">Image</th>
              <th className="px-6 py-4">Nom</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4">Prix</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Aucun produit trouvé.</td>
              </tr>
            ) : (
              products.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="relative h-10 w-10 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                      {product.images[0] && (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock > 10 ? 'bg-green-100 text-green-800' :
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock > 10 ? 'En stock' : product.stock > 0 ? 'Faible' : 'Rupture'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{Number(product.price).toFixed(2)} €</td>
                  <td className="px-6 py-4 text-gray-500">{product.stock}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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
