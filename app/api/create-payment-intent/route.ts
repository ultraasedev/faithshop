import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📦 Payment Intent Request Body:', JSON.stringify(body, null, 2));

    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ No items in cart:', { items, isArray: Array.isArray(items), length: items?.length });
      return NextResponse.json(
        { error: 'Aucun article dans le panier' },
        { status: 400 }
      );
    }

    // SÉCURITÉ: Recalculer le prix depuis la DB pour éviter la fraude
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      console.log('🔍 Processing item:', JSON.stringify(item, null, 2));

      const productId = item.productId || item.id;
      console.log('🔍 Looking for product ID:', productId);

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, price: true, stock: true, isActive: true }
      });

      console.log('🔍 Found product:', product ? JSON.stringify(product, null, 2) : 'NOT FOUND');

      if (!product || !product.isActive) {
        console.log('❌ Product not found or inactive:', { productId, product });
        return NextResponse.json(
          { error: `Produit ${item.name || 'inconnu'} non disponible` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
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
    console.error('Internal Error:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
