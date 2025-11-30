import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    // Dans une vraie app, on recalculerait le prix depuis la DB pour éviter la fraude
    // Ici on fait confiance au client pour la démo, mais À CHANGER EN PROD
    const total = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // En centimes
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
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
