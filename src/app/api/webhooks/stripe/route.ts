import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { activatePremiumFromStripeSession } from '@/lib/billing-server';
import { isDatabaseConfigured } from '@/lib/db';
import { getStripe, getStripeWebhookSecret, isStripeConfigured } from '@/lib/stripe';

export const runtime = 'nodejs';

/**
 * Webhook Stripe. Valida a assinatura (stripe-signature) e, em
 * checkout.session.completed / async_payment_succeeded pago, libera Premium.
 */
export async function POST(request: Request) {
  try {
    if (!isStripeConfigured() || !isDatabaseConfigured()) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }

    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');
    const secret = getStripeWebhookSecret();

    let event: Stripe.Event;
    if (secret) {
      if (!signature) {
        return NextResponse.json({ ok: false, error: 'missing_signature' }, { status: 400 });
      }
      try {
        event = getStripe().webhooks.constructEvent(payload, signature, secret);
      } catch {
        console.warn('[stripe-webhook] signature rejected');
        return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 400 });
      }
    } else {
      console.warn(
        '[stripe-webhook] STRIPE_WEBHOOK_SECRET ausente — validação de assinatura desativada'
      );
      event = JSON.parse(payload) as Stripe.Event;
    }

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const activation = await activatePremiumFromStripeSession({
        sessionId: session.id,
        paymentStatus: session.payment_status,
        userId: session.client_reference_id,
        email: session.customer_details?.email || session.customer_email,
        amountTotal: session.amount_total,
        days: session.metadata?.days ? Number(session.metadata.days) : null
      });
      console.info('[stripe-webhook] session', {
        id: session.id,
        type: event.type,
        paymentStatus: session.payment_status,
        activated: activation.activated,
        reason: activation.activated ? undefined : activation.reason
      });
      return NextResponse.json({ ok: true, activated: activation.activated });
    }

    if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.info('[stripe-webhook] async payment failed', { id: session.id });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true, ignored: true, type: event.type });
  } catch (error) {
    console.error('[stripe-webhook]', error);
    // Stripe reenvia em não-2xx; erro transitório merece retry.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'stripe-webhook' });
}
