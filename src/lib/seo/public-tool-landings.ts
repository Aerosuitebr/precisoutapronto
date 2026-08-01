/**
 * Mapa canônico: ID de ferramenta (tools-catalog) → URL pública indexável.
 * CTAs de marketing e SEO devem preferir estes paths a `/ferramentas/*`
 * (Disallow + noindex: o Google não segue nem indexa a área autenticada).
 */
export const PUBLIC_TOOL_LANDINGS: Record<string, string> = {
  contratos: '/gerador-de-contrato',
  recibos: '/gerador-de-recibo',
  curriculo: '/gerador-de-curriculo',
  propostas: '/gerador-de-proposta-comercial',
  orcamentos: '/orcamento-com-pix',
  juridicos: '/documentos-juridicos-online',
  contabeis: '/documentos-contabeis-online',
  rescisao: '/calculadora-de-rescisao',
  precificacao: '/calculadora-de-preco-freelancer',
  'mei-vs-clt': '/mei-ou-clt',
  pix: '/gerador-de-qr-code-pix',
  'redacao-enem': '/corretor-de-redacao-enem',
  ferias: '/calculadora-de-ferias',
  'decimo-terceiro': '/calculadora-de-decimo-terceiro',
  'editor-pdf': '/editor-de-pdf-online',
  'referencias-abnt': '/gerador-de-referencias-abnt',
  agenda: '/agenda-online',
  'divisor-conta': '/divisor-de-conta'
};

/** Paths privados `/ferramentas/...` → equivalente público, quando existir. */
const PRIVATE_TO_PUBLIC: Record<string, string> = {
  '/ferramentas/contratos': '/gerador-de-contrato',
  '/ferramentas/recibos': '/gerador-de-recibo',
  '/ferramentas/curriculo': '/gerador-de-curriculo',
  '/ferramentas/propostas': '/gerador-de-proposta-comercial',
  '/ferramentas/orcamentos': '/orcamento-com-pix',
  '/ferramentas/juridicos': '/documentos-juridicos-online',
  '/ferramentas/contabeis': '/documentos-contabeis-online',
  '/ferramentas/rescisao': '/calculadora-de-rescisao',
  '/ferramentas/precificacao': '/calculadora-de-preco-freelancer',
  '/ferramentas/mei-vs-clt': '/mei-ou-clt',
  '/ferramentas/pix': '/gerador-de-qr-code-pix',
  '/ferramentas/redacao-enem': '/corretor-de-redacao-enem',
  '/ferramentas/editor-pdf': '/editor-de-pdf-online',
  '/ferramentas/referencias-abnt': '/gerador-de-referencias-abnt',
  '/ferramentas/agenda': '/agenda-online',
  '/ferramentas/divisor-conta': '/divisor-de-conta',
  '/ferramentas': '/recursos'
};

/** Âncora da demo ao vivo nas landings de ferramenta (`ToolLandingEmbed`). */
export const TOOL_DEMO_HASH = '#ferramenta';

export function publicLandingForToolId(toolId: string | null | undefined): string | null {
  if (!toolId) return null;
  return PUBLIC_TOOL_LANDINGS[toolId] || null;
}

/**
 * Converte href interno para URL indexável quando houver equivalente.
 * Preserva query e hash originais.
 */
export function toPublicToolHref(href: string): string {
  const qIndex = href.indexOf('?');
  const hIndex = href.indexOf('#');
  let path = href;
  let suffix = '';
  if (qIndex >= 0 || hIndex >= 0) {
    const cut = Math.min(
      qIndex >= 0 ? qIndex : href.length,
      hIndex >= 0 ? hIndex : href.length
    );
    path = href.slice(0, cut);
    suffix = href.slice(cut);
  }
  const normalized = path.replace(/\/$/, '') || '/';
  const mapped = PRIVATE_TO_PUBLIC[normalized];
  if (!mapped) return href;
  return `${mapped}${suffix}`;
}

/** CTA da landing: mesma página, âncora da demo (evita /ferramentas noindex). */
export function toolDemoHref(landingPath: string): string {
  const base = landingPath.split('?')[0]?.split('#')[0] || landingPath;
  return `${base}${TOOL_DEMO_HASH}`;
}

export function hasPublicLanding(toolId: string): boolean {
  return Boolean(PUBLIC_TOOL_LANDINGS[toolId]);
}
