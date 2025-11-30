'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ==================== PAGES ====================

export async function getPages() {
  return prisma.pageContent.findMany({
    orderBy: { updatedAt: 'desc' }
  })
}

export async function getPage(id: string) {
  return prisma.pageContent.findUnique({ where: { id } })
}

export async function createPage(data: {
  title: string
  slug: string
  content: string
  metaTitle?: string
  metaDescription?: string
  isPublished?: boolean
}) {
  const page = await prisma.pageContent.create({
    data
  })
  revalidatePath('/admin/pages')
  return page
}

export async function updatePage(id: string, data: {
  title?: string
  slug?: string
  content?: string
  metaTitle?: string
  metaDescription?: string
  isPublished?: boolean
}) {
  const page = await prisma.pageContent.update({
    where: { id },
    data
  })
  revalidatePath('/admin/pages')
  revalidatePath(`/${page.slug}`)
  return page
}

export async function deletePage(id: string) {
  await prisma.pageContent.delete({ where: { id } })
  revalidatePath('/admin/pages')
}

// ==================== MENUS ====================

export async function getMenus() {
  return prisma.menu.findMany({
    include: { items: { orderBy: { order: 'asc' } } }
  })
}

export async function getMenu(handle: string) {
  return prisma.menu.findUnique({
    where: { handle },
    include: { 
      items: { 
        orderBy: { order: 'asc' },
        include: { items: { orderBy: { order: 'asc' } } } // Sous-menus
      } 
    }
  })
}

export async function upsertMenu(handle: string, title: string, items: any[]) {
  // 1. Créer ou mettre à jour le menu
  const menu = await prisma.menu.upsert({
    where: { handle },
    update: { title },
    create: { handle, title }
  })

  // 2. Gérer les items (simplifié: on supprime tout et on recrée pour l'instant)
  // Dans une vraie app, on ferait un diff plus intelligent
  await prisma.menuItem.deleteMany({ where: { menuId: menu.id } })

  for (const [index, item] of items.entries()) {
    await prisma.menuItem.create({
      data: {
        menuId: menu.id,
        title: item.title,
        url: item.url,
        order: index,
        // Gérer les sous-menus si besoin
      }
    })
  }

  revalidatePath('/')
  return menu
}

// ==================== INTEGRATIONS ====================

export async function getIntegrations() {
  return prisma.integration.findMany()
}

export async function updateIntegration(provider: string, data: {
  isEnabled: boolean
  config: any
}) {
  const integration = await prisma.integration.upsert({
    where: { provider },
    update: {
      isEnabled: data.isEnabled,
      config: JSON.stringify(data.config)
    },
    create: {
      provider,
      name: provider === 'google_analytics' ? 'Google Analytics' : 
            provider === 'google_ads' ? 'Google Ads' : 
            provider === 'facebook_pixel' ? 'Facebook Pixel' : provider,
      isEnabled: data.isEnabled,
      config: JSON.stringify(data.config)
    }
  })
  
  revalidatePath('/')
  return integration
}
