import { NextResponse } from 'next/server';
import { activatePremiumFromAsaasPayment } from '@/lib/billing-server';
import { isDatabaseConfigured } from '@/lib/db';
import {
  getAsaasPayment,
  getAsaasWebhookToken,
  isAsaasConfigured,
  parseUserIdFromAsaasReference,
  type AsaasPayment
} from '@/lib/asaas';

export const runtime = 'nodejs';

/**
 * Webhook Asaas. Valida o token configurado no painel (asaas-access-token)
 * e reconsulta a cobrança na API antes de liberar Premium.
 */
export async function POST(request: Request) {
  try {
    if (!isAsaasConfigured() || !isDatabaseConfigured()) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }

    const expectedToken = getAsaasWebhookToken();
    if (expectedToken) {
      const provided =
        request.headers.get('asaas-access-token') ||
        request.headers.get('x-asaas-access-token') ||
        '';
      if (provided !== expectedToken) {
        console.warn('[asaas-webhook] token inválido');
        return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 401 });
      }
    } else {
      console.warn('[asaas-webhook] ASAAS_WEBHOOK_TOKEN ausente: validação de origem desativada');
    }

    const body = (await request.json().catch(() => ({}))) as {
      event?: string;
      payment?: AsaasPayment;
    };

    const paymentId = body.payment?.id;
    if (!paymentId) {
      return NextResponse.json({ ok: true, ignored: true, event: body.event });
    }

    // Fonte da verdade: reconsulta o status real.
    const payment = await getAsaasPayment(paymentId);
    const userId =
      parseUserIdFromAsaasReference(payment.externalReference) ||
      parseUserIdFromAsaasReference(body.payment?.externalReference);

    if (!userId) {
      console.warn('[asaas-webhook] cobrança sem userId no externalReference', { paymentId });
      return NextResponse.json({ ok: true, ignored: true });
    }

    const activation = await activatePremiumFromAsaasPayment({
      userId,
      paymentId: payment.id,
      status: payment.status
    });

    console.info('[asaas-webhook] payment', {
      id: payment.id,
      event: body.event,
      status: payment.status,
      activated: activation.activated,
      reason: activation.activated ? undefined : activation.reason
    });

    return NextResponse.json({ ok: true, activated: activation.activated });
  } catch (error) {
    console.error('[asaas-webhook]', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'asaas-webhook' });
}
