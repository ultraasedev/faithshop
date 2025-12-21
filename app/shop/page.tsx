import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
// PreorderCountdown supprimé - remplacé par ShippingBanner sur les pages produits
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-32">
        {/* Header de collection */}
        <div className="bg-secondary/30 py-16 text-center">
          <h1 className="font-serif text-4xl md:text-5xl mb-4">La Boutique</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Découvrez l'ensemble de notre collection. Des pièces conçues pour durer et inspirer.
          </p>
        </div>

        {/* Bandeau pré-commande supprimé - remplacé par ShippingBanner sur les pages produits */}

        {/* Grille de produits */}
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12 py-16">
          <div className="grid gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group block">
                <div className="relative mb-4 aspect-3/4 overflow-hidden bg-secondary">
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-col space-y-1">
                  <h3 className="font-serif text-lg group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <span className="text-sm font-medium text-muted-foreground">
                    {Number(product.price).toFixed(2)} €
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
