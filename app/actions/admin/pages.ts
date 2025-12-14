'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface PageSection {
  id: string
  type: 'hero' | 'text' | 'image' | 'cta' | 'products' | 'testimonials' | 'gallery' | 'faq' | 'newsletter' | 'stats' | 'team' | 'contact' | 'video' | 'spacer' | 'divider'
  content: Record<string, any>
  sortOrder?: number
}

export interface PageContentData {
  slug: string
  title: string
  metaTitle?: string
  metaDescription?: string
  sections: PageSection[]
  isPublished: boolean
}

// Récupérer toutes les pages
export async function getPages() {
  const pages = await prisma.pageContent.findMany({
    orderBy: { updatedAt: 'desc' },
  })

  return pages.map(page => ({
    ...page,
    sections: JSON.parse(page.content) as PageSection[],
  }))
}

// Récupérer une page par slug
export async function getPageBySlug(slug: string) {
  const page = await prisma.pageContent.findUnique({
    where: { slug },
  })

  if (!page) return null

  return {
    ...page,
    sections: JSON.parse(page.content) as PageSection[],
  }
}

// Créer ou mettre à jour une page
export async function savePage(data: PageContentData) {
  const content = JSON.stringify(data.sections)

  const page = await prisma.pageContent.upsert({
    where: { slug: data.slug },
    update: {
      title: data.title,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      content,
      isPublished: data.isPublished,
    },
    create: {
      slug: data.slug,
      title: data.title,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      content,
      isPublished: data.isPublished,
    },
  })

  revalidatePath('/admin/settings/pages')
  return page
}

// Supprimer une page
export async function deletePage(slug: string) {
  // Protéger les pages système
  if (['home', 'about', 'contact'].includes(slug)) {
    throw new Error('Impossible de supprimer une page système')
  }

  await prisma.pageContent.delete({
    where: { slug },
  })

  revalidatePath('/admin/settings/pages')
}
