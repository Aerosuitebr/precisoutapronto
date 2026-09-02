/** Ciclo de concentração orgânica iniciado em 29/08/2026. */
export const SEO_FOCUS_CYCLE_STARTED_AT = '2026-08-29';
export const SEO_FOCUS_CYCLE_REVIEW_AT = '2026-09-28';

/** Únicas URLs promovidas pelo sitemap canônico durante o ciclo de 30 dias. */
export const SEO_FOCUS_PATHS = [
  '/',
  '/orcamento-com-pix',
  '/modelos-de-orcamento',
  '/orcamento-para/eletricista',
  '/orcamento-para/pedreiro',
  '/orcamento-para/fotografo',
  '/orcamento-para/manutencao-residencial',
  '/recibos',
  '/recibos/recibo-pagamento-pix',
  '/recibos/modelo-de-recibo-simples',
  '/gerador-de-recibo',
  '/gerador-de-contrato',
  '/recibo-de-pagamento',
  '/gerador-de-qr-code-pix',
  '/gerador-de-proposta-comercial',
  '/calculadora-de-preco-freelancer',
  '/calculadora-de-rescisao',
  '/calculadora-de-ferias',
  '/calculadora-de-decimo-terceiro',
  '/rescisao',
  '/para/mei',
  '/para/freelancers',
  '/guias',
  '/guias/como-fazer-orcamento-com-pix',
  '/guias/modelo-de-orcamento-para-eletricista',
  '/guias/modelo-de-orcamento-para-prestacao-de-servico',
  '/guias/como-cobrar-cliente-pelo-whatsapp',
  '/guias/calculo-rescisao-com-fgts',
  '/guias/recibo-simples-tem-validade',
  '/corretor-de-redacao-enem'
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

export function temporaryNoindexRobots(index: boolean) {
  return index
    ? { index: true, follow: true }
    : { index: false, follow: true, nocache: true };
}
