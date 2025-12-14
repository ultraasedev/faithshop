import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPages() {
  console.log('🌱 Seeding pages...')

  const defaultPages = [
    {
      slug: 'home',
      title: 'Accueil',
      metaTitle: 'Faith-Shop - Vêtements chrétiens et articles de foi',
      metaDescription: 'Découvrez notre collection exclusive de vêtements et accessoires chrétiens. Mode, foi et style réunis dans une boutique en ligne unique.',
      content: JSON.stringify([
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            title: 'Bienvenue chez Faith-Shop',
            subtitle: 'Votre boutique de vêtements chrétiens',
            image: '/hero-faith.jpg',
            ctaText: 'Découvrir',
            ctaLink: '/shop'
          }
        },
        {
          id: 'text-1',
          type: 'text',
          content: {
            title: 'Notre Mission',
            text: 'Nous sommes passionnés par la création de vêtements qui témoignent de votre foi avec style et élégance.'
          }
        }
      ]),
      isPublished: true
    },
    {
      slug: 'about',
      title: 'À propos',
      metaTitle: 'À propos de Faith-Shop - Notre histoire',
      metaDescription: 'Découvrez l\'histoire de Faith-Shop, notre passion pour la mode chrétienne et notre engagement envers nos clients.',
      content: JSON.stringify([
        {
          id: 'hero-about',
          type: 'hero',
          content: {
            title: 'À propos de Faith-Shop',
            subtitle: 'Notre histoire, notre passion',
            image: '/about-hero.jpg',
            ctaText: 'Contactez-nous',
            ctaLink: '/contact'
          }
        },
        {
          id: 'text-about',
          type: 'text',
          content: {
            title: 'Notre Histoire',
            text: 'Faith-Shop est né d\'une passion pour allier foi et mode. Nous croyons que votre style peut témoigner de vos valeurs.'
          }
        }
      ]),
      isPublished: true
    },
    {
      slug: 'contact',
      title: 'Contact',
      metaTitle: 'Contact - Faith-Shop',
      metaDescription: 'Contactez l\'équipe Faith-Shop pour toute question ou demande d\'information.',
      content: JSON.stringify([
        {
          id: 'hero-contact',
          type: 'hero',
          content: {
            title: 'Contactez-nous',
            subtitle: 'Nous sommes là pour vous aider',
            image: '/contact-hero.jpg'
          }
        },
        {
          id: 'contact-form',
          type: 'contact',
          content: {
            title: 'Formulaire de contact',
            description: 'N\'hésitez pas à nous écrire pour toute question.'
          }
        }
      ]),
      isPublished: true
    }
  ]

  for (const page of defaultPages) {
    await prisma.pageContent.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    })
    console.log(`✅ Page "${page.title}" créée/mise à jour`)
  }

  console.log('🎉 Pages seeded successfully!')
}

seedPages()
  .catch((e) => {
    console.error('❌ Error seeding pages:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })