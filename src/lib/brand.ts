/** Identidade pública oficial da marca. */

export const BRAND_NAME = 'Precisou, Tá Pronto';
export const BRAND_DISPLAY_NAME = 'Precisou, Tá Pronto';
export const BRAND_SHORT_NAME = BRAND_NAME;
export const BRAND_ALTERNATE_NAMES = ['Precisou Tá Pronto'] as const;
export const BRAND_CATEGORY = 'Orçamento, cobrança Pix e recibo para prestadores';
export const BRAND_TAGLINE = 'Orçamento no WhatsApp, cobrança Pix e recibo para prestadores';
export const BRAND_DESCRIPTION =
  'Precisou, Tá Pronto ajuda prestadores a criar orçamento, enviar pelo WhatsApp, receber aprovação, cobrar com Pix e emitir recibo em PDF.';
export const BRAND_OFFICIAL_PATH = '/precisou-ta-pronto';
export const BRAND_AUTHOR_PATH = '/autores/equipe-editorial';

export const BRAND_HOST = 'precisoutapronto.com.br';

export const BRAND_PRIMARY_SITE = `https://${BRAND_HOST}`;
/** URL operacional, sempre com fallback para o domínio oficial. */
export const BRAND_SITE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || BRAND_PRIMARY_SITE;

export const BRAND_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || `contato@${BRAND_HOST}`;
export const BRAND_PUBLIC_EMAIL = BRAND_EMAIL;

/** Remetente SMTP / Resend no formato RFC. */
export const BRAND_EMAIL_FROM = `${BRAND_NAME} <${BRAND_EMAIL}>`;

/**
 * Identidade oficial em páginas próprias até existirem perfis sociais publicados.
 * Acrescente LinkedIn, Google Business ou YouTube somente com URL real conferida.
 */
export const BRAND_SAME_AS = [
  `${BRAND_PRIMARY_SITE}${BRAND_OFFICIAL_PATH}`,
  `${BRAND_PRIMARY_SITE}/imprensa`,
  `${BRAND_PRIMARY_SITE}/sobre`
] as const;

export const BRAND_LOGO_LIGHT = '/brand/precisou-ta-pronto-logo-light-v1.png';
export const BRAND_LOGO_DARK = '/brand/precisou-ta-pronto-logo-dark-v2.png';
export const BRAND_WATERMARK = '/brand/precisou-ta-pronto-watermark-v1.png';
