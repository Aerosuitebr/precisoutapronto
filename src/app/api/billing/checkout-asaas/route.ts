import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isBillingProductId } from '@/lib/billing-products';
import { isDatabaseConfigured } from '@/lib/db';
import { isValidCpf } from '@/lib/cpf';
import {
  createAsaasCardPremiumCheckout,
  createAsaasPixPremium,
  describeAsaasCheckoutError,
  isAsaasConfigured
} from '@/lib/asaas';

/**
 * Inicia cobrança Asaas.
 * - pix: QR + copia e cola (inline)
 * - card: invoiceUrl hospedada pela Asaas
 */
export async function POST(request: Request) {
  let method: 'pix' | 'card' = 'pix';
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
    method = body.method === 'card' ? 'card' : 'pix';
    const cpf = (body.cpf || '').replace(/\D/g, '');

    if (!isValidCpf(cpf)) {
      return NextResponse.json(
        { error: 'Informe um CPF válido para pagar com a Asaas.' },
        { status: 400 }
      );
    }

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
    console.error('[checkout-asaas]', { method, error });
    return NextResponse.json(
      { error: describeAsaasCheckoutError(error, method) },
      { status: 500 }
    );
  }
}
