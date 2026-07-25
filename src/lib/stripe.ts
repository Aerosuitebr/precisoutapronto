import Stripe from 'stripe';
import { getBillingProduct } from '@/lib/billing-products';

let client: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Stripe não configurado. Defina STRIPE_SECRET_KEY no servidor.');
  }
  if (!client) {
    client = new Stripe(key);
  }
  return client;
}

export function getStripeWebhookSecret() {
  return (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
}

function getAppPublicUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

/**
 * Cria uma Checkout Session hospedada pela Stripe para o Premium (pagamento único).
 * O usuário é identificado no webhook via client_reference_id (userId).
 */
export async function createStripePremiumCheckout(input: {
  userId: string;
  email: string;
  product?: string;
}) {
  const stripe = getStripe();
  const appUrl = getAppPublicUrl();
  const product = getBillingProduct(input.product);

  // Premium usa o price criado no Dashboard; demais produtos usam price_data inline.
  const dashboardPriceId =
    product.id === 'premium' ? (process.env.STRIPE_PRICE_PREMIUM || '').trim() : '';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: input.userId,
    customer_email: input.email,
    line_items: [
      dashboardPriceId
        ? { price: dashboardPriceId, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: 'brl',
              unit_amount: Math.round(product.price * 100),
              product_data: {
                name: product.title,
                description: product.description
              }
            }
          }
    ],
    metadata: {
      userId: input.userId,
      product: product.id,
      days: String(product.days)
    },
    success_url: `${appUrl}/checkout?method=stripe&billing=stripe-success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout?method=stripe&billing=stripe-cancel`
  });

  if (!session.url) {
    throw new Error('Stripe criou a sessão, mas não retornou a URL de pagamento.');
  }

  return { sessionId: session.id, checkoutUrl: session.url };
}
