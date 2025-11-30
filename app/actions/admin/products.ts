'use server'

import { prisma } from '@/lib/prisma'
import { createStripeProduct, stripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth' // Assurez-vous que auth est bien configuré

// Type pour le formulaire
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
  // 1. Vérification Auth & Role
  // Note: Pour l'instant on simule ou on utilise la session si dispo.
  // const session = await auth()
  // if (session?.user?.role !== 'ADMIN') {
  //   return { message: 'Non autorisé' }
  // }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string)
  const colors = (formData.get('colors') as string).split(',').map(c => c.trim())
  const sizes = (formData.get('sizes') as string).split(',').map(s => s.trim())
  // Images: Dans un vrai cas, on récupère les URLs après upload Blob
  // Ici on attend une string séparée par des virgules pour simplifier la démo
  const images = (formData.get('images') as string).split(',').map(i => i.trim())

  if (!name || !price) {
    return { message: 'Nom et prix requis' }
  }

  try {
    // 2. Créer dans Stripe d'abord (Best practice: si Stripe fail, on ne pollue pas la DB)
    const { stripeProductId, stripePriceId } = await createStripeProduct(name, description, price, images)

    // 3. Créer dans la DB locale
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
