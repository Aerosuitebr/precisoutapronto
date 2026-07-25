import { NextResponse } from 'next/server';
import { isBillingProductId } from '@/lib/billing-products';
import { createBillingCheckoutPreference, isMercadoPagoConfigured } from '@/lib/mercadopago';

export async function POST(request: Request) {
  try {
    if (!isMercadoPagoConfigured()) {
      return NextResponse.json(
        { error: 'Mercado Pago ainda não configurado no servidor.' },
        { status: 503 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      /** @deprecated Nome da conta: ignorado (causa divergência antifraude). */
      name?: string;
      /** Nome do titular do cartão, como impresso. */
      cardholderName?: string;
      product?: string;
      deviceSessionId?: string;
    };

    const email = (body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Informe o e-mail da conta logada.' }, { status: 400 });
    }

    const product = body.product && isBillingProductId(body.product) ? body.product : 'premium';
    const deviceSessionId = body.deviceSessionId?.trim() || undefined;
    // Só aceita titular do cartão: nunca o nome do perfil da conta.
    const cardholderName = body.cardholderName?.trim() || undefined;

    const result = await createBillingCheckoutPreference({
      payerEmail: email,
      cardholderName,
      product,
      deviceSessionId
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao criar checkout.' },
      { status: 500 }
    );
  }
}
