import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { activatePremiumFromAsaasPayment } from '@/lib/billing-server';
import { isDatabaseConfigured } from '@/lib/db';
import {
  getAsaasPayment,
  isAsaasConfigured,
  isAsaasPaymentFailed,
  parseUserIdFromAsaasReference
} from '@/lib/asaas';

/**
 * Confirmação ativa no polling do checkout Asaas.
 * Consulta a cobrança e libera Premium se RECEIVED/CONFIRMED.
 */
export async function GET(request: Request) {
  try {
    if (!isAsaasConfigured() || !isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Asaas não configurada no servidor.' }, { status: 503 });
    }

    const session = await getValidSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Faça login para confirmar o pagamento.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = (searchParams.get('paymentId') || searchParams.get('payment_id') || '').trim();
    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId ausente.' }, { status: 400 });
    }

    const payment = await getAsaasPayment(paymentId);
    const ownerId = parseUserIdFromAsaasReference(payment.externalReference);
    if (ownerId && ownerId !== session.sub) {
      return NextResponse.json({ error: 'Cobrança de outro usuário.' }, { status: 403 });
    }

    if (isAsaasPaymentFailed(payment.status)) {
      return NextResponse.json({ approved: false, failed: true, status: payment.status });
    }

    const activation = await activatePremiumFromAsaasPayment({
      userId: session.sub,
      paymentId: payment.id,
      status: payment.status
    });

    return NextResponse.json({
      approved: activation.activated,
      status: payment.status,
      expiresAt: activation.activated ? activation.expiresAt : undefined
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao confirmar pagamento Asaas.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
