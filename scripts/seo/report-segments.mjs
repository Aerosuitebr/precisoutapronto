/** Classificação de relatórios; não controla robots, sitemap ou indexação. */
export function normalizePath(value) {
  if (!value || value === '(not set)') return '';
  try { return new URL(value, 'https://precisoutapronto.com.br').pathname.replace(/\/$/, '') || '/'; }
  catch { return ''; }
}

export function pageSegment(value) {
  const pathname = normalizePath(value);
  if (/^\/en(?:\/|$)/.test(pathname)) return 'Utilitários — EN';
  if (/^\/games(?:\/|$)/.test(pathname)) return 'Utilitários — Games';
  // "Recibo em PDF" é comercial; apenas as ferramentas genéricas de PDF entram aqui.
  if (/^\/(?:pdf(?:\/|$)|(?:editor-de|juntar|dividir|comprimir|converter|assinar|organizar|proteger|desbloquear|extrair)-pdf(?:-|\/|$))/.test(pathname)) return 'Utilitários — PDF';
  if (pathname === '/' || /^\/(?:orcamento(?:s)?(?:-|\/|$)|modelos-de-orcamento|recibo(?:s)?(?:-|\/|$)|proposta-comercial|gerador-de-(?:recibo|proposta-comercial|contrato|qr-code-pix)|calculadora-de-preco-freelancer|checklist-cobranca-mei|pix(?:\/|$)|para\/(?:mei|freelancers)|pesquisa\/orcamentos-prestadores)/.test(pathname)) return 'Comercial';
  if (/^\/guias\/.*(?:orcamento|recibo|pix|cobrar|cobranca|cliente-nao-pagou|precificar|proposta|sinal|inadimplencia)/.test(pathname)) return 'Comercial';
  return 'Outros — fora do comercial';
}

export function commercialQuery(query) {
  return /recibo|pix|proposta|orçamento|orcamento|cobrança|cobranca|prestador|precifica/i.test(query);
}

export function eventCount(value) {
  // GA4 exporta contagens inteiras; aceita agrupamento pt-BR e en-US.
  const raw = String(value ?? '').trim();
  if (/^\d+$/.test(raw)) return Number(raw);
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(raw)) return Number(raw.replace(/[.,]/g, ''));
  return null;
}
