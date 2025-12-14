
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding real products...')

  // 0. Clean up existing products (Delete everything to start fresh)
  // 0. Clean up existing products (Delete everything to start fresh)
  // Attention: cela supprimera tous les produits existants !
  await prisma.orderItem.deleteMany({})
  await prisma.review.deleteMany({})
  await prisma.wishlistItem.deleteMany({})
  await prisma.product.deleteMany({})
  console.log('All existing products deleted.')

  // --- 1. Ensemble "Jesus is King" (Chocolat) ---
  
  // Ensemble complet
  await prisma.product.create({
    data: {
      name: 'Ensemble Velours "Jesus is King"',
      slug: 'ensemble-velours-jesus-is-king-chocolat',
      description: `Le haut à capuche en velours présente une coupe légèrement oversize offrant une silhouette décontractée mais raffinée.
Avec Inscription « Jésus est roi » en strass au dos.

Pantalon en velour - chocolat royal :
Coupe droite et longue. Taille élastique avec cordon de serrage, fluide et taille confortable.
Couronne en strass sur l’arrière de la jambe.

Plongez dans l’élégance minimaliste avec notre ensemble en velours couleur chocolat, une pièce iconique alliant confort et sophistication.`,
      price: 60.00,
      images: [
        '/prd/Jesus-is-King/IMG_8482.JPG',
        '/prd/Jesus-is-King/IMG_8484.JPG',
        '/prd/Jesus-is-King/IMG_8485.JPG',
        '/prd/Jesus-is-King/IMG_8490.JPG'
      ],
      colors: ['Chocolat'],
      sizes: ['S', 'M', 'L', 'XL'],
      isActive: true,
      isFeatured: true,
    }
  })

  // Sweat seul
  await prisma.product.create({
    data: {
      name: 'Sweat à capuche Velours "Jesus is King"',
      slug: 'sweat-velours-jesus-is-king-chocolat',
      description: `Le haut à capuche en velours présente une coupe légèrement oversize offrant une silhouette décontractée mais raffinée.
Avec Inscription « Jésus est roi » en strass au dos.`,
      price: 35.00,
      images: [
        '/prd/Jesus-is-King/IMG_8482.JPG', // Image principale du haut
        '/prd/Jesus-is-King/IMG_8485.JPG'  // Dos
      ],
      colors: ['Chocolat'],
      sizes: ['S', 'M', 'L', 'XL'],
      isActive: true,
      isFeatured: false,
    }
  })

  // Pantalon seul
  await prisma.product.create({
    data: {
      name: 'Pantalon Velours "Jesus is King"',
      slug: 'pantalon-velours-jesus-is-king-chocolat',
      description: `Pantalon en velour - chocolat royal :
Coupe droite et longue. Taille élastique avec cordon de serrage, fluide et taille confortable.
Couronne en strass sur l’arrière de la jambe.`,
      price: 25.00,
      images: [
        '/prd/Jesus-is-King/IMG_8484.JPG', // Image principale du bas
        '/prd/Jesus-is-King/IMG_8490.JPG'
      ],
      colors: ['Chocolat'],
      sizes: ['S', 'M', 'L', 'XL'],
      isActive: true,
      isFeatured: false,
    }
  })


  // --- 2. Ensemble "Small Girl with a Big God" (Rose) ---

  // Ensemble complet
  await prisma.product.create({
    data: {
      name: 'Ensemble "Small Girl with a Big God"',
      slug: 'ensemble-small-girl-big-god-rose',
      description: `Sweat zippé à capuche avec broderie ton-sur-ton « Faith-shop » sur le pectoral.
Inscription « small girl with a big god » en strass au dos.

Pantalon de jogging Faith :
Coupe droite et moderne. Taille élastique avec cordon de serrage. Poches latérales.
Détail : Inscription « Faith » en Strass.

Convient pour un look casual, lifestyle ou street chic.`,
      price: 65.00,
      images: [
        '/prd/small-girl-with-a-big-god/DSC09609_Afterlight.JPG',
        '/prd/small-girl-with-a-big-god/DSC09617_Afterlight.JPG',
        '/prd/small-girl-with-a-big-god/IMG_8481.JPG',
        '/prd/small-girl-with-a-big-god/IMG_8483.JPG'
      ],
      colors: ['Rose'],
      sizes: ['S', 'M', 'L', 'XL'],
      isActive: true,
      isFeatured: true,
    }
  })

  // Sweat seul
  await prisma.product.create({
    data: {
      name: 'Sweat Zippé "Small Girl with a Big God"',
      slug: 'sweat-small-girl-big-god-rose',
      description: `Sweat zippé à capuche avec broderie ton-sur-ton « Faith-shop » sur le pectoral.
Inscription « small girl with a big god » en strass au dos.`,
      price: 35.00,
      images: [
        '/prd/small-girl-with-a-big-god/DSC09609_Afterlight.JPG',
        '/prd/small-girl-with-a-big-god/DSC09617_Afterlight.JPG'
      ],
      colors: ['Rose'],
      sizes: ['S', 'M', 'L', 'XL'],
      isActive: true,
      isFeatured: false,
    }
  })

  // Pantalon seul
  await prisma.product.create({
    data: {
      name: 'Pantalon Jogging "Faith"',
      slug: 'pantalon-jogging-faith-rose',
      description: `Pantalon de jogging Faith :
Coupe droite et moderne. Taille élastique avec cordon de serrage. Poches latérales.
Détail : Inscription « Faith » en Strass.`,
      price: 30.00,
      images: [
        '/prd/small-girl-with-a-big-god/IMG_8481.JPG',
        '/prd/small-girl-with-a-big-god/IMG_8483.JPG'
      ],
      colors: ['Rose'],
      sizes: ['S', 'M', 'L', 'XL'],
      isActive: true,
      isFeatured: false,
    }
  })


  // --- 3. Ensemble "The Bright Morning Star" (Bleu) ---

  // Ensemble complet
  await prisma.product.create({
    data: {
      name: 'Ensemble "The Bright Morning Star"',
      slug: 'ensemble-bright-morning-star-bleu',
      description: `Ensemble conçu pour les « l’étoile brillante du matin » qui veulent allier foi, style et confiance.

Sweat zippé à capuche avec broderie ton-sur-ton « Faith-shop » sur le pectoral.

Pantalon Apocalypse :
Coupe droite et moderne. Taille élastique avec cordon de serrage. Poches latérales.
Inscription « Apocalypse 22:16 » en Strass.

Convient pour un look casual, lifestyle ou street chic.`,
      price: 60.00,
      images: [
        '/prd/The-Bright-morning-star/IMG_8486.JPG',
        '/prd/The-Bright-morning-star/IMG_8488.JPG',
        '/prd/The-Bright-morning-star/IMG_8489.JPG',
        '/prd/The-Bright-morning-star/IMG_8491.JPG',
        '/prd/The-Bright-morning-star/IMG_8492.JPG'
      ],
      colors: ['Bleu'],
      sizes: ['S', 'M', 'L', 'XL'],
      isActive: true,
      isFeatured: true,
    }
  })

  // Sweat seul
  await prisma.product.create({
    data: {
      name: 'Sweat Zippé "The Bright Morning Star"',
      slug: 'sweat-bright-morning-star-bleu',
      description: `Sweat zippé à capuche avec broderie ton-sur-ton « Faith-shop » sur le pectoral.`,
      price: 35.00,
      images: [
        '/prd/The-Bright-morning-star/IMG_8486.JPG',
        '/prd/The-Bright-morning-star/IMG_8488.JPG'
      ],
      colors: ['Bleu'],
      sizes: ['S', 'M', 'L', 'XL'],
      isActive: true,
      isFeatured: false,
    }
  })

  // Pantalon seul
  await prisma.product.create({
    data: {
      name: 'Pantalon "Apocalypse"',
      slug: 'pantalon-apocalypse-bleu',
      description: `Pantalon Apocalypse :
Coupe droite et moderne. Taille élastique avec cordon de serrage. Poches latérales.
Inscription « Apocalypse 22:16 » en Strass.`,
      price: 25.00,
      images: [
        '/prd/The-Bright-morning-star/IMG_8489.JPG',
        '/prd/The-Bright-morning-star/IMG_8491.JPG',
        '/prd/The-Bright-morning-star/IMG_8492.JPG'
      ],
      colors: ['Bleu'],
      sizes: ['S', 'M', 'L', 'XL'],
      isActive: true,
      isFeatured: false,
    }
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
