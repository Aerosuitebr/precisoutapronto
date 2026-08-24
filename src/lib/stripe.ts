import Stripe from 'stripe';
import { getBillingProduct } from '@/lib/billing-products';
import type { InternationalLocale } from '@/lib/i18n';

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
  locale?: InternationalLocale;
}) {
  const stripe = getStripe();
  const appUrl = getAppPublicUrl();
  const product = getBillingProduct(input.product);
  const locale = input.locale;
  const international = locale === 'en' || locale === 'es';
  const currency = international
    ? (process.env[`STRIPE_CURRENCY_${locale.toUpperCase()}`] || 'usd').toLowerCase()
    : 'brl';
  const configuredAmount = international
    ? Number(process.env[`STRIPE_PREMIUM_AMOUNT_${locale.toUpperCase()}`] || '600')
    : Math.round(product.price * 100);
  const fallbackAmount =
    Number.isFinite(configuredAmount) && configuredAmount > 0 ? Math.round(configuredAmount) : 600;
  const localized = locale === 'es'
    ? {
        name: 'Precisou, Tá Pronto Premium: documentos sin marca · 30 días',
        description: 'PDF, WhatsApp y correo sin la marca Precisou, Tá Pronto durante 30 días'
      }
    : locale === 'en' ? {
        name: 'Precisou, Tá Pronto Premium: brand-free documents · 30 days',
        description: 'PDFs, WhatsApp and email without Precisou, Tá Pronto branding for 30 days'
      }
    : {
        name: product.title,
        description: product.description
      };

  // Um Price por mercado permite definir moeda e valor no Dashboard sem alterar o código.
  const dashboardPriceId =
    product.id === 'premium'
      ? (
          (international ? process.env[`STRIPE_PRICE_PREMIUM_${locale.toUpperCase()}`] : '') ||
          process.env.STRIPE_PRICE_PREMIUM ||
          ''
        ).trim()
      : '';
  const dashboardPrice = dashboardPriceId ? await stripe.prices.retrieve(dashboardPriceId) : null;
  if (dashboardPriceId && (!dashboardPrice?.active || dashboardPrice.unit_amount === null)) {
    throw new Error('The configured Stripe price is inactive or does not have a fixed amount.');
  }
  // Não deixa um Price antigo do Dashboard cobrar o valor anterior após uma troca de preço.
  const useDashboardPrice = Boolean(
    dashboardPrice &&
    dashboardPrice.unit_amount === fallbackAmount &&
    dashboardPrice.currency.toLowerCase() === currency
  );
  const expectedAmountTotal = fallbackAmount;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: input.userId,
    customer_email: input.email,
    line_items: [
      dashboardPriceId && useDashboardPrice
        ? { price: dashboardPriceId, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency,
              unit_amount: fallbackAmount,
              product_data: {
                name: localized.name,
                description: localized.description
              }
            }
          }
    ],
    metadata: {
      userId: input.userId,
      product: product.id,
      days: String(product.days),
      locale: locale || 'pt-BR',
      expectedAmountTotal: String(expectedAmountTotal)
    },
    locale: locale === 'es' ? 'es' : locale === 'en' ? 'en' : 'pt-BR',
    success_url: international
      ? `${appUrl}/${locale}/checkout?billing=stripe-success&session_id={CHECKOUT_SESSION_ID}`
      : `${appUrl}/checkout?method=stripe&billing=stripe-success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: international
      ? `${appUrl}/${locale}/checkout?billing=stripe-cancel`
      : `${appUrl}/checkout?method=stripe&billing=stripe-cancel`
  });

  if (!session.url) {
    throw new Error('Stripe criou a sessão, mas não retornou a URL de pagamento.');
  }

  return { sessionId: session.id, checkoutUrl: session.url };
}
