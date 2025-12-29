import { prisma } from '../lib/prisma'

async function main() {
  const blocks = [
    {
      id: 'home-slider',
      type: 'slider',
      content: {
        slides: [
          {
            image: '/hero-bg.png',
            title: "L'Élégance de la Foi",
            subtitle: 'Collection 2025',
            buttonText: 'Découvrir',
            buttonLink: '/shop',
            alignment: 'center'
          }
        ],
        autoplay: true,
        autoplaySpeed: 6000,
        showArrows: true,
        showDots: true,
        height: '95vh',
        overlay: true,
        overlayOpacity: 30
      },
      settings: { padding: { top: 0, bottom: 0, left: 0, right: 0 } }
    },
    {
      id: 'home-products',
      type: 'product-grid',
      content: {
        title: 'Pièces Iconiques',
        subtitle: 'Nos essentiels, élevés au rang d\'art. Des matières nobles et des coupes parfaites.',
        source: 'featured',
        columns: 3,
        limit: 3,
        showPrice: true,
        showAddToCart: false
      },
      settings: { padding: { top: 96, bottom: 96, left: 48, right: 48 } }
    },
    {
      id: 'home-quote',
      type: 'quote',
      content: {
        text: "La mode est un langage. Nous avons choisi celui de la grâce, de la simplicité et de l'authenticité.",
        author: '',
        backgroundColor: 'hsl(var(--secondary) / 0.2)'
      },
      settings: { padding: { top: 96, bottom: 96, left: 24, right: 24 } }
    },
    {
      id: 'home-newsletter',
      type: 'newsletter',
      content: {
        title: 'Le Cercle Privé',
        description: 'Inscrivez-vous pour accéder à nos ventes privées et nouveautés en avant-première.',
        buttonText: 'Rejoindre',
        backgroundColor: 'transparent'
      },
      settings: { padding: { top: 96, bottom: 96, left: 24, right: 24 } }
    }
  ]

  await prisma.pageContent.update({
    where: { slug: 'home' },
    data: {
      content: JSON.stringify({ blocks })
    }
  })

  console.log('✅ Homepage updated with slider block!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
