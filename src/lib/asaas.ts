import { getBillingProduct } from '@/lib/billing-products';
import { getAppPublicUrl } from '@/lib/mercadopago';

/**
 * Cliente Asaas (https://docs.asaas.com).
 * Fluxo avulso: 1 cobrança RECEIVED/CONFIRMED = 30 dias de Premium.
 * Pix: QR + copia e cola (inline). Cartão: redireciona para invoiceUrl da Asaas.
 */

export function getAsaasApiKey() {
  return process.env.ASAAS_API_KEY?.trim() || '';
}

export function getAsaasWebhookToken() {
  return process.env.ASAAS_WEBHOOK_TOKEN?.trim() || '';
}

export function getAsaasMode(): 'sandbox' | 'production' {
  const raw = (process.env.ASAAS_MODE || '').trim().toLowerCase();
  if (raw === 'production' || raw === 'prod' || raw === 'producao' || raw === 'produção') {
    return 'production';
  }
  // Inferência pela chave, se o modo não estiver definido.
  const key = getAsaasApiKey();
  if (key.startsWith('$aact_prod_')) return 'production';
  return 'sandbox';
}

export function getAsaasApiBase() {
  return getAsaasMode() === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://api-sandbox.asaas.com/v3';
}

export function isAsaasConfigured() {
  return Boolean(getAsaasApiKey());
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = getAsaasApiKey();
  if (!key) {
    throw new Error('Asaas não configurada. Defina ASAAS_API_KEY no servidor.');
  }

  const response = await fetch(`${getAsaasApiBase()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': `PrecisouTaPronto/1.0 (Next.js; ${getAsaasMode()})`,
      access_token: key,
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    errors?: Array<{ code?: string; description?: string }>;
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    const detail =
      data.errors?.[0]?.description ||
      data.message ||
      data.error ||
      `Erro Asaas (${response.status})`;
    const err = new Error(detail) as Error & { status?: number; body?: unknown };
    err.status = response.status;
    err.body = data;
    throw err;
  }

  return data;
}

export type AsaasPaymentStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'CONFIRMED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'RECEIVED_IN_CASH'
  | 'REFUND_REQUESTED'
  | 'REFUND_IN_PROGRESS'
  | 'CHARGEBACK_REQUESTED'
  | 'CHARGEBACK_DISPUTE'
  | 'AWAITING_CHARGEBACK_REVERSAL'
  | 'DUNNING_REQUESTED'
  | 'DUNNING_RECEIVED'
  | 'AWAITING_RISK_ANALYSIS';

export interface AsaasPayment {
  id: string;
  customer: string;
  billingType?: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  value?: number;
  netValue?: number;
  status: AsaasPaymentStatus;
  dueDate?: string;
  description?: string;
  externalReference?: string | null;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  paymentDate?: string | null;
  clientPaymentDate?: string | null;
}

export interface AsaasPixQrCode {
  encodedImage?: string;
  payload?: string;
  expirationDate?: string;
}

export interface AsaasCustomer {
  id: string;
  name?: string;
  email?: string;
  cpfCnpj?: string;
}

/** externalReference único e com userId para webhook/confirm. */
export function buildAsaasReference(userId: string) {
  const rand = Math.random().toString(36).slice(2, 10);
  return `rjasaas_${userId}_${Date.now().toString(36)}_${rand}`;
}

export function parseUserIdFromAsaasReference(reference: string | undefined | null) {
  if (!reference) return null;
  const parts = reference.split('_');
  if (parts[0] !== 'rjasaas' || parts.length < 3) return null;
  return parts[1] || null;
}

export function isAsaasPaymentPaid(status: string | undefined) {
  return status === 'RECEIVED' || status === 'CONFIRMED' || status === 'RECEIVED_IN_CASH';
}

export function isAsaasPaymentFailed(status: string | undefined) {
  return (
    status === 'REFUNDED' ||
    status === 'CHARGEBACK_REQUESTED' ||
    status === 'CHARGEBACK_DISPUTE' ||
    status === 'REFUND_REQUESTED'
  );
}

/**
 * Falhas de configuração da conta Asaas (site ausente, cartão não habilitado,
 * cadastro em análise) não dizem nada para quem está comprando.
 */
const ASAAS_ACCOUNT_SETUP_PATTERNS = [
  /dom[íi]nio/i,
  /cadastre um site/i,
  /minha conta/i,
  /em an[áa]lise/i,
  /n[ãa]o (est[áa]|foi) habilitad/i,
  /aguardando aprova/i,
  /documenta[çc][ãa]o/i
];

export function isAsaasAccountSetupError(message: string) {
  return ASAAS_ACCOUNT_SETUP_PATTERNS.some((pattern) => pattern.test(message));
}

export function describeAsaasCheckoutError(error: unknown, method: 'pix' | 'card') {
  const raw = error instanceof Error ? error.message.trim() : '';
  if (raw && !isAsaasAccountSetupError(raw)) return raw;
  return method === 'card'
    ? 'O pagamento com cartão está indisponível agora. Pague com Pix: o QR aparece aqui e o Premium libera na hora.'
    : 'O Pix está indisponível agora. Tente novamente em alguns minutos.';
}

function dueDatePlusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'Cliente',
    lastName: parts.slice(1).join(' ') || 'PrecisouTaPronto'
  };
}

/** Cria cliente Asaas (ou reaproveita se já existir pelo e-mail). */
export async function ensureAsaasCustomer(input: {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await asaasFetch<{ data?: AsaasCustomer[] }>(
    `/customers?email=${encodeURIComponent(email)}&limit=1`
  );
  const found = existing.data?.[0];
  if (found?.id) return found;

  const { firstName, lastName } = splitName(input.name);
  return asaasFetch<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: `${firstName} ${lastName}`.trim(),
      email,
      cpfCnpj: input.cpfCnpj ? input.cpfCnpj.replace(/\D/g, '') : undefined,
      mobilePhone: input.phone ? input.phone.replace(/\D/g, '') : undefined,
      notificationDisabled: true
    })
  });
}

export async function createAsaasPixPremium(input: {
  userId: string;
  name: string;
  email: string;
  cpfCnpj?: string;
  product?: string;
}) {
  const product = getBillingProduct(input.product);
  const reference = buildAsaasReference(input.userId);
  const customer = await ensureAsaasCustomer({
    name: input.name,
    email: input.email,
    cpfCnpj: input.cpfCnpj
  });

  const payment = await asaasFetch<AsaasPayment>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: customer.id,
      billingType: 'PIX',
      value: product.price,
      dueDate: dueDatePlusDays(0),
      description: product.title,
      externalReference: reference
    })
  });

  const qr = await asaasFetch<AsaasPixQrCode>(`/payments/${encodeURIComponent(payment.id)}/pixQrCode`);

  if (!qr.payload) {
    throw new Error('A Asaas não retornou o código Pix. Tente novamente.');
  }

  return {
    payment,
    reference,
    qrCodePayload: qr.payload,
    qrCodeImageBase64: qr.encodedImage || '',
    expiresAt: qr.expirationDate || null,
    mode: getAsaasMode()
  };
}

/**
 * Cria cobrança de cartão e devolve a invoiceUrl hospedada pela Asaas
 * (dados do cartão ficam no ambiente PCI deles).
 */
export async function createAsaasCardPremiumCheckout(input: {
  userId: string;
  name: string;
  email: string;
  cpfCnpj?: string;
  product?: string;
}) {
  const product = getBillingProduct(input.product);
  const reference = buildAsaasReference(input.userId);
  const customer = await ensureAsaasCustomer({
    name: input.name,
    email: input.email,
    cpfCnpj: input.cpfCnpj
  });
  const appUrl = getAppPublicUrl();

  const payment = await asaasFetch<AsaasPayment>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: customer.id,
      billingType: 'CREDIT_CARD',
      value: product.price,
      dueDate: dueDatePlusDays(1),
      description: product.title,
      externalReference: reference,
      callback: {
        successUrl: `${appUrl}/checkout?method=asaas&billing=asaas-success`,
        autoRedirect: true
      }
    })
  });

  const checkoutUrl = payment.invoiceUrl;
  if (!checkoutUrl) {
    throw new Error('A Asaas criou a cobrança, mas não retornou a URL de pagamento.');
  }

  return {
    payment,
    reference,
    checkoutUrl,
    mode: getAsaasMode()
  };
}

export async function getAsaasPayment(paymentId: string) {
  return asaasFetch<AsaasPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}

export function getAsaasWebhookUrl() {
  return `${getAppPublicUrl()}/api/webhooks/asaas`;
}
