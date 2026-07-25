import { NextResponse } from 'next/server';
import { readSessionFromCookies } from '@/lib/auth/session-cookie';
import { activatePremiumFromStripeSession } from '@/lib/billing-server';
import { isDatabaseConfigured } from '@/lib/db';
import { getStripe, isStripeConfigured } from '@/lib/stripe';

/**
 * Confirmação ativa no retorno do Checkout (billing=stripe-success).
 * Complementa o webhook: consulta a sessão na Stripe e ativa se estiver paga.
 */
export async function GET(request: Request) {
  try {
    if (!isStripeConfigured() || !isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Stripe não configurado no servidor.' }, { status: 503 });
    }

    const session = readSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Faça login para confirmar o pagamento.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = (searchParams.get('session_id') || '').trim();
    if (!sessionId) {
      return NextResponse.json({ error: 'session_id ausente.' }, { status: 400 });
    }

    const checkout = await getStripe().checkout.sessions.retrieve(sessionId);
    const activation = await activatePremiumFromStripeSession({
      sessionId: checkout.id,
      paymentStatus: checkout.payment_status,
      userId: checkout.client_reference_id,
      email: checkout.customer_details?.email || checkout.customer_email,
      amountTotal: checkout.amount_total,
      days: checkout.metadata?.days ? Number(checkout.metadata.days) : null
    });

    return NextResponse.json({
      approved: activation.activated,
      status: checkout.payment_status,
      expiresAt: activation.activated ? activation.expiresAt : undefined
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao confirmar pagamento Stripe.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
