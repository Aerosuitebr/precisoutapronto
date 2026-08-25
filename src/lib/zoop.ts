import { getAppPublicUrl } from '@/lib/mercadopago';
import { getBillingProduct } from '@/lib/billing-products';

/**
 * Cliente Zoop (https://docs.zoop.co).
 * Fluxo avulso: 1 transação aprovada = 30 dias de Premium.
 * Pix (QR/copia e cola) e cartão (via token) usam a mesma API de transações,
 * mudando o payment_type. Diferente de Stripe/MP/NuPay, a Zoop não redireciona
 * para página hospedada: a cobrança é inline no nosso checkout.
 */

const ZOOP_API_BASE = 'https://api.zoop.ws';

export function getZoopMarketplaceId() {
  return process.env.ZOOP_MARKETPLACE_ID?.trim() || '';
}

export function getZoopApiKey() {
  return process.env.ZOOP_API_KEY?.trim() || '';
}

/** on_behalf_of: vendedor que recebe. Em conta única, é o seller do próprio marketplace. */
export function getZoopSellerId() {
  return process.env.ZOOP_SELLER_ID?.trim() || '';
}

export function getZoopWebhookToken() {
  return process.env.ZOOP_WEBHOOK_TOKEN?.trim() || '';
}

export function getZoopMode(): 'sandbox' | 'production' {
  const raw = (process.env.ZOOP_MODE || '').trim().toLowerCase();
  if (raw === 'production' || raw === 'prod' || raw === 'producao' || raw === 'produção') {
    return 'production';
  }
  return 'sandbox';
}

export function isZoopConfigured() {
  return Boolean(getZoopMarketplaceId() && getZoopApiKey());
}

/** Basic Auth: chave zpk como usuário, senha vazia. */
function zoopAuthHeader() {
  const key = getZoopApiKey();
  return `Basic ${Buffer.from(`${key}:`).toString('base64')}`;
}

async function zoopFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const marketplaceId = getZoopMarketplaceId();
  const key = getZoopApiKey();
  if (!marketplaceId || !key) {
    throw new Error('Zoop não configurado. Defina ZOOP_MARKETPLACE_ID e ZOOP_API_KEY.');
  }

  const response = await fetch(`${ZOOP_API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: zoopAuthHeader(),
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    error?: { message?: string; category?: string };
    message?: string;
    status_message?: string;
  };

  if (!response.ok) {
    const detail =
      data.error?.message ||
      data.message ||
      data.status_message ||
      `Erro Zoop (${response.status})`;
    const err = new Error(detail) as Error & { status?: number; body?: unknown };
    err.status = response.status;
    err.body = data;
    throw err;
  }

  return data;
}

/** Zoop trabalha o valor da transação em centavos (inteiro). R$ 30,00 = 3000. */
export function toZoopAmount(reais: number) {
  return Math.round(reais * 100);
}

export type ZoopTransactionStatus =
  | 'new'
  | 'created'
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'reversed'
  | 'pre_authorized'
  | 'canceled'
  | 'charged_back'
  | 'disputed';

export interface ZoopTransaction {
  id: string;
  resource: string;
  status: ZoopTransactionStatus;
  amount?: number | string;
  currency?: string;
  payment_type?: 'pix' | 'credit' | 'boleto';
  reference_id?: string;
  description?: string;
  payment_method?: {
    qr_code?: { emv?: string; base64?: string };
    expiration_date?: string;
  } & Record<string, unknown>;
}

/** reference_id único por transação e carrega o userId para o retorno/webhook. */
export function buildZoopReference(userId: string) {
  const rand = Math.random().toString(36).slice(2, 10);
  return `rjzoop_${userId}_${Date.now().toString(36)}_${rand}`;
}

export function parseUserIdFromZoopReference(reference: string | undefined | null) {
  if (!reference) return null;
  const parts = reference.split('_');
  if (parts[0] !== 'rjzoop' || parts.length < 3) return null;
  return parts[1] || null;
}

export function isZoopTransactionPaid(status: string | undefined) {
  return status === 'succeeded';
}

export function isZoopTransactionFailed(status: string | undefined) {
  return (
    status === 'failed' ||
    status === 'reversed' ||
    status === 'canceled' ||
    status === 'charged_back'
  );
}

interface ZoopBuyerInput {
  firstName: string;
  lastName: string;
  email: string;
  taxpayerId?: string;
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'Cliente',
    lastName: parts.slice(1).join(' ') || 'PrecisouTaPronto'
  };
}

/** Cria/reaproveita comprador. A Zoop deduplica por e-mail no mesmo marketplace. */
export async function createZoopBuyer(input: ZoopBuyerInput) {
  const marketplaceId = getZoopMarketplaceId();
  return zoopFetch<{ id: string; resource: string; email?: string }>(
    `/v1/marketplaces/${marketplaceId}/buyers`,
    {
      method: 'POST',
      body: JSON.stringify({
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        taxpayer_id: input.taxpayerId ? input.taxpayerId.replace(/\D/g, '') : undefined
      })
    }
  );
}

function baseTransactionBody(input: {
  amountCents: number;
  reference: string;
  description: string;
}) {
  const sellerId = getZoopSellerId();
  return {
    amount: input.amountCents,
    currency: 'BRL',
    reference_id: input.reference,
    description: input.description,
    ...(sellerId ? { on_behalf_of: sellerId } : {})
  };
}

/**
 * Cria uma cobrança Pix. O QR/copia e cola vem em payment_method.qr_code.emv.
 * expiresInMinutes: 5, 10, 15, 30, ou horas (60, 180...). Usamos 30 minutos.
 */
export async function createZoopPixPremium(input: {
  userId: string;
  name: string;
  email: string;
  product?: string;
}) {
  const marketplaceId = getZoopMarketplaceId();
  const product = getBillingProduct(input.product);
  const reference = buildZoopReference(input.userId);

  const transaction = await zoopFetch<ZoopTransaction>(
    `/v1/marketplaces/${marketplaceId}/transactions`,
    {
      method: 'POST',
      body: JSON.stringify({
        ...baseTransactionBody({
          amountCents: toZoopAmount(product.price),
          reference,
          description: product.title
        }),
        payment_type: 'pix',
        expiration_date: 30 // minutos
      })
    }
  );

  return {
    transaction,
    reference,
    qrCodeEmv: transaction.payment_method?.qr_code?.emv || '',
    expiresAt: transaction.payment_method?.expiration_date || null,
    mode: getZoopMode()
  };
}

/**
 * Cobra no cartão usando um token gerado no cliente (PCI fora do nosso backend).
 * capture: true = captura imediata (pagamento avulso).
 */
export async function createZoopCardPremium(input: {
  userId: string;
  name: string;
  email: string;
  cardToken: string;
  taxpayerId?: string;
  installments?: number;
  product?: string;
}) {
  const marketplaceId = getZoopMarketplaceId();
  const product = getBillingProduct(input.product);
  const reference = buildZoopReference(input.userId);
  const { firstName, lastName } = splitName(input.name);

  let buyerId = '';
  try {
    const buyer = await createZoopBuyer({
      firstName,
      lastName,
      email: input.email,
      taxpayerId: input.taxpayerId
    });
    buyerId = buyer.id;
  } catch (error) {
    // Comprador é opcional para cobrar com token; seguimos sem bloquear a venda.
    console.warn('[zoop] falha ao criar buyer, seguindo sem customer:', error);
  }

  const transaction = await zoopFetch<ZoopTransaction>(
    `/v1/marketplaces/${marketplaceId}/transactions`,
    {
      method: 'POST',
      body: JSON.stringify({
        ...baseTransactionBody({
          amountCents: toZoopAmount(product.price),
          reference,
          description: product.title
        }),
        payment_type: 'credit',
        token: input.cardToken,
        capture: true,
        installment_plan: {
          mode: 'interest_free',
          number_installments: Math.max(1, Math.min(1, input.installments || 1))
        },
        ...(buyerId ? { customer: buyerId } : {})
      })
    }
  );

  return { transaction, reference, mode: getZoopMode() };
}

export async function getZoopTransaction(transactionId: string) {
  const marketplaceId = getZoopMarketplaceId();
  return zoopFetch<ZoopTransaction>(
    `/v1/marketplaces/${marketplaceId}/transactions/${encodeURIComponent(transactionId)}`
  );
}

/** Endereço público do webhook (cadastrar no painel Zoop). */
export function getZoopWebhookUrl() {
  return `${getAppPublicUrl()}/api/webhooks/zoop`;
}
