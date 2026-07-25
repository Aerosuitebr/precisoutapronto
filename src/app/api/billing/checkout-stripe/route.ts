import { NextResponse } from 'next/server';
import { readSessionFromCookies } from '@/lib/auth/session-cookie';
import { isBillingProductId } from '@/lib/billing-products';
import { createStripePremiumCheckout, isStripeConfigured } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe ainda não configurado. Defina STRIPE_SECRET_KEY no servidor.' },
        { status: 503 }
      );
    }

    const session = readSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Faça login para assinar com a Stripe.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { product?: string };
    const product = body.product && isBillingProductId(body.product) ? body.product : 'premium';

    const result = await createStripePremiumCheckout({
      userId: session.sub,
      email: session.email,
      product
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
