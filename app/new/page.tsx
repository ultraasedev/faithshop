import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const newProducts = [
  { id: 2, name: 'Hoodie Grace', price: 85.00, image: '/products/hoodie-black.png', badge: 'Nouveau' },
  { id: 6, name: 'Sweatshirt Mercy', price: 75.00, image: '/products/sweat-grey.png', badge: 'Nouveau' },
  { id: 3, name: 'T-Shirt Olive', price: 45.00, image: '/products/tshirt-beige.png', badge: 'Nouveau' },
]

export default function NewPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="bg-secondary/30 py-16 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">Collection Automne 2025</span>
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Nouveautés</h1>
        </div>

        <div className="mx-auto max-w-[1600px] px-6 lg:px-12 py-16">
          <div className="grid gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {newProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group block">
                <div className="relative mb-4 aspect-3/4 overflow-hidden bg-secondary">
                  <span className="absolute left-4 top-4 z-10 bg-white/90 backdrop-blur text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                    {product.badge}
                  </span>
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
