/** Identidade pública oficial da marca. */

export const BRAND_NAME = 'Precisou, Tá Pronto';
export const BRAND_DISPLAY_NAME = 'Precisou? Tá Pronto!';
export const BRAND_SHORT_NAME = 'Precisou Tá Pronto';
export const BRAND_TAGLINE = 'Orçamento no WhatsApp, aprovado, Pix recebido';
export const BRAND_DESCRIPTION =
  'Monte o orçamento, envie o link no WhatsApp e receba a aprovação no celular. Recibo em PDF sem cadastro para começar. Cliente não instala aplicativo.';
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

/** Perfis públicos confirmados para Organization.sameAs. Vazio até existir perfil da marca nova. */
export const BRAND_SAME_AS = [] as const;

export const BRAND_LOGO_LIGHT = '/brand/precisou-ta-pronto-logo-light-v1.png';
export const BRAND_LOGO_DARK = '/brand/precisou-ta-pronto-logo-dark-v2.png';
export const BRAND_WATERMARK = '/brand/precisou-ta-pronto-watermark-v1.png';
