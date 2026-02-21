import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event)
        break

      case 'product.updated':
        await handleProductUpdated(event)
        break

      case 'product.deleted':
        await handleProductDeleted(event)
        break

      case 'price.updated':
        await handlePriceUpdated(event)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new NextResponse('Error processing webhook', { status: 500 })
  }

  return new NextResponse(null, { status: 200 })
}

async function handlePaymentSuccess(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    console.log(`[Webhook] payment_intent.succeeded: ${paymentIntent.id}`)

    // Vérifier si une commande existe déjà pour ce PaymentIntent (idempotence)
    const existingOrder = await prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id }
    })
    if (existingOrder) {
      console.log(`[Webhook] Commande déjà créée pour ${paymentIntent.id}: ${existingOrder.orderNumber}`)
      return
    }

    // Récupérer les métadonnées
    let items: any[] = []
    try {
      items = JSON.parse(paymentIntent.metadata.items || '[]')
    } catch (parseError) {
      console.error(`[Webhook] Erreur parsing items metadata:`, parseError)
      throw new Error('Invalid items metadata')
    }

    if (items.length === 0) {
      console.error(`[Webhook] Aucun item dans les metadata du PaymentIntent ${paymentIntent.id}`)
      throw new Error('No items in payment metadata')
    }

    const shippingDetails = paymentIntent.shipping

    // Récupérer l'email client - depuis receipt_email ou billing_details
    let customerEmail = paymentIntent.receipt_email || ''
    let customerName = shippingDetails?.name || ''

    if (!customerEmail && paymentIntent.latest_charge) {
      try {
        const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string)
        customerEmail = charge.billing_details?.email || ''
        if (!customerName) customerName = charge.billing_details?.name || ''
      } catch (chargeError) {
        console.error('[Webhook] Erreur récupération charge:', chargeError)
      }
    }

    // Créer la commande
    try {
      const orderNumber = `CMD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      const total = paymentIntent.amount / 100

      // GESTION STOCK: Réserver le stock avant de créer la commande
      const stockUpdates = [];
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.id },
          select: { stock: true, name: true }
        });

        if (!product || product.stock < item.quantity) {
          console.error(`[Webhook] Stock insuffisant pour ${item.name} (demandé: ${item.quantity}, dispo: ${product?.stock ?? 0})`);
          // On crée quand même la commande pour ne pas perdre la vente - le stock sera géré manuellement
        } else {
          stockUpdates.push(
            prisma.product.update({
              where: { id: item.id },
              data: { stock: { decrement: item.quantity } }
            })
          );
        }
      }

      // Transaction pour créer commande + mettre à jour stock
      const [order] = await prisma.$transaction([
        prisma.order.create({
          data: {
            orderNumber,
            total,
            subtotal: total,
            taxAmount: 0,
            shippingCost: 0,
            status: 'PAID',
            paymentStatus: 'COMPLETED',
            stripePaymentIntentId: paymentIntent.id,
            guestName: customerName || 'Client',
            guestEmail: customerEmail || `guest-${Date.now()}@faith-shop.fr`,
            shippingAddress: [
              shippingDetails?.address?.line1,
              shippingDetails?.address?.line2,
              shippingDetails?.address?.postal_code,
              shippingDetails?.address?.city,
              shippingDetails?.address?.country
            ].filter(Boolean).join(', ') || 'Non renseignée',
            shippingCity: shippingDetails?.address?.city || '',
            shippingZip: shippingDetails?.address?.postal_code || '',
            shippingCountry: shippingDetails?.address?.country || 'FR',
            items: {
              create: items.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
                productName: item.name,
                productImage: item.image,
                color: item.color,
                size: item.size
              }))
            }
          }
        }),
        ...stockUpdates
      ])

      // Créer l'enregistrement d'expédition
      await prisma.shipping.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
          carrier: 'Standard',
        }
      })

      console.log(`[Webhook] Commande créée avec succès: ${order.orderNumber} (${order.id})`)

      // Envoyer l'email de confirmation
      try {
        const { sendOrderConfirmationEmail } = await import('@/lib/email')
        await sendOrderConfirmationEmail(
          order.guestEmail || customerEmail || '',
          order.guestName || 'Client',
          order.orderNumber,
          {
            items: items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              color: item.color,
              size: item.size
            })),
            subtotal: order.subtotal,
            shipping: order.shippingCost,
            total: order.total,
            shippingAddress: order.shippingAddress
          }
        )
        console.log('[Webhook] Email de confirmation envoyé')
      } catch (emailError) {
        console.error('[Webhook] Erreur envoi email:', emailError)
      }
    } catch (error) {
      console.error('[Webhook] Erreur lors de la création de la commande:', error)
      throw error
    }
}

async function handleProductUpdated(event: Stripe.Event) {
  const stripeProduct = event.data.object as Stripe.Product

  console.log(`Handling product update from Stripe: ${stripeProduct.id}`)

  try {
    // Trouver le produit local correspondant
    const localProduct = await prisma.product.findFirst({
      where: { stripeProductId: stripeProduct.id }
    })

    if (!localProduct) {
      console.log(`Product not found locally: ${stripeProduct.id}`)
      return
    }

    // Mettre à jour les informations du produit (sauf les vidéos que Stripe ne gère pas)
    const updateData: any = {
      name: stripeProduct.name,
      description: stripeProduct.description || undefined,
      isActive: stripeProduct.active
    }

    // Gérer les images (filtrer les vidéos si présentes)
    if (stripeProduct.images && stripeProduct.images.length > 0) {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      const validImages = stripeProduct.images.filter(url =>
        imageExtensions.some(ext => url.toLowerCase().includes(ext))
      )

      // Conserver les vidéos existantes et ajouter les nouvelles images
      const existingVideos = localProduct.images.filter(url =>
        !imageExtensions.some(ext => url.toLowerCase().includes(ext))
      )

      updateData.images = [...validImages, ...existingVideos]
    }

    await prisma.product.update({
      where: { id: localProduct.id },
      data: updateData
    })

    console.log(`Product updated locally: ${localProduct.id}`)
  } catch (error) {
    console.error('Error updating product from Stripe:', error)
    throw error
  }
}

async function handleProductDeleted(event: Stripe.Event) {
  const stripeProduct = event.data.object as Stripe.Product

  console.log(`Handling product deletion from Stripe: ${stripeProduct.id}`)

  try {
    // Trouver le produit local correspondant
    const localProduct = await prisma.product.findFirst({
      where: { stripeProductId: stripeProduct.id }
    })

    if (!localProduct) {
      console.log(`Product not found locally: ${stripeProduct.id}`)
      return
    }

    // Au lieu de supprimer, on peut désactiver le produit
    await prisma.product.update({
      where: { id: localProduct.id },
      data: {
        isActive: false,
        stripeProductId: null // Dissocier de Stripe
      }
    })

    console.log(`Product deactivated locally: ${localProduct.id}`)
  } catch (error) {
    console.error('Error handling product deletion from Stripe:', error)
    throw error
  }
}

async function handlePriceUpdated(event: Stripe.Event) {
  const stripePrice = event.data.object as Stripe.Price

  console.log(`Handling price update from Stripe: ${stripePrice.id}`)

  try {
    // Trouver le produit local par le product ID de Stripe
    if (typeof stripePrice.product !== 'string') return

    const localProduct = await prisma.product.findFirst({
      where: { stripeProductId: stripePrice.product }
    })

    if (!localProduct) {
      console.log(`Product not found locally for price: ${stripePrice.product}`)
      return
    }

    // Vérifier si c'est le prix par défaut (actif)
    if (stripePrice.active) {
      const newPrice = stripePrice.unit_amount ? stripePrice.unit_amount / 100 : 0

      await prisma.product.update({
        where: { id: localProduct.id },
        data: { price: newPrice }
      })

      console.log(`Price updated locally: ${localProduct.id} -> ${newPrice}€`)
    }
  } catch (error) {
    console.error('Error updating price from Stripe:', error)
    throw error
  }
}
