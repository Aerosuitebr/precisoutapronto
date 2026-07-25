import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { activatePremiumFromZoopTransaction } from '@/lib/billing-server';
import { isDatabaseConfigured } from '@/lib/db';
import {
  getZoopTransaction,
  isZoopConfigured,
  isZoopTransactionFailed,
  parseUserIdFromZoopReference
} from '@/lib/zoop';

/**
 * Confirmação ativa no polling do checkout inline da Zoop.
 * Consulta a transação e, se succeeded, libera Premium. Complementa o webhook.
 */
export async function GET(request: Request) {
  try {
    if (!isZoopConfigured() || !isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Zoop não configurada no servidor.' }, { status: 503 });
    }

    const session = await getValidSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Faça login para confirmar o pagamento.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const transactionId = (searchParams.get('transactionId') || searchParams.get('transaction_id') || '').trim();
    if (!transactionId) {
      return NextResponse.json({ error: 'transactionId ausente.' }, { status: 400 });
    }

    const transaction = await getZoopTransaction(transactionId);

    // A transação precisa pertencer ao usuário logado (userId no reference_id).
    const ownerId = parseUserIdFromZoopReference(transaction.reference_id);
    if (ownerId && ownerId !== session.sub) {
      return NextResponse.json({ error: 'Transação de outro usuário.' }, { status: 403 });
    }

    if (isZoopTransactionFailed(transaction.status)) {
      return NextResponse.json({ approved: false, failed: true, status: transaction.status });
    }

    const activation = await activatePremiumFromZoopTransaction({
      userId: session.sub,
      transactionId: transaction.id,
      status: transaction.status
    });

    return NextResponse.json({
      approved: activation.activated,
      status: transaction.status,
      expiresAt: activation.activated ? activation.expiresAt : undefined
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao confirmar pagamento Zoop.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
