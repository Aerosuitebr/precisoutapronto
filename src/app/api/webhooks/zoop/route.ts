import { NextResponse } from 'next/server';
import { activatePremiumFromZoopTransaction } from '@/lib/billing-server';
import { isDatabaseConfigured } from '@/lib/db';
import {
  getZoopTransaction,
  getZoopWebhookToken,
  isZoopConfigured,
  parseUserIdFromZoopReference,
  type ZoopTransaction
} from '@/lib/zoop';

export const runtime = 'nodejs';

/**
 * Webhook Zoop. A Zoop não assina o corpo; validamos por um token opcional no
 * header Authorization (configurável no cadastro do webhook) e reconsultamos a
 * transação na API antes de liberar Premium, como fazemos no NuPay.
 */
export async function POST(request: Request) {
  try {
    if (!isZoopConfigured() || !isDatabaseConfigured()) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }

    const expectedToken = getZoopWebhookToken();
    if (expectedToken) {
      const auth = request.headers.get('authorization') || request.headers.get('x-zoop-token') || '';
      const provided = auth.replace(/^Basic\s+|^Bearer\s+/i, '').trim();
      if (provided !== expectedToken) {
        console.warn('[zoop-webhook] token inválido');
        return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 401 });
      }
    } else {
      console.warn('[zoop-webhook] ZOOP_WEBHOOK_TOKEN ausente: validação de origem desativada');
    }

    const body = (await request.json().catch(() => ({}))) as {
      type?: string;
      payload?: (ZoopTransaction & { id?: string }) | Record<string, unknown>;
    };

    const payload = (body.payload || {}) as ZoopTransaction & {
      reference_id?: string;
    };
    const transactionId = typeof payload.id === 'string' ? payload.id : '';

    if (!transactionId) {
      // Evento sem transação (ex.: ping de validação da URL): responde 200.
      return NextResponse.json({ ok: true, ignored: true, type: body.type });
    }

    // Fonte da verdade: reconsulta o status real na API.
    const transaction = await getZoopTransaction(transactionId);
    const userId =
      parseUserIdFromZoopReference(transaction.reference_id) ||
      parseUserIdFromZoopReference(payload.reference_id);

    if (!userId) {
      console.warn('[zoop-webhook] transação sem userId no reference_id', { transactionId });
      return NextResponse.json({ ok: true, ignored: true });
    }

    const activation = await activatePremiumFromZoopTransaction({
      userId,
      transactionId: transaction.id,
      status: transaction.status
    });

    console.info('[zoop-webhook] transaction', {
      id: transaction.id,
      type: body.type,
      status: transaction.status,
      activated: activation.activated,
      reason: activation.activated ? undefined : activation.reason
    });

    return NextResponse.json({ ok: true, activated: activation.activated });
  } catch (error) {
    console.error('[zoop-webhook]', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'zoop-webhook' });
}
