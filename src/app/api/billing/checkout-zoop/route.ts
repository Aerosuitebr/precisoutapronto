import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isBillingProductId } from '@/lib/billing-products';
import { isDatabaseConfigured } from '@/lib/db';
import {
  createZoopCardPremium,
  createZoopPixPremium,
  isZoopConfigured,
  isZoopTransactionFailed
} from '@/lib/zoop';

/**
 * Inicia a cobrança Zoop (fluxo inline, sem redirect).
 * - pix: devolve o copia e cola (emv) para exibir o QR na própria página.
 * - card: cobra com o token gerado no cliente e devolve o status.
 */
export async function POST(request: Request) {
  try {
    if (!isZoopConfigured() || !isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Zoop ainda não configurada. Defina ZOOP_MARKETPLACE_ID e ZOOP_API_KEY.' },
        { status: 503 }
      );
    }

    const session = await getValidSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Faça login para pagar com a Zoop.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      method?: 'pix' | 'card';
      product?: string;
      cardToken?: string;
      cpf?: string;
      installments?: number;
    };

    const product = body.product && isBillingProductId(body.product) ? body.product : 'premium';
    const method = body.method === 'card' ? 'card' : 'pix';

    if (method === 'card') {
      const cardToken = (body.cardToken || '').trim();
      if (!cardToken) {
        return NextResponse.json(
          { error: 'Token do cartão ausente. Recarregue e tente novamente.' },
          { status: 400 }
        );
      }

      const { transaction } = await createZoopCardPremium({
        userId: session.sub,
        name: session.name || session.email,
        email: session.email,
        cardToken,
        taxpayerId: body.cpf,
        installments: body.installments,
        product
      });

      if (isZoopTransactionFailed(transaction.status)) {
        return NextResponse.json(
          { error: 'Pagamento recusado pela operadora. Tente outro cartão.', status: transaction.status },
          { status: 402 }
        );
      }

      return NextResponse.json({
        method: 'card',
        transactionId: transaction.id,
        status: transaction.status
      });
    }

    const { transaction, qrCodeEmv, expiresAt, mode } = await createZoopPixPremium({
      userId: session.sub,
      name: session.name || session.email,
      email: session.email,
      product
    });

    if (!qrCodeEmv) {
      return NextResponse.json(
        { error: 'A Zoop não retornou o código Pix. Tente novamente.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      method: 'pix',
      transactionId: transaction.id,
      status: transaction.status,
      qrCodeEmv,
      expiresAt,
      mode
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao iniciar o pagamento Zoop.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
