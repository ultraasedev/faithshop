import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

// Mock Data - À remplacer par votre base de données Prisma plus tard
const products = [
  { id: 1, name: 'T-Shirt Signature', price: 45.00, image: '/products/tshirt-white.png', category: 'Vêtements' },
  { id: 2, name: 'Hoodie Grace', price: 85.00, image: '/products/hoodie-black.png', category: 'Vêtements' },
  { id: 3, name: 'T-Shirt Olive', price: 45.00, image: '/products/tshirt-beige.png', category: 'Vêtements' },
  { id: 4, name: 'Casquette Faith', price: 30.00, image: '/products/cap-black.png', category: 'Accessoires' },
  { id: 5, name: 'Tote Bag Hope', price: 25.00, image: '/products/totebag.png', category: 'Accessoires' },
  { id: 6, name: 'Sweatshirt Mercy', price: 75.00, image: '/products/sweat-grey.png', category: 'Vêtements' },
]

export default function ShopPage() {
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

        {/* Grille de produits */}
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12 py-16">
          <div className="grid gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group block">
                <div className="relative mb-4 aspect-3/4 overflow-hidden bg-secondary">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <h3 className="font-serif text-lg group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <span className="text-sm font-medium text-muted-foreground">
                    {product.price.toFixed(2)} €
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
