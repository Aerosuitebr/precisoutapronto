import { createHmac, timingSafeEqual } from 'crypto';
import {
  BILLING_PRODUCTS,
  getBillingProduct,
  isBillingProductId,
  type BillingProductId
} from '@/lib/billing-products';
import { PLANS } from '@/lib/plans';

const MP_API = 'https://api.mercadopago.com';

export function getMercadoPagoAccessToken() {
  return process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() || '';
}

export function getAppPublicUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

/** `production` usa init_point; `sandbox` usa sandbox_init_point (credenciais de teste). */
export function getMercadoPagoMode(): 'production' | 'sandbox' {
  const raw = (process.env.MERCADOPAGO_MODE || process.env.NEXT_PUBLIC_MERCADOPAGO_MODE || '')
    .trim()
    .toLowerCase();
  if (raw === 'sandbox' || raw === 'test' || raw === 'teste') return 'sandbox';
  if (raw === 'production' || raw === 'prod' || raw === 'producao' || raw === 'produção') {
    return 'production';
  }
  return process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';
}

export function isMercadoPagoSandbox() {
  return getMercadoPagoMode() === 'sandbox';
}

export function isMercadoPagoConfigured() {
  return Boolean(getMercadoPagoAccessToken());
}

/** Conta vendedora precisa poder receber (KYC / dados bancários no MP). */
export async function assertMercadoPagoCanReceivePayments() {
  const me = await mpFetch<{
    id?: number;
    status?: { site_status?: string; billing?: { allow?: boolean } };
  }>('/users/me');

  const siteStatus = me.status?.site_status;
  const billingAllow = me.status?.billing?.allow;

  if (siteStatus && siteStatus !== 'active') {
    throw new Error(
      `Conta Mercado Pago com status "${siteStatus}". Ative a conta no painel do Mercado Pago para receber pagamentos.`
    );
  }

  if (billingAllow === false) {
    throw new Error(
      'Sua conta Mercado Pago ainda não está liberada para receber pagamentos (billing bloqueado). No painel do Mercado Pago, complete a verificação da conta e o cadastro para recebimentos; depois tente de novo.'
    );
  }
}

export function getMercadoPagoWebhookSecret() {
  return process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim() || '';
}

/**
 * Valida origem do webhook (docs MP: x-signature HMAC-SHA256).
 * Manifest: `id:{data.id};request-id:{x-request-id};ts:{ts};`
 * Pares sem valor na request são omitidos.
 */
export function verifyMercadoPagoWebhookSignature(input: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secret?: string;
}): { ok: true } | { ok: false; reason: string } {
  const secret = (input.secret ?? getMercadoPagoWebhookSecret()).trim();
  if (!secret) {
    return { ok: false, reason: 'secret_missing' };
  }

  const xSignature = input.xSignature?.trim() || '';
  if (!xSignature) {
    return { ok: false, reason: 'signature_missing' };
  }

  let ts = '';
  let hash = '';
  for (const part of xSignature.split(',')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    if (key === 'ts') ts = val;
    if (key === 'v1') hash = val;
  }

  if (!ts || !hash) {
    return { ok: false, reason: 'signature_malformed' };
  }

  const dataId = (input.dataId || '').trim().toLowerCase();
  const xRequestId = (input.xRequestId || '').trim();

  const parts: string[] = [];
  if (dataId) parts.push(`id:${dataId}`);
  if (xRequestId) parts.push(`request-id:${xRequestId}`);
  parts.push(`ts:${ts}`);
  const manifest = `${parts.join(';')};`;

  const computed = createHmac('sha256', secret).update(manifest).digest('hex');
  const computedBuf = Buffer.from(computed, 'utf8');
  const hashBuf = Buffer.from(hash, 'utf8');
  if (computedBuf.length !== hashBuf.length || !timingSafeEqual(computedBuf, hashBuf)) {
    return { ok: false, reason: 'signature_mismatch' };
  }

  return { ok: true };
}

async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getMercadoPagoAccessToken();
  if (!token) {
    throw new Error('Mercado Pago não configurado. Defina MERCADOPAGO_ACCESS_TOKEN no .env.');
  }

  const response = await fetch(`${MP_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });

  const data = (await response.json().catch(() => ({}))) as T & { message?: string; error?: string };
  if (!response.ok) {
    const detail =
      (data as { message?: string }).message ||
      (data as { error?: string }).error ||
      `Erro Mercado Pago (${response.status})`;
    throw new Error(detail);
  }
  return data;
}

export interface CheckoutPreferenceResult {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
}

function splitPayerName(fullName?: string) {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { name: undefined as string | undefined, surname: undefined as string | undefined };
  if (parts.length === 1) return { name: parts[0], surname: undefined };
  return { name: parts[0], surname: parts.slice(1).join(' ') };
}

export async function createBillingCheckoutPreference(input: {
  payerEmail: string;
  /**
   * Nome do titular do cartão (como impresso).
   * Não usar o nome da conta: cartão de terceiro gera divergência antifraude no MP.
   */
  cardholderName?: string;
  product?: BillingProductId | string | null;
  /** Device ID do security.js: header X-meli-session-id (antifraude MP). */
  deviceSessionId?: string;
}) {
  const appUrl = getAppPublicUrl();
  const product = getBillingProduct(input.product);
  const sandbox = isMercadoPagoSandbox();
  const { name, surname } = splitPayerName(input.cardholderName);
  const deviceSessionId = input.deviceSessionId?.trim() || '';

  const payer: { email: string; name?: string; surname?: string } = {
    email: input.payerEmail
  };
  // Só envia nome se for o do titular: omite evita pré-preencher com nome da conta.
  if (name) {
    payer.name = name;
    if (surname) payer.surname = surname;
  }

  const preference = await mpFetch<CheckoutPreferenceResult>('/checkout/preferences', {
    method: 'POST',
    headers: deviceSessionId ? { 'X-meli-session-id': deviceSessionId } : undefined,
    body: JSON.stringify({
      items: [
        {
          id: product.itemId,
          title: product.title,
          description: product.description,
          category_id: 'services',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: product.price
        }
      ],
      payer,
      external_reference: input.payerEmail.toLowerCase(),
      statement_descriptor: 'TA PRONTO',
      // Objeto (não string): melhora score antifraude do Checkout Pro.
      additional_info: {
        items: [
          {
            id: product.itemId,
            title: product.title,
            description: product.description,
            category_id: 'services',
            quantity: 1,
            unit_price: product.price
          }
        ],
        payer: {
          first_name: name || undefined,
          last_name: surname || undefined
        }
      },
      payment_methods: {
        installments: 1
        // Não exclui credit_card / debit_card: cartão fica disponível no Checkout Pro.
      },
      back_urls: {
        success: `${appUrl}/checkout?method=mercadopago&billing=success`,
        failure: `${appUrl}/checkout?method=mercadopago&billing=failure`,
        pending: `${appUrl}/checkout?method=mercadopago&billing=pending`
      },
      auto_return: 'approved',
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      metadata: {
        product: product.id,
        days: product.days,
        mode: sandbox ? 'sandbox' : 'production',
        has_device_id: Boolean(deviceSessionId)
      }
    })
  });

  const checkoutUrl = sandbox
    ? preference.sandbox_init_point || preference.init_point
    : preference.init_point || preference.sandbox_init_point;

  if (!checkoutUrl) {
    throw new Error('Preferência criada, mas sem URL de checkout.');
  }

  return {
    preferenceId: preference.id,
    checkoutUrl,
    mode: sandbox ? ('sandbox' as const) : ('production' as const),
    product: product.id,
    days: product.days,
    amount: product.price
  };
}

/** @deprecated Use createBillingCheckoutPreference({ product: 'premium' }) */
export async function createPremiumCheckoutPreference(input: {
  payerEmail: string;
  cardholderName?: string;
}) {
  return createBillingCheckoutPreference({ ...input, product: BILLING_PRODUCTS.premium.id });
}

export { isBillingProductId };
export type { BillingProductId };

export interface MercadoPagoPayment {
  id: number;
  status: string;
  status_detail?: string;
  external_reference?: string | null;
  transaction_amount?: number;
  payment_method_id?: string;
  date_approved?: string | null;
}

export async function getMercadoPagoPayment(paymentId: string) {
  return mpFetch<MercadoPagoPayment>(`/v1/payments/${paymentId}`);
}

export interface CreateCardPaymentInput {
  token: string;
  paymentMethodId: string;
  issuerId?: string | number;
  installments: number;
  payerEmail: string;
  identificationType?: string;
  identificationNumber?: string;
}

/**
 * Cria um pagamento com cartão diretamente via API de Pagamentos (Card Payment Brick),
 * sem redirecionar para o Checkout Pro. Usado apenas pelo fluxo "cartão": Pix/boleto
 * continuam pela preferência de checkout (createPremiumCheckoutPreference).
 */
export async function createCardPayment(input: CreateCardPaymentInput) {
  const appUrl = getAppPublicUrl();
  const amount = PLANS.premium.price;
  const idempotencyKey = `premium-card-${input.payerEmail.toLowerCase()}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const payment = await mpFetch<MercadoPagoPayment>('/v1/payments', {
    method: 'POST',
    headers: { 'X-Idempotency-Key': idempotencyKey },
    body: JSON.stringify({
      transaction_amount: amount,
      token: input.token,
      description: 'Precisou, Tá Pronto Premium · 30 dias',
      installments: input.installments || 1,
      payment_method_id: input.paymentMethodId,
      issuer_id: input.issuerId,
      statement_descriptor: 'RESOLVAJATO',
      external_reference: input.payerEmail.toLowerCase(),
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      metadata: {
        product: 'premium',
        days: 30,
        source: 'card_brick'
      },
      payer: {
        email: input.payerEmail,
        identification:
          input.identificationType && input.identificationNumber
            ? { type: input.identificationType, number: input.identificationNumber }
            : undefined
      }
    })
  });

  return payment;
}

export async function getMerchantOrder(orderId: string) {
  return mpFetch<{ id: number; payments?: Array<{ id: number; status: string }> }>(
    `/merchant_orders/${orderId}`
  );
}

/** Busca pagamentos recentes pelo e-mail gravado em external_reference (ex.: Pix atrasado). */
export async function searchPaymentsByExternalReference(email: string, limit = 10) {
  const ref = encodeURIComponent(email.trim().toLowerCase());
  const data = await mpFetch<{ results?: MercadoPagoPayment[] }>(
    `/v1/payments/search?external_reference=${ref}&sort=date_created&criteria=desc&limit=${limit}`
  );
  return Array.isArray(data.results) ? data.results : [];
}
