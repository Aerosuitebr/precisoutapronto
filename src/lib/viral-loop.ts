/** Loops de viralização: links e textos compartilháveis. */

import { BRAND_DISPLAY_NAME, BRAND_LEGACY_HOST } from '@/lib/brand';

export const VIRAL_SITE_HOST = BRAND_LEGACY_HOST;

export function getViralBaseUrl() {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return `https://${VIRAL_SITE_HOST}`;
}

export function viralHomeUrl(utmCampaign: string) {
  const base = getViralBaseUrl();
  const params = new URLSearchParams({
    utm_source: 'share',
    utm_medium: 'loop',
    utm_campaign: utmCampaign
  });
  return `${base}/?${params.toString()}`;
}

export type OrcamentoViralAttribution = {
  sourceDocumentId?: string;
  sourceOccupation?: string;
};

function withOrcamentoAttribution(path: string, attribution: OrcamentoViralAttribution = {}) {
  const [pathname, query = ''] = path.split('?');
  const params = new URLSearchParams(query);
  if (attribution.sourceDocumentId) params.set('source_document', attribution.sourceDocumentId);
  if (attribution.sourceOccupation) params.set('source_occupation', attribution.sourceOccupation);
  return `${pathname}?${params.toString()}`;
}

export function viralOrcamentoSignupPath(attribution: OrcamentoViralAttribution = {}) {
  const attributedTool = withOrcamentoAttribution('/ferramentas/orcamentos', attribution);
  const next = encodeURIComponent(attributedTool);
  return withOrcamentoAttribution(
    `/cadastro?next=${next}&utm_source=share&utm_medium=orcamento_publico&utm_campaign=quero_cobrar`,
    attribution
  );
}

export function viralOrcamentoToolPath(attribution: OrcamentoViralAttribution = {}) {
  return withOrcamentoAttribution(
    `/ferramentas/orcamentos?utm_source=share&utm_medium=orcamento_publico&utm_campaign=quero_cobrar`,
    attribution
  );
}

export function viralOrcamentoSignupUrl() {
  return `${getViralBaseUrl()}${viralOrcamentoSignupPath()}`;
}

export function viralOrcamentoToolUrl() {
  return `${getViralBaseUrl()}${viralOrcamentoToolPath()}`;
}

export function viralPdfFooterLabel() {
  return `Documento gerado com ${BRAND_DISPLAY_NAME} Documentos profissionais gratuitos. ${VIRAL_SITE_HOST}`;
}

export function viralPdfFooterUrl() {
  return viralHomeUrl('pdf_footer');
}

/** Bloco de marca para WhatsApp / e-mail (plano grátis). */
export function viralMessageBrandBlock(utmCampaign = 'whatsapp_message') {
  return (
    `\n\n` +
    `Enviado com ${BRAND_DISPLAY_NAME} Cobranças e documentos profissionais gratuitos.\n` +
    viralHomeUrl(utmCampaign)
  );
}

const VIRAL_MESSAGE_BRAND_RE =
  /\n\n(?:[—–-]{1,3}\n)?Enviado (?:pelo Precisou, Tá Pronto|com Precisou\? Tá Pronto!)[^\n]*\nhttps?:\/\/[^\n]+$/i;

export function stripViralMessageBrand(text: string) {
  return text.replace(VIRAL_MESSAGE_BRAND_RE, '').trimEnd();
}

/**
 * Garante (ou remove) a referência Precisou, Tá Pronto no final da mensagem.
 * No plano pago (`branded=false`) a marca é retirada; no grátis é forçada no servidor.
 */
export function withViralMessageBrand(
  text: string,
  branded: boolean,
  utmCampaign = 'whatsapp_message'
) {
  const base = stripViralMessageBrand(text.trimEnd());
  if (!branded) return base;
  return `${base}${viralMessageBrandBlock(utmCampaign)}`;
}

/** Mensagem para o profissional indicar o Precisou, Tá Pronto a um colega. */
export function buildViralInviteWhatsAppText() {
  return (
    `Estou cobrando com orçamento + Pix no WhatsApp usando ${BRAND_DISPLAY_NAME}\n` +
    `Cliente aprova no celular e paga na hora. Grátis pra testar:\n` +
    viralHomeUrl('whatsapp_invite')
  );
}

export function buildViralInviteWhatsAppUrl() {
  return `https://wa.me/?text=${encodeURIComponent(buildViralInviteWhatsAppText())}`;
}

/** Texto sugerido após baixar um PDF (currículo, proposta, etc.). */
export function buildViralPdfShareWhatsAppText(docLabel: string) {
  return (
    `Gerei meu ${docLabel} com ${BRAND_DISPLAY_NAME} Ficou profissional em minutos.\n` +
    `Faça o seu grátis: ${viralHomeUrl('pdf_whatsapp')}`
  );
}

export function buildViralPdfShareWhatsAppUrl(docLabel: string) {
  return `https://wa.me/?text=${encodeURIComponent(buildViralPdfShareWhatsAppText(docLabel))}`;
}

/**
 * Link com UTM pra ferramentas públicas (calculadoras) usado no rodapé dos
 * resumos compartilhados por WhatsApp e nos cards de imagem pra Stories.
 * `toolPath` deve ser a URL pública da ferramenta (ex: /calculadora-de-rescisao).
 */
export function viralToolShareUrl(toolPath: string, utmCampaign: string) {
  const base = getViralBaseUrl();
  const params = new URLSearchParams({
    utm_source: 'share',
    utm_medium: 'ferramenta_gratis',
    utm_campaign: utmCampaign
  });
  return `${base}${toolPath}?${params.toString()}`;
}

export function viralPublicResultUrl(input: {
  title: string;
  highlightLabel: string;
  highlightValue: string;
  lines: Array<{ label: string; value: string }>;
  toolPath: string;
  campaign: string;
}) {
  const params = new URLSearchParams({
    titulo: input.title.slice(0, 100),
    rotulo: input.highlightLabel.slice(0, 80),
    valor: input.highlightValue.slice(0, 80),
    ferramenta: input.toolPath.startsWith('/') ? input.toolPath : '/',
    linhas: JSON.stringify(input.lines.slice(0, 5).map((line) => ({ label: line.label.slice(0, 60), value: line.value.slice(0, 60) }))),
    utm_source: 'share',
    utm_medium: 'resultado_jato',
    utm_campaign: input.campaign
  });
  return `${getViralBaseUrl()}/resultado-jato?${params.toString()}`;
}

/** Rodapé padrão anexado aos resumos de calculadoras compartilhados. */
export function viralToolShareFooter(toolPath: string, utmCampaign: string) {
  return `\n\n*CALCULE TAMBÉM*\nAcesse grátis, sem cadastro:\n${viralToolShareUrl(toolPath, utmCampaign)}`;
}
