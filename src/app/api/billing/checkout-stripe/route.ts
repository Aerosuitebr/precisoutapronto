import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isBillingProductId } from '@/lib/billing-products';
import { createStripePremiumCheckout, isStripeConfigured } from '@/lib/stripe';
import { isInternationalLocale } from '@/lib/i18n';

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe ainda não configurado. Defina STRIPE_SECRET_KEY no servidor.' },
        { status: 503 }
      );
    }

    const session = await getValidSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Faça login para assinar com a Stripe.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { product?: string; locale?: string };
    const product = body.product && isBillingProductId(body.product) ? body.product : 'premium';
    const locale = body.locale && isInternationalLocale(body.locale) ? body.locale : undefined;

    const result = await createStripePremiumCheckout({
      userId: session.sub,
      email: session.email,
      product,
      locale
    });

    return NextResponse.json({
      sessionId: result.sessionId,
      checkoutUrl: result.checkoutUrl
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao criar checkout Stripe.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
