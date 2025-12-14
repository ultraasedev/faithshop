'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type CollectionState = {
  errors?: {
    name?: string[]
    slug?: string[]
    _form?: string[]
  }
  message?: string
}

// Récupérer toutes les collections
export async function getCollections() {
  return prisma.collection.findMany({
    include: {
      products: {
        include: { product: true }
      }
    },
    orderBy: { sortOrder: 'asc' }
  })
}

// Récupérer une collection par ID
export async function getCollectionById(id: string) {
  return prisma.collection.findUnique({
    where: { id },
    include: {
      products: {
        include: { product: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })
}

// Récupérer une collection par slug
export async function getCollectionBySlug(slug: string) {
  return prisma.collection.findUnique({
    where: { slug },
    include: {
      products: {
        include: {
          product: {
            include: { reviews: true }
          }
        },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })
}

// Créer une nouvelle collection
export async function createCollection(prevState: CollectionState, formData: FormData): Promise<CollectionState> {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const slug = formData.get('slug') as string || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const image = formData.get('image') as string
  const metaTitle = formData.get('metaTitle') as string
  const metaDescription = formData.get('metaDescription') as string
  const isActive = formData.get('isActive') === 'true'
  const isFeatured = formData.get('isFeatured') === 'true'

  if (!name) {
    return {
      errors: { name: ['Le nom est requis'] },
      message: 'Erreur de validation'
    }
  }

  try {
    // Vérifier que le slug n'existe pas déjà
    const existingCollection = await prisma.collection.findUnique({
      where: { slug }
    })

    if (existingCollection) {
      return {
        errors: { slug: ['Ce slug existe déjà'] },
        message: 'Erreur de validation'
      }
    }

    await prisma.collection.create({
      data: {
        name,
        description,
        slug,
        image,
        metaTitle,
        metaDescription,
        isActive,
        isFeatured
      }
    })

    revalidatePath('/admin/collections')
    revalidatePath('/shop')
  } catch (error) {
    console.error('Erreur création collection:', error)
    return { message: 'Erreur lors de la création de la collection' }
  }

  redirect('/admin/collections')
}

// Mettre à jour une collection
export async function updateCollection(id: string, prevState: CollectionState, formData: FormData): Promise<CollectionState> {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const slug = formData.get('slug') as string
  const image = formData.get('image') as string
  const metaTitle = formData.get('metaTitle') as string
  const metaDescription = formData.get('metaDescription') as string
  const isActive = formData.get('isActive') === 'true'
  const isFeatured = formData.get('isFeatured') === 'true'

  try {
    await prisma.collection.update({
      where: { id },
      data: {
        name,
        description,
        slug,
        image,
        metaTitle,
        metaDescription,
        isActive,
        isFeatured
      }
    })

    revalidatePath('/admin/collections')
    revalidatePath('/shop')
    return { message: 'Collection mise à jour avec succès' }
  } catch (error) {
    console.error('Erreur mise à jour collection:', error)
    return { message: 'Erreur lors de la mise à jour' }
  }
}

// Supprimer une collection
export async function deleteCollection(id: string) {
  try {
    await prisma.collection.delete({ where: { id } })

    revalidatePath('/admin/collections')
    revalidatePath('/shop')
    return { message: 'Collection supprimée avec succès' }
  } catch (error) {
    console.error('Erreur suppression collection:', error)
    return { message: 'Erreur lors de la suppression' }
  }
}

// Ajouter un produit à une collection
export async function addProductToCollection(collectionId: string, productId: string, sortOrder = 0) {
  try {
    await prisma.productCollection.create({
      data: {
        collectionId,
        productId,
        sortOrder
      }
    })

    revalidatePath('/admin/collections')
    revalidatePath(`/admin/collections/${collectionId}`)
    return { message: 'Produit ajouté à la collection' }
  } catch (error) {
    console.error('Erreur ajout produit collection:', error)
    return { message: 'Erreur lors de l\'ajout' }
  }
}

// Retirer un produit d'une collection
export async function removeProductFromCollection(collectionId: string, productId: string) {
  try {
    await prisma.productCollection.deleteMany({
      where: {
        collectionId,
        productId
      }
    })

    revalidatePath('/admin/collections')
    revalidatePath(`/admin/collections/${collectionId}`)
    return { message: 'Produit retiré de la collection' }
  } catch (error) {
    console.error('Erreur suppression produit collection:', error)
    return { message: 'Erreur lors de la suppression' }
  }
}

// Réorganiser les produits dans une collection
export async function reorderProductsInCollection(updates: { id: string; sortOrder: number }[]) {
  try {
    const updateQueries = updates.map(update =>
      prisma.productCollection.update({
        where: { id: update.id },
        data: { sortOrder: update.sortOrder }
      })
    )

    await Promise.all(updateQueries)

    revalidatePath('/admin/collections')
    return { message: 'Ordre mis à jour' }
  } catch (error) {
    console.error('Erreur réorganisation:', error)
    return { message: 'Erreur lors de la réorganisation' }
  }
}

// Récupérer les collections publiques pour le front
export async function getPublicCollections() {
  return prisma.collection.findMany({
    where: { isActive: true },
    include: {
      products: {
        include: {
          product: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              slug: true
            }
          }
        },
        orderBy: { sortOrder: 'asc' }
      }
    },
    orderBy: [
      { isFeatured: 'desc' },
      { sortOrder: 'asc' },
      { createdAt: 'desc' }
    ]
  })
}

// Récupérer les collections en vedette
export async function getFeaturedCollections() {
  return prisma.collection.findMany({
    where: {
      isActive: true,
      isFeatured: true
    },
    include: {
      products: {
        include: {
          product: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              slug: true
            }
          }
        },
        orderBy: { sortOrder: 'asc' },
        take: 8 // Limiter à 8 produits pour l'aperçu
      }
    },
    orderBy: { sortOrder: 'asc' },
    take: 6
  })
}