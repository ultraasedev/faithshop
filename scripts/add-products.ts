import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Ajout de produits de test...')

  const products = [
    {
      name: 'T-shirt Premium Noir',
      slug: 't-shirt-premium-noir',
      description: 'T-shirt de haute qualité en coton bio. Coupe moderne et confortable.',
      price: 45.00,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500'
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Noir', 'Blanc', 'Gris'],
      stock: 100,
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Hoodie Oversize Beige',
      slug: 'hoodie-oversize-beige',
      description: 'Hoodie oversize ultra confortable. Parfait pour un look décontracté.',
      price: 89.00,
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
        'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=500'
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Beige', 'Noir', 'Gris'],
      stock: 50,
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Pantalon Cargo Kaki',
      slug: 'pantalon-cargo-kaki',
      description: 'Pantalon cargo moderne avec poches multiples. Style streetwear.',
      price: 95.00,
      images: [
        'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500',
        'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=500'
      ],
      sizes: ['28', '30', '32', '34', '36'],
      colors: ['Kaki', 'Noir', 'Beige'],
      stock: 75,
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Veste Bomber Vintage',
      slug: 'veste-bomber-vintage',
      description: 'Veste bomber style vintage avec finitions premium.',
      price: 120.00,
      images: [
        'https://images.unsplash.com/photo-1559582798-678dfc71ccd8?w=500',
        'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500'
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Noir', 'Vert', 'Navy'],
      stock: 30,
      isFeatured: false,
      isActive: true,
    },
    {
      name: 'Casquette Baseball',
      slug: 'casquette-baseball',
      description: 'Casquette baseball classique avec logo brodé.',
      price: 35.00,
      images: [
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500',
        'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500'
      ],
      sizes: ['One Size'],
      colors: ['Noir', 'Blanc', 'Rouge'],
      stock: 150,
      isFeatured: false,
      isActive: true,
    },
    {
      name: 'Sac à Dos Urban',
      slug: 'sac-dos-urban',
      description: 'Sac à dos fonctionnel pour un usage quotidien. Compartiment laptop inclus.',
      price: 75.00,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'
      ],
      sizes: ['One Size'],
      colors: ['Noir', 'Gris'],
      stock: 60,
      isFeatured: false,
      isActive: true,
    }
  ]

  for (const product of products) {
    const existing = await prisma.product.findUnique({
      where: { slug: product.slug }
    })

    if (!existing) {
      const created = await prisma.product.create({
        data: product
      })
      console.log('✅ Produit créé:', created.name)
    } else {
      console.log('⏭️ Produit déjà existant:', product.name)
    }
  }

  console.log('🎉 Ajout de produits terminé!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })