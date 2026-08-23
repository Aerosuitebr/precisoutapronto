/** Identidade pública e ponte de migração da marca. */

export const BRAND_NAME = 'Precisou, Tá Pronto';
export const BRAND_DISPLAY_NAME = 'Precisou? Tá Pronto!';
export const BRAND_SHORT_NAME = 'Precisou Tá Pronto';
export const BRAND_TAGLINE = 'Documentos, cálculos e ferramentas para resolver em minutos';
export const BRAND_DESCRIPTION =
  'Plataforma brasileira de ferramentas online para PDFs, imagens, documentos, cálculos e rotina profissional.';
export const BRAND_OFFICIAL_PATH = '/precisou-ta-pronto';

export const BRAND_HOST = 'precisoutapronto.com.br';
export const BRAND_LEGACY_HOST = 'resolvajato.com.br';

export const BRAND_PRIMARY_SITE = `https://${BRAND_HOST}`;
export const BRAND_LEGACY_SITE = `https://${BRAND_LEGACY_HOST}`;
/** URL operacional; troca automaticamente quando NEXT_PUBLIC_APP_URL mudar no corte. */
export const BRAND_SITE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || BRAND_PRIMARY_SITE;

/**
 * Mantém a caixa atual enquanto o Google Workspace não for migrado.
 * Depois da ativação, basta definir NEXT_PUBLIC_CONTACT_EMAIL no ambiente.
 */
export const BRAND_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || `contato@${BRAND_LEGACY_HOST}`;
/** Endereço público da marca nova. A caixa SMTP pode continuar no domínio legado até o Workspace migrar. */
export const BRAND_PUBLIC_EMAIL = `contato@${BRAND_HOST}`;

/** Remetente SMTP / Resend no formato RFC. */
export const BRAND_EMAIL_FROM = `${BRAND_NAME} <${BRAND_EMAIL}>`;

/** Perfis públicos confirmados para Organization.sameAs. */
export const BRAND_SAME_AS = [
  'https://www.producthunt.com/products/resolva-jato'
] as const;

export const BRAND_LOGO_LIGHT = '/brand/precisou-ta-pronto-logo-light-v1.png';
export const BRAND_LOGO_DARK = '/brand/precisou-ta-pronto-logo-dark-v2.png';
export const BRAND_WATERMARK = '/brand/precisou-ta-pronto-watermark-v1.png';
