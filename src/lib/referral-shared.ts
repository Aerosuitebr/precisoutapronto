import { getViralBaseUrl } from '@/lib/viral-loop';

export const REFERRAL_BATCH_SIZE = 3;
export const REFERRAL_MILESTONE_DAYS = [7, 7, 16] as const;
export const REFERRED_WELCOME_PREMIUM_DAYS = 7;
export const REFERRAL_STORAGE_KEY = 'rj_referral_code';

export function normalizeReferralCode(raw: string | null | undefined) {
  const code = (raw || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return code.length >= 4 && code.length <= 16 ? code : '';
}

export function buildReferralInviteUrl(code: string) {
  const base = getViralBaseUrl();
  const params = new URLSearchParams({
    ref: code,
    utm_source: 'referral',
    utm_medium: 'invite',
    utm_campaign: 'premium_3friends'
  });
  return `${base}/orcamento-com-pix?${params.toString()}#montar`;
}

/** @deprecated Convites agora começam na ferramenta pública, sem exigir conta. */
export const buildReferralSignupUrl = buildReferralInviteUrl;

export function buildReferralWhatsAppUrl(code: string) {
  const link = buildReferralInviteUrl(code);
  const text =
    `Estou usando o Precisou, Tá Pronto pra orçamento + Pix no WhatsApp.\n` +
    `Teste grátis, sem cadastro, por este link:\n${link}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildReferralSharePayload(code: string): ShareData {
  return {
    title: 'Convite Precisou, Tá Pronto',
    text: 'Teste grátis o orçamento com Pix do Precisou, Tá Pronto. Não precisa criar conta para começar.',
    url: buildReferralInviteUrl(code)
  };
}
