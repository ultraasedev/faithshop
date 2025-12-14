'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'

// ==================== SITE CONFIG ====================

// Récupérer toutes les configurations
export async function getSiteConfigs(category?: string) {
  const where = category ? { category } : {}
  return prisma.siteConfig.findMany({
    where,
    orderBy: [{ category: 'asc' }, { key: 'asc' }],
  })
}

// Récupérer une configuration par clé
export async function getSiteConfig(key: string) {
  return prisma.siteConfig.findUnique({ where: { key } })
}

// Mettre à jour ou créer une configuration
export async function upsertSiteConfig(data: {
  key: string
  value: string
  type: string
  category: string
  label?: string
  description?: string
}) {
  const config = await prisma.siteConfig.upsert({
    where: { key: data.key },
    update: {
      value: data.value,
      type: data.type,
      category: data.category,
      label: data.label,
      description: data.description,
    },
    create: data,
  })

  revalidatePath('/admin/settings')
  revalidatePath('/') // Revalider le site public
  return config
}

// Mettre à jour plusieurs configurations d'un coup
export async function updateSiteConfigs(configs: Array<{ key: string; value: string }>) {
  const updates = configs.map((config) =>
    prisma.siteConfig.update({
      where: { key: config.key },
      data: { value: config.value },
    })
  )

  await Promise.all(updates)
  revalidatePath('/admin/settings')
  revalidatePath('/')
}

// Supprimer une configuration
export async function deleteSiteConfig(key: string) {
  await prisma.siteConfig.delete({ where: { key } })
  revalidatePath('/admin/settings')
}

// ==================== THEMES ====================

// Récupérer tous les thèmes
export async function getThemes() {
  return prisma.themeConfig.findMany({
    orderBy: { name: 'asc' },
  })
}

// Récupérer le thème actif
export async function getActiveTheme() {
  return prisma.themeConfig.findFirst({
    where: { isDefault: true },
  })
}

// Créer ou mettre à jour un thème
export async function upsertTheme(data: {
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  mutedColor: string
  borderColor: string
  successColor?: string
  warningColor?: string
  errorColor?: string
  isDefault?: boolean
}) {
  // Si ce thème devient le défaut, désactiver les autres
  if (data.isDefault) {
    await prisma.themeConfig.updateMany({
      data: { isDefault: false },
    })
  }

  const theme = await prisma.themeConfig.upsert({
    where: { name: data.name },
    update: data,
    create: data,
  })

  revalidatePath('/admin/settings')
  revalidatePath('/')
  return theme
}

// Définir le thème par défaut
export async function setDefaultTheme(name: string) {
  await prisma.themeConfig.updateMany({
    data: { isDefault: false },
  })

  const theme = await prisma.themeConfig.update({
    where: { name },
    data: { isDefault: true },
  })

  revalidatePath('/admin/settings')
  revalidatePath('/')
  return theme
}

// Supprimer un thème
export async function deleteTheme(name: string) {
  // Ne pas supprimer le thème par défaut
  const theme = await prisma.themeConfig.findUnique({ where: { name } })
  if (theme?.isDefault) {
    throw new Error('Impossible de supprimer le thème par défaut')
  }

  await prisma.themeConfig.delete({ where: { name } })
  revalidatePath('/admin/settings')
}

// ==================== PAGE CONTENT ====================

// Récupérer le contenu d'une page
export async function getPageContent(slug: string) {
  return prisma.pageContent.findUnique({ where: { slug } })
}

// Récupérer toutes les pages
export async function getAllPages() {
  return prisma.pageContent.findMany({
    orderBy: { slug: 'asc' },
  })
}

// Mettre à jour le contenu d'une page
export async function updatePageContent(slug: string, data: {
  title?: string
  metaTitle?: string
  metaDescription?: string
  content?: string
  isPublished?: boolean
}) {
  const page = await prisma.pageContent.upsert({
    where: { slug },
    update: data,
    create: {
      slug,
      title: data.title || slug,
      content: data.content || '{}',
      ...data,
    },
  })

  revalidatePath('/admin/settings')
  revalidatePath(`/${slug}`)
  return page
}

// ==================== MEDIA ====================

// Upload une image ou vidéo vers Vercel Blob
export async function uploadMedia(formData: FormData) {
  const file = formData.get('file') as File
  const folder = formData.get('folder') as string || 'general'

  if (!file) {
    throw new Error('Aucun fichier fourni')
  }

  // Types autorisés
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
  const isImage = allowedImageTypes.includes(file.type)
  const isVideo = allowedVideoTypes.includes(file.type)

  if (!isImage && !isVideo) {
    throw new Error('Seules les images (JPEG, PNG, WebP, GIF) et vidéos (MP4, WebM, MOV) sont autorisées')
  }

  // Vérifier la taille
  const maxImageSize = 10 * 1024 * 1024 // 10MB pour les images
  const maxVideoSize = 100 * 1024 * 1024 // 100MB pour les vidéos
  const maxSize = isVideo ? maxVideoSize : maxImageSize

  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024)
    throw new Error(`Le fichier ne doit pas dépasser ${maxSizeMB}MB`)
  }

  // Upload vers Vercel Blob
  const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
    access: 'public',
  })

  // Sauvegarder en BDD
  const media = await prisma.media.create({
    data: {
      filename: file.name,
      url: blob.url,
      mimeType: file.type,
      size: file.size,
      folder,
    },
  })

  revalidatePath('/admin/media')
  return media
}

// Récupérer tous les médias
export async function getMedias(folder?: string) {
  const where = folder ? { folder } : {}
  return prisma.media.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
}

// Supprimer un média
export async function deleteMedia(id: string) {
  // Note: On pourrait aussi supprimer de Vercel Blob via leur API
  await prisma.media.delete({ where: { id } })
  revalidatePath('/admin/media')
}

// ==================== INIT DEFAULT CONFIG ====================

// Initialiser les configurations par défaut
export async function initDefaultConfigs() {
  const defaultConfigs = [
    // General
    { key: 'site_name', value: 'FAITH SHOP', type: 'text', category: 'general', label: 'Nom du site' },
    { key: 'site_description', value: 'Boutique de mode premium', type: 'text', category: 'general', label: 'Description du site' },
    { key: 'site_logo', value: '/logo2.png', type: 'image', category: 'general', label: 'Logo' },
    { key: 'site_favicon', value: '/favicon.jpeg', type: 'image', category: 'general', label: 'Favicon' },

    // Homepage
    { key: 'home_hero_title', value: 'Nouvelle Collection', type: 'text', category: 'homepage', label: 'Titre Hero' },
    { key: 'home_hero_subtitle', value: 'Découvrez notre sélection exclusive', type: 'text', category: 'homepage', label: 'Sous-titre Hero' },
    { key: 'home_hero_image', value: '/hero.jpg', type: 'image', category: 'homepage', label: 'Image Hero' },
    { key: 'home_hero_cta_text', value: 'Découvrir', type: 'text', category: 'homepage', label: 'Texte bouton Hero' },
    { key: 'home_hero_cta_link', value: '/shop', type: 'text', category: 'homepage', label: 'Lien bouton Hero' },

    // Footer
    { key: 'footer_text', value: '© 2024 Faith Shop. Tous droits réservés.', type: 'text', category: 'footer', label: 'Texte footer' },
    { key: 'footer_instagram', value: 'https://instagram.com/faithshop', type: 'text', category: 'footer', label: 'Instagram' },
    { key: 'footer_facebook', value: '', type: 'text', category: 'footer', label: 'Facebook' },
    { key: 'footer_twitter', value: '', type: 'text', category: 'footer', label: 'Twitter' },

    // Contact
    { key: 'contact_email', value: 'contact@faith-shop.com', type: 'text', category: 'contact', label: 'Email contact' },
    { key: 'contact_phone', value: '+33 1 23 45 67 89', type: 'text', category: 'contact', label: 'Téléphone' },
    { key: 'contact_address', value: '123 Rue de la Mode, 75001 Paris', type: 'text', category: 'contact', label: 'Adresse' },
  ]

  for (const config of defaultConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    })
  }

  // Créer les thèmes par défaut
  const defaultThemes = [
    {
      name: 'light',
      isDefault: true,
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      accentColor: '#666666',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      mutedColor: '#6b7280',
      borderColor: '#e5e7eb',
      successColor: '#22c55e',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
    },
    {
      name: 'dark',
      isDefault: false,
      primaryColor: '#ffffff',
      secondaryColor: '#000000',
      accentColor: '#a3a3a3',
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      mutedColor: '#a3a3a3',
      borderColor: '#262626',
      successColor: '#22c55e',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
    },
  ]

  for (const theme of defaultThemes) {
    await prisma.themeConfig.upsert({
      where: { name: theme.name },
      update: {},
      create: theme,
    })
  }

  revalidatePath('/admin/settings')
}
