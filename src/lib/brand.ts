/** Identidade pública do Resolva Jato (contato, schema, e-mail). */

export const BRAND_NAME = 'Resolva Jato';
export const BRAND_TAGLINE = 'Ferramentas online que resolvem de verdade';
export const BRAND_DESCRIPTION =
  'Plataforma brasileira de ferramentas online para PDFs, imagens, documentos, cálculos e rotina profissional.';
export const BRAND_OFFICIAL_PATH = '/resolva-jato';

export const BRAND_HOST = 'resolvajato.com.br';

export const BRAND_SITE = `https://${BRAND_HOST}`;

/** Caixa oficial Google Workspace. */
export const BRAND_EMAIL = `contato@${BRAND_HOST}`;

/** Remetente SMTP / Resend no formato RFC. */
export const BRAND_EMAIL_FROM = `${BRAND_NAME} <${BRAND_EMAIL}>`;

/** Perfis públicos confirmados para Organization.sameAs. */
export const BRAND_SAME_AS = [
  'https://www.producthunt.com/products/resolva-jato'
] as const;
