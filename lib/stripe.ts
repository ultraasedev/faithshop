import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing in .env');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helpers pour synchroniser les produits
export async function createStripeProduct(name: string, description: string, price: number, images: string[]) {
  // 1. Créer le produit
  const product = await stripe.products.create({
    name,
    description,
    images: images.slice(0, 8), // Stripe limite à 8 images
  });

  // 2. Créer le prix (en centimes)
  const priceObject = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(price * 100),
    currency: 'eur',
  });

  return { stripeProductId: product.id, stripePriceId: priceObject.id };
}

// Créer un PaymentIntent classique
export async function createPaymentIntent(
  amount: number,
  currency: string = 'eur',
  metadata?: Record<string, string>
) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  });
}

// Créer un PaymentIntent avec paiement en plusieurs fois (Klarna/Afterpay)
export async function createInstallmentPaymentIntent(
  amount: number,
  installments: 3 | 4, // 3x ou 4x
  _customerEmail: string,
  metadata?: Record<string, string>
) {
  // Klarna et Afterpay supportent le paiement en plusieurs fois
  // Minimum généralement 35€ pour le 3x/4x
  if (amount < 35) {
    throw new Error('Montant minimum de 35€ pour le paiement en plusieurs fois');
  }

  // Maximum généralement 1500€
  if (amount > 1500) {
    throw new Error('Montant maximum de 1500€ pour le paiement en plusieurs fois');
  }

  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'eur',
    payment_method_types: ['klarna'], // Klarna gère le 3x/4x
    payment_method_options: {
      klarna: {
        preferred_locale: 'fr-FR',
      },
    },
    metadata: {
      ...metadata,
      installments: installments.toString(),
    },
  });
}

// Créer une session Checkout (alternative plus simple)
export async function createCheckoutSession(params: {
  lineItems: Array<{
    name: string;
    description?: string;
    amount: number;
    quantity: number;
    images?: string[];
  }>;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  allowInstallments?: boolean;
}) {
  const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = [
    'card',
    'paypal',
  ];

  // Ajouter Klarna pour le paiement en plusieurs fois
  if (params.allowInstallments) {
    paymentMethodTypes.push('klarna');
  }

  return stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: paymentMethodTypes,
    line_items: params.lineItems.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: item.description,
          images: item.images,
        },
        unit_amount: Math.round(item.amount * 100),
      },
      quantity: item.quantity,
    })),
    customer_email: params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    shipping_address_collection: {
      allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'],
    },
    billing_address_collection: 'required',
    phone_number_collection: {
      enabled: true,
    },
  });
}

// Récupérer un PaymentIntent
export async function getPaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

// Rembourser un paiement
export async function refundPayment(paymentIntentId: string, amount?: number) {
  const params: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  };

  if (amount) {
    params.amount = Math.round(amount * 100);
  }

  return stripe.refunds.create(params);
}

// Vérifier le statut d'un paiement
export async function verifyPaymentStatus(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return {
    status: paymentIntent.status,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    paymentMethod: paymentIntent.payment_method_types[0],
    metadata: paymentIntent.metadata,
  };
}

// Types pour le frontend
export type PaymentMethod = 'card' | 'paypal' | 'klarna';

export interface PaymentOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  minAmount?: number;
  maxAmount?: number;
}

export const paymentOptions: PaymentOption[] = [
  {
    id: 'card',
    name: 'Carte bancaire',
    description: 'Visa, Mastercard, American Express',
    icon: 'credit-card',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Paiement sécurisé via PayPal',
    icon: 'paypal',
  },
  {
    id: 'klarna',
    name: 'Payer en 3x ou 4x',
    description: 'Sans frais avec Klarna',
    icon: 'calendar',
    minAmount: 35,
    maxAmount: 1500,
  },
];
