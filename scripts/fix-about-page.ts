import { prisma } from '../lib/prisma'

/**
 * Fix the about page to use the correct blocks matching the original design
 */

async function main() {
  const blocks = [
    {
      id: 'about-hero',
      type: 'hero',
      content: {
        title: 'Faith in\nEvery Stitch',
        subtitle: 'Notre Histoire',
        backgroundImage: '/hero-bg.png',
        alignment: 'center',
        overlay: true,
        overlayOpacity: 40,
        height: '70vh'
      },
      settings: { padding: { top: 0, bottom: 0, left: 0, right: 0 } }
    },
    {
      id: 'about-manifesto',
      type: 'manifesto',
      content: {
        title: "Plus qu'une marque,\nun mouvement.",
        text1: "Faith Shop est né d'une conviction simple : la mode peut être un vecteur de valeurs. Nous créons des pièces intemporelles qui allient esthétique minimaliste et messages profonds.",
        text2: "Chaque vêtement est conçu comme une toile vierge sur laquelle s'expriment la foi, l'espoir et l'amour. Nous ne suivons pas les tendances éphémères, nous construisons un style durable.",
        brandName: 'Faith-Shop',
        layout: 'left'
      },
      settings: { padding: { top: 96, bottom: 96, left: 0, right: 0 } }
    },
    {
      id: 'about-values',
      type: 'values',
      content: {
        values: [
          {
            title: 'Éthique',
            text: "Nous privilégions des matières biologiques et une production responsable. Le respect de l'humain et de la planète est au cœur de notre démarche."
          },
          {
            title: 'Qualité',
            text: "Pas de compromis. Des cotons épais (240gsm+), des coutures renforcées et des finitions impeccables pour des vêtements qui durent."
          },
          {
            title: 'Communauté',
            text: "Faith Shop rassemble ceux qui croient en quelque chose de plus grand. Une famille unie par des valeurs communes."
          }
        ],
        backgroundColor: 'hsl(var(--foreground))',
        textColor: 'hsl(var(--background))'
      },
      settings: { padding: { top: 96, bottom: 96, left: 0, right: 0 } }
    },
    {
      id: 'about-quote',
      type: 'quote',
      content: {
        text: "La mode passe, le style reste. La foi est éternelle.",
        author: '— Le Fondateur',
        backgroundColor: 'hsl(var(--secondary) / 0.1)'
      },
      settings: { padding: { top: 128, bottom: 128, left: 0, right: 0 } }
    }
  ]

  await prisma.pageContent.update({
    where: { slug: 'about' },
    data: {
      content: JSON.stringify({ blocks })
    }
  })

  console.log('✅ About page updated with correct blocks!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
