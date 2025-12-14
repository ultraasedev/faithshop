'use server'

import { prisma } from '@/lib/prisma'
import { createStripeProduct, stripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ProductState = {
  errors?: {
    name?: string[]
    price?: string[]
    stock?: string[]
    _form?: string[]
  }
  message?: string
}

export async function createProduct(prevState: ProductState, formData: FormData): Promise<ProductState> {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string)
  const colors = (formData.get('colors') as string).split(',').map(c => c.trim())
  const sizes = (formData.get('sizes') as string).split(',').map(s => s.trim())
  const images = (formData.get('images') as string).split(',').map(i => i.trim())

  if (!name || !price) {
    return { message: 'Nom et prix requis' }
  }

  try {
    const { stripeProductId, stripePriceId } = await createStripeProduct(name, description, price, images)

    await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        colors,
        sizes,
        images,
        stripeProductId,
        stripePriceId
      }
    })

    revalidatePath('/admin/products')
    revalidatePath('/shop')
  } catch (error) {
    console.error('Erreur création produit:', error)
    return { message: 'Erreur lors de la création du produit' }
  }

  redirect('/admin/products')
}

export async function updateProductOld(id: string, prevState: ProductState, formData: FormData): Promise<ProductState> {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string)
  const colors = (formData.get('colors') as string).split(',').map(c => c.trim())
  const sizes = (formData.get('sizes') as string).split(',').map(s => s.trim())
  const images = (formData.get('images') as string).split(',').map(i => i.trim())

  try {
    // 1. Update local DB
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        colors,
        sizes,
        images,
      }
    })

    // 2. Sync with Stripe
    if (product.stripeProductId) {
      await stripe.products.update(product.stripeProductId, {
        name,
        description,
        images: images.slice(0, 8),
      })

      // Price update is tricky in Stripe (cannot update amount directly, need to create new price)
      // For simplicity here, we assume price doesn't change often or we handle it by creating new price
      // and updating the default_price of the product.
      if (product.stripePriceId) {
         const oldPrice = await stripe.prices.retrieve(product.stripePriceId);
         if (oldPrice.unit_amount !== Math.round(price * 100)) {
             const newPrice = await stripe.prices.create({
                 product: product.stripeProductId,
                 unit_amount: Math.round(price * 100),
                 currency: 'eur',
             });
             await prisma.product.update({
                 where: { id },
                 data: { stripePriceId: newPrice.id }
             });
         }
      }
    } else {
        // If for some reason it doesn't have stripe ID, create it
        const { stripeProductId, stripePriceId } = await createStripeProduct(name, description, price, images)
        await prisma.product.update({
            where: { id },
            data: { stripeProductId, stripePriceId }
        })
    }

    revalidatePath('/admin/products')
    revalidatePath('/shop')
    return { message: 'Produit mis à jour' }
  } catch (error) {
    console.error('Erreur mise à jour produit:', error)
    return { message: 'Erreur lors de la mise à jour' }
  }
}

export async function deleteProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return { message: 'Produit introuvable' }

    // Archive in Stripe
    if (product.stripeProductId) {
      try {
        await stripe.products.update(product.stripeProductId, { active: false })
      } catch (e) {
        console.error('Erreur archivage Stripe:', e)
      }
    }

    // Delete from DB
    await prisma.product.delete({ where: { id } })

    revalidatePath('/admin/products')
    revalidatePath('/shop')
    return { message: 'Produit supprimé' }
  } catch (error) {
    console.error('Erreur suppression produit:', error)
    return { message: 'Erreur lors de la suppression' }
  }
}

// Nouvelle fonction pour créer un produit avec le nouveau format
export async function createProductNew(data: {
  name: string
  description: string
  price: number
  stock: number
  images: string[]
  sizes: string[]
  colors: string[]
  isActive: boolean
  categoryId: string
}) {
  try {
    const { stripeProductId, stripePriceId } = await createStripeProduct(
      data.name,
      data.description,
      data.price,
      data.images
    )

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        colors: data.colors,
        sizes: data.sizes,
        images: data.images,
        isActive: data.isActive,
        stripeProductId,
        stripePriceId,
        categories: {
          connect: { id: data.categoryId }
        }
      },
      include: {
        categories: true
      }
    })

    revalidatePath('/admin/products')
    revalidatePath('/shop')

    return {
      success: true,
      product,
      message: 'Produit créé avec succès'
    }
  } catch (error) {
    console.error('Erreur création produit:', error)
    return {
      success: false,
      message: 'Erreur lors de la création du produit'
    }
  }
}

// Nouvelle fonction pour mettre à jour un produit avec le nouveau format
export async function updateProduct(id: string, data: {
  name: string
  description: string
  price: number
  stock: number
  images: string[]
  sizes: string[]
  colors: string[]
  isActive: boolean
  categoryId: string
}) {
  try {
    // 1. Update local DB
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        colors: data.colors,
        sizes: data.sizes,
        images: data.images,
        isActive: data.isActive,
        categories: {
          set: [{ id: data.categoryId }]
        }
      }
    })

    // 2. Sync with Stripe automatiquement
    if (product.stripeProductId) {
      await stripe.products.update(product.stripeProductId, {
        name: data.name,
        description: data.description,
        images: data.images.slice(0, 8),
        active: data.isActive
      })

      // Gestion du prix - créer un nouveau price si différent
      if (product.stripePriceId) {
        const oldPrice = await stripe.prices.retrieve(product.stripePriceId)
        if (oldPrice.unit_amount !== Math.round(data.price * 100)) {
          const newPrice = await stripe.prices.create({
            product: product.stripeProductId,
            unit_amount: Math.round(data.price * 100),
            currency: 'eur',
          })

          await prisma.product.update({
            where: { id },
            data: { stripePriceId: newPrice.id }
          })
        }
      }
    }

    revalidatePath('/admin/products')
    revalidatePath('/shop')

    return {
      success: true,
      message: 'Produit mis à jour et synchronisé avec Stripe'
    }
  } catch (error) {
    console.error('Erreur mise à jour produit:', error)
    return {
      success: false,
      message: 'Erreur lors de la mise à jour'
    }
  }
}
