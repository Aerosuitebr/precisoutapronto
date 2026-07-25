import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isBillingProductId } from '@/lib/billing-products';
import { isDatabaseConfigured } from '@/lib/db';
import {
  createAsaasCardPremiumCheckout,
  createAsaasPixPremium,
  isAsaasConfigured
} from '@/lib/asaas';

/**
 * Inicia cobrança Asaas.
 * - pix: QR + copia e cola (inline)
 * - card: invoiceUrl hospedada pela Asaas
 */
export async function POST(request: Request) {
  try {
    if (!isAsaasConfigured() || !isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Asaas ainda não configurada. Defina ASAAS_API_KEY no servidor.' },
        { status: 503 }
      );
    }

    const session = await getValidSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Faça login para pagar com a Asaas.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      method?: 'pix' | 'card';
      product?: string;
      cpf?: string;
    };

    const product = body.product && isBillingProductId(body.product) ? body.product : 'premium';
    const method = body.method === 'card' ? 'card' : 'pix';
    const cpf = (body.cpf || '').replace(/\D/g, '') || undefined;

    if (method === 'card') {
      const { payment, checkoutUrl, mode } = await createAsaasCardPremiumCheckout({
        userId: session.sub,
        name: session.name || session.email,
        email: session.email,
        cpfCnpj: cpf,
        product
      });

      return NextResponse.json({
        method: 'card',
        paymentId: payment.id,
        status: payment.status,
        checkoutUrl,
        mode
      });
    }

    const { payment, qrCodePayload, qrCodeImageBase64, expiresAt, mode } =
      await createAsaasPixPremium({
        userId: session.sub,
        name: session.name || session.email,
        email: session.email,
        cpfCnpj: cpf,
        product
      });

    return NextResponse.json({
      method: 'pix',
      paymentId: payment.id,
      status: payment.status,
      qrCodePayload,
      qrCodeImageBase64,
      expiresAt,
      mode
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao iniciar o pagamento Asaas.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
