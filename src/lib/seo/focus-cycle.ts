/** Ciclo de concentração orgânica iniciado em 29/08/2026. */
export const SEO_FOCUS_CYCLE_STARTED_AT = '2026-08-29';
export const SEO_FOCUS_CYCLE_REVIEW_AT = '2026-09-28';

export const SEO_FOCUS_CLUSTERS = [
  {
    id: 'recibos-pix',
    label: 'Recibos e Pix',
    href: '/recibos',
    description: 'Emitir recibo, comprovar pagamentos e cobrar com Pix.'
  },
  {
    id: 'orcamentos-mei',
    label: 'Orçamentos para MEI',
    href: '/modelos-de-orcamento',
    description: 'Criar, enviar e aprovar orçamentos profissionais.'
  },
  {
    id: 'calculos-trabalhistas',
    label: 'Cálculos trabalhistas',
    href: '/rescisao',
    description: 'Calcular rescisão, férias, 13º salário e FGTS.'
  }
] as const;

/** Únicas URLs promovidas pelo sitemap canônico durante o ciclo de 30 dias. */
export const SEO_FOCUS_PATHS = [
  '/',
  '/orcamento-com-pix',
  '/orcamento-pix-copia-e-cola',
  '/modelos-de-orcamento',
  '/pesquisa/orcamentos-prestadores',
  '/orcamento-para/eletricista',
  '/orcamento-para/pedreiro',
  '/orcamento-para/fotografo',
  '/orcamento-para/manutencao-residencial',
  '/recibos',
  '/recibos/recibo-pagamento-pix',
  '/recibos/modelo-de-recibo-simples',
  '/recibos/recibo-prestacao-de-servico',
  '/gerador-de-recibo',
  '/recibo-de-pagamento',
  '/gerador-de-qr-code-pix',
  '/calculadora-de-rescisao',
  '/calculadora-de-ferias',
  '/calculadora-de-decimo-terceiro',
  '/rescisao',
  '/checklist-cobranca-mei',
  '/para/mei',
  '/guias',
  '/guias/como-fazer-orcamento-com-pix',
  '/guias/modelo-de-orcamento-para-eletricista',
  '/guias/modelo-de-orcamento-para-prestacao-de-servico',
  '/guias/como-cobrar-cliente-pelo-whatsapp',
  '/guias/como-calcular-rescisao',
  '/guias/calculo-rescisao-com-fgts',
  '/guias/recibo-simples-tem-validade'
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
 * O argumento é preservado temporariamente para não quebrar os chamadores do
 * antigo ciclo de concentração, mas não limita mais a indexação.
 */
export function temporaryNoindexRobots(_index: boolean) {
  return { index: true, follow: true };
}
