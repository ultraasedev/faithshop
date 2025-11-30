import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const accessories = [
  { id: 4, name: 'Casquette Faith', price: 30.00, image: '/products/cap-black.png' },
  { id: 5, name: 'Tote Bag Hope', price: 25.00, image: '/products/totebag.png' },
]

export default function AccessoriesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="bg-secondary/30 py-16 text-center">
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Accessoires</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Les détails qui font la différence.
          </p>
        </div>

        <div className="mx-auto max-w-[1600px] px-6 lg:px-12 py-16">
          <div className="grid gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {accessories.map((product) => (
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
