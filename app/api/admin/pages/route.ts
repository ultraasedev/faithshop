import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { versions: true }
        }
      }
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Erreur lors de la récupération des pages:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, template, status, duplicateFrom } = body

    // Check if slug already exists
    const existingPage = await prisma.page.findFirst({
      where: { slug }
    })

    if (existingPage) {
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 400 })
    }

    // If duplicating, get the source page content
    let content = { blocks: [] }
    if (duplicateFrom) {
      const sourcePage = await prisma.page.findUnique({
        where: { id: duplicateFrom },
        include: {
          versions: {
            orderBy: { version: 'desc' },
            take: 1
          }
        }
      })

      if (sourcePage?.versions[0]?.content) {
        content = typeof sourcePage.versions[0].content === 'string'
          ? JSON.parse(sourcePage.versions[0].content)
          : sourcePage.versions[0].content as { blocks: unknown[] }
      }
    } else if (template && template !== 'blank') {
      content = getTemplateContent(template)
    }

    // Create the page
    const page = await prisma.page.create({
      data: {
        title,
        slug,
        template,
        status: status || 'DRAFT',
        isHomepage: false
      }
    })

    // Create initial version
    await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        version: 1,
        content: JSON.stringify(content),
        publishedById: session.user.id
      }
    })

    revalidatePath('/admin/pages')

    return NextResponse.json(page)
  } catch (error) {
    console.error('Erreur lors de la création de la page:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function getTemplateContent(template: string): { blocks: unknown[] } {
  const templates: Record<string, { blocks: unknown[] }> = {
    landing: {
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            title: 'Bienvenue sur notre site',
            subtitle: 'Découvrez nos produits exceptionnels',
            buttonText: 'Découvrir',
            buttonLink: '/shop',
            alignment: 'center',
            overlay: true,
            overlayOpacity: 50
          },
          settings: { padding: { top: 0, bottom: 0, left: 0, right: 0 } }
        },
        {
          id: 'products-1',
          type: 'product-grid',
          content: {
            title: 'Nos produits vedettes',
            source: 'featured',
            columns: 4,
            limit: 8,
            showPrice: true,
            showAddToCart: true
          },
          settings: { padding: { top: 60, bottom: 60, left: 20, right: 20 } }
        },
        {
          id: 'testimonials-1',
          type: 'testimonials',
          content: {
            title: 'Ce que disent nos clients',
            items: [
              { name: 'Marie D.', text: 'Produits de qualité exceptionnelle !', rating: 5 },
              { name: 'Thomas L.', text: 'Livraison rapide et service client au top', rating: 5 }
            ],
            layout: 'grid'
          },
          settings: { padding: { top: 60, bottom: 60, left: 20, right: 20 }, backgroundColor: '#f8f8f8' }
        },
        {
          id: 'newsletter-1',
          type: 'newsletter',
          content: {
            title: 'Restez informé',
            description: 'Inscrivez-vous pour recevoir nos offres exclusives',
            buttonText: "S'inscrire",
            backgroundColor: '#000000'
          },
          settings: { padding: { top: 0, bottom: 0, left: 0, right: 0 } }
        }
      ]
    },
    about: {
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            title: 'Notre histoire',
            subtitle: 'Une passion pour la qualité depuis le début',
            alignment: 'center',
            overlay: true,
            overlayOpacity: 60
          },
          settings: { padding: { top: 0, bottom: 0, left: 0, right: 0 } }
        },
        {
          id: 'text-1',
          type: 'text',
          content: {
            content: '<h2>Notre mission</h2><p>Nous croyons en...</p>',
            alignment: 'center'
          },
          settings: { padding: { top: 60, bottom: 60, left: 40, right: 40 } }
        }
      ]
    },
    contact: {
      blocks: [
        {
          id: 'text-1',
          type: 'text',
          content: {
            content: '<h1 style="text-align: center">Contactez-nous</h1><p style="text-align: center">Nous sommes là pour vous aider</p>',
            alignment: 'center'
          },
          settings: { padding: { top: 60, bottom: 40, left: 20, right: 20 } }
        },
        {
          id: 'contact-1',
          type: 'contact-form',
          content: {
            title: '',
            fields: ['name', 'email', 'subject', 'message'],
            submitText: 'Envoyer le message',
            successMessage: 'Message envoyé avec succès !'
          },
          settings: { padding: { top: 0, bottom: 60, left: 20, right: 20 } }
        }
      ]
    },
    faq: {
      blocks: [
        {
          id: 'text-1',
          type: 'text',
          content: {
            content: '<h1 style="text-align: center">Questions fréquentes</h1>',
            alignment: 'center'
          },
          settings: { padding: { top: 60, bottom: 20, left: 20, right: 20 } }
        },
        {
          id: 'faq-1',
          type: 'faq',
          content: {
            title: '',
            items: [
              { question: 'Comment puis-je suivre ma commande ?', answer: 'Vous pouvez suivre votre commande depuis votre espace client.' },
              { question: 'Quels sont les délais de livraison ?', answer: 'Les délais sont généralement de 2 à 5 jours ouvrés.' },
              { question: 'Comment effectuer un retour ?', answer: 'Contactez-nous dans les 30 jours suivant la réception.' }
            ]
          },
          settings: { padding: { top: 20, bottom: 60, left: 20, right: 20 } }
        }
      ]
    }
  }

  return templates[template] || { blocks: [] }
}
