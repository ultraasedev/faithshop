import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Aucun article dans le panier' },
        { status: 400 }
      );
    }

    // SÉCURITÉ: Recalculer le prix depuis la DB pour éviter la fraude
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const productId = item.productId || item.id;

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, price: true, stock: true, isActive: true, productType: true }
      });

      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Produit ${item.name || 'inconnu'} non disponible` },
          { status: 400 }
        );
      }

      // Skip stock check for Print on Demand products
      if (product.productType !== 'PRINT_ON_DEMAND' && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${product.name}. Stock disponible: ${product.stock}` },
          { status: 400 }
        );
      }

      const itemTotal = Number(product.price) * item.quantity;
      total += itemTotal;

      validatedItems.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: item.quantity,
        image: item.image,
        color: item.color,
        size: item.size
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // En centimes
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always'
      },
      metadata: {
        items: JSON.stringify(validatedItems)
      }
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}
