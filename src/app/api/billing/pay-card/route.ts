import { NextResponse } from 'next/server';
import { readSessionFromCookies } from '@/lib/auth/session-cookie';
import {
  assertMercadoPagoCanReceivePayments,
  createCardPayment,
  isMercadoPagoConfigured
} from '@/lib/mercadopago';
import { writeAuditLog } from '@/lib/security/audit';
import { consumeRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { getClientIp } from '@/lib/security/request-meta';

interface PayCardBody {
  token?: string;
  payment_method_id?: string;
  issuer_id?: string | number;
  installments?: number;
  payer?: {
    email?: string;
    identification?: { type?: string; number?: string };
  };
}

export async function POST(request: Request) {
  try {
    if (!isMercadoPagoConfigured()) {
      return NextResponse.json(
        { error: 'Mercado Pago ainda não configurado no servidor.' },
        { status: 503 }
      );
    }

    const session = readSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const ip = getClientIp();
    const rate = await consumeRateLimit({
      key: `pay-card:${session.sub}`,
      ...RATE_LIMITS.cardPayment
    });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas de pagamento. Aguarde alguns minutos e tente novamente.' },
        { status: 429 }
      );
    }

    await assertMercadoPagoCanReceivePayments();

    const body = (await request.json().catch(() => ({}))) as PayCardBody;

    if (!body.token || !body.payment_method_id) {
      return NextResponse.json(
        { error: 'Dados do cartão incompletos. Verifique os campos e tente novamente.' },
        { status: 400 }
      );
    }

    const payerEmail = (body.payer?.email || session.email || '').trim().toLowerCase();
    if (!payerEmail || !payerEmail.includes('@')) {
      return NextResponse.json({ error: 'E-mail da conta inválido.' }, { status: 400 });
    }

    const payment = await createCardPayment({
      token: body.token,
      paymentMethodId: body.payment_method_id,
      issuerId: body.issuer_id,
      installments: Number(body.installments) || 1,
      payerEmail,
      identificationType: body.payer?.identification?.type,
      identificationNumber: body.payer?.identification?.number
    });

    await writeAuditLog({
      event: 'card_payment_created',
      userId: session.sub,
      email: payerEmail,
      ip,
      meta: {
        paymentId: payment.id,
        status: payment.status,
        statusDetail: payment.status_detail,
        paymentMethod: payment.payment_method_id
      }
    });

    return NextResponse.json({
      paymentId: String(payment.id),
      status: payment.status,
      statusDetail: payment.status_detail
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao processar o pagamento com cartão.' },
      { status: 500 }
    );
  }
}
