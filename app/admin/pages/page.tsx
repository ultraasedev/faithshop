import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PagesClient } from './PagesClient'
import { Skeleton } from '@/components/ui/skeleton'

// Template pages with fixed design that are editable
const TEMPLATE_PAGES = [
  { slug: 'home', title: 'Accueil', description: 'Page d\'accueil du site' },
  { slug: 'about', title: 'À propos', description: 'Page de présentation' },
  { slug: 'contact', title: 'Contact', description: 'Page de contact' },
  { slug: 'shop', title: 'Boutique', description: 'Liste des produits' },
  { slug: 'cgv', title: 'CGV', description: 'Conditions générales de vente' },
  { slug: 'legal', title: 'Mentions légales', description: 'Informations légales' },
  { slug: 'privacy', title: 'Confidentialité', description: 'Politique de confidentialité' },
  { slug: 'livraison', title: 'Livraison', description: 'Informations de livraison' },
]

async function getPages() {
  const pagesData = await prisma.pageContent.findMany({
    orderBy: { updatedAt: 'desc' }
  })

  // Convert to format expected by PagesClient
  const dynamicPages = pagesData.map(page => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    status: page.isPublished ? 'PUBLISHED' : 'DRAFT' as const,
    isHomepage: page.slug === 'home',
    template: null as string | null,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    _count: { versions: 0 }
  }))

  // Add template pages (fixed design, editable content)
  const templatePages = TEMPLATE_PAGES.map(tp => ({
    id: `template-${tp.slug}`,
    title: tp.title,
    slug: tp.slug,
    status: 'PUBLISHED' as const,
    isHomepage: false,
    template: 'fixed',
    metaTitle: tp.title,
    metaDescription: tp.description,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { versions: 0 }
  }))

  return [...templatePages, ...dynamicPages]
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  )
}

async function PagesContent() {
  const pages = await getPages()
  return <PagesClient pages={pages} />
}

export default function PagesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PagesContent />
    </Suspense>
  )
}
