/** Ciclo de concentração orgânica de 90 dias iniciado em 04/09/2026. */
export const SEO_FOCUS_CYCLE_STARTED_AT = '2026-09-04';
export const SEO_FOCUS_CYCLE_REVIEW_AT = '2026-12-03';

export const SEO_FOCUS_CLUSTERS = [
  {
    id: 'fluxo-prestador',
    label: 'Do orçamento ao recibo',
    href: '/orcamento-com-pix',
    description: 'Enviar orçamento no WhatsApp, aprovar, cobrar com Pix e emitir recibo.'
  },
  {
    id: 'orcamentos-mei',
    label: 'Orçamentos para MEI',
    href: '/modelos-de-orcamento',
    description: 'Criar, enviar e aprovar orçamentos profissionais.'
  },
  {
    id: 'precificacao-propostas',
    label: 'Preço e proposta',
    href: '/calculadora-de-preco-freelancer',
    description: 'Definir preço sustentável e apresentar uma proposta clara.'
  }
] as const;

/** URLs comerciais promovidas pelo sitemap canônico durante o ciclo de 90 dias. */
export const SEO_FOCUS_PATHS = [
  '/',
  '/orcamento-com-pix',
  '/modelos-de-orcamento',
  '/pesquisa/orcamentos-prestadores',
  '/orcamento-para/eletricista',
  '/orcamento-para/pedreiro',
  '/orcamento-para/fotografo',
  '/orcamento-para/manutencao-residencial',
  '/recibos',
  '/recibos/recibo-pagamento-pix',
  '/gerador-de-recibo',
  '/gerador-de-proposta-comercial',
  '/calculadora-de-preco-freelancer',
  '/gerador-de-qr-code-pix',
  '/checklist-cobranca-mei',
  '/para/mei',
  '/guias',
  '/guias/como-fazer-orcamento-com-pix',
  '/guias/modelo-de-orcamento-para-eletricista',
  '/guias/modelo-de-orcamento-para-prestacao-de-servico',
  '/guias/como-cobrar-cliente-pelo-whatsapp',
  '/guias/orcamento-aprovado-tem-validade',
  '/guias/recibo-simples-tem-validade'
] as const;

/** Páginas de confiança que sustentam autoria, transparência e identidade da marca. */
export const SEO_TRUST_PATHS = [
  '/sobre',
  '/precisou-ta-pronto',
  '/imprensa',
  '/autores/equipe-editorial',
  '/criterios-editoriais',
  '/politica-de-correcoes',
  '/qualidade-e-seguranca',
  '/metodologia-calculadoras',
  '/contato'
] as const;

const focusPaths = new Set<string>(SEO_FOCUS_PATHS);

export function isSeoFocusPath(path: string) {
  return focusPaths.has(path);
}

export const FOCUSED_PROFESSION_SLUGS = new Set(
  SEO_FOCUS_PATHS.filter((path) => path.startsWith('/orcamento-para/')).map((path) =>
    path.replace('/orcamento-para/', '')
  )
);

/**
 * As páginas que usam este helper são landings públicas e canônicas.
 * Fora do foco, a página continua pública e seus links continuam rastreáveis,
 * mas ela não disputa indexação durante o ciclo editorial.
 */
export function temporaryNoindexRobots(index: boolean) {
  return { index, follow: true };
}
