'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Get page content from SiteConfig
export async function getPageConfig(pageSlug: string) {
  const configs = await prisma.siteConfig.findMany({
    where: { category: `page_${pageSlug}` }
  })

  const values: Record<string, string> = {}
  configs.forEach(config => {
    // Remove the page_ prefix from key for simplicity
    const key = config.key.replace(`page_${pageSlug}_`, '')
    values[key] = config.value
  })

  return values
}

// Save page content to SiteConfig
export async function savePageConfig(pageSlug: string, values: Record<string, string>) {
  try {
    const category = `page_${pageSlug}`

    // Upsert each value
    for (const [key, value] of Object.entries(values)) {
      const fullKey = `page_${pageSlug}_${key}`

      await prisma.siteConfig.upsert({
        where: { key: fullKey },
        update: { value },
        create: {
          key: fullKey,
          value,
          type: key.includes('image') ? 'image' : key.includes('content') || key.includes('description') ? 'textarea' : 'text',
          category,
          label: key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
        }
      })
    }

    // Revalidate the public page
    revalidatePath(`/${pageSlug}`)
    revalidatePath(`/admin/pages/${pageSlug}`)

    return { success: true }
  } catch (error) {
    console.error('Error saving page config:', error)
    return { success: false, error: 'Erreur lors de la sauvegarde' }
  }
}

// Initialize default content for a page
export async function initPageDefaults(pageSlug: string, defaults: Record<string, string>) {
  const category = `page_${pageSlug}`

  for (const [key, value] of Object.entries(defaults)) {
    const fullKey = `page_${pageSlug}_${key}`

    // Only create if doesn't exist
    const existing = await prisma.siteConfig.findUnique({ where: { key: fullKey } })
    if (!existing) {
      await prisma.siteConfig.create({
        data: {
          key: fullKey,
          value,
          type: key.includes('image') ? 'image' : key.includes('content') || key.includes('description') ? 'textarea' : 'text',
          category,
          label: key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
        }
      })
    }
  }
}
