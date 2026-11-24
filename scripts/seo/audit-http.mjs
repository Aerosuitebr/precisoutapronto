const base = (process.env.SEO_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const canonicalBase = (process.env.SEO_CANONICAL_URL || 'https://precisoutapronto.com.br').replace(/\/$/, '');

async function request(path) {
  const response = await fetch(`${base}${path}`, { redirect: 'manual' });
  return { response, body: await response.text() };
}

const failures = [];
const focusPaths = ['/gerador-de-curriculo', '/gerador-de-recibo', '/editor-de-pdf-online', '/modelos-de-orcamento', '/depoimentos'];
const checks = [
  ['/', 200, 'text/html'],
  ['/robots.txt', 200, 'text/plain'],
  ['/sitemap.xml', 200, 'application/xml'],
  ['/sitemaps/index.xml', 200, 'application/xml'],
  ['/sitemaps/index', 200, 'application/xml'],
  ['/biblioteca', 200, 'text/html'],
  ...focusPaths.map((path) => [path, 200, 'text/html']),
  ['/modelos/contrato-de-prestacao-de-servicos', 200, 'text/html'],
  ['/recibo-de-pagamento', 200, 'text/html'],
  ['/proposta-comercial-mei', 200, 'text/html'],
  ['/para/autonomos', 308, 'text/html'],
  ['/pagina-que-nao-deve-existir-audit', 404, 'text/html']
];

const results = new Map();
for (const [path, expectedStatus, expectedType] of checks) {
  const result = await request(path);
  results.set(path, result);
  const type = result.response.headers.get('content-type') || '';
  if (result.response.status !== expectedStatus) {
    failures.push(`${path}: status ${result.response.status}, esperado ${expectedStatus}`);
  }
  const isRedirect = [301, 302, 307, 308].includes(expectedStatus);
  // Redirects podem omitir Content-Type e alguns cabeçalhos de segurança no hop inicial.
  if (!isRedirect && !type.includes(expectedType)) {
    failures.push(`${path}: Content-Type ${type || 'ausente'}, esperado ${expectedType}`);
  }
  if (!isRedirect && result.response.headers.get('x-content-type-options') !== 'nosniff') {
    failures.push(`${path}: cabeçalho X-Content-Type-Options ausente`);
  }
}

const home = results.get('/').body;
if (!home.includes(`rel="canonical" href="${canonicalBase}"`)) {
  failures.push('/: canonical de produção ausente');
}
if (!home.includes('<title>Precisou, Tá Pronto: ferramentas online grátis</title>')) {
  failures.push('/: title de marca estável ausente');
}

for (const path of focusPaths) {
  const { response, body } = results.get(path);
  if (!body.includes(`rel="canonical" href="${canonicalBase}${path}"`)) {
    failures.push(`${path}: canonical autorreferente ausente`);
  }
  const robots = body.match(/<meta\s+name="(?:robots|googlebot)"[^>]*>/gi) || [];
  if (/\bnoindex\b/i.test([response.headers.get("x-robots-tag"), ...robots].join(" "))) {
    failures.push(`${path}: noindex em página promovida`);
  }
}

const library = results.get('/biblioteca').body;
if (!library.includes(`rel="canonical" href="${canonicalBase}/biblioteca"`)) {
  failures.push('/biblioteca: canonical incorreto ou ausente');
}

const recibo = results.get('/recibo-de-pagamento').body;
if (!recibo.includes(`rel="canonical" href="${canonicalBase}/recibo-de-pagamento"`)) {
  failures.push('/recibo-de-pagamento: canonical autorreferente ausente');
}
if (recibo.includes('hreflang')) {
  failures.push('/recibo-de-pagamento: hreflang indevido');
}

const proposta = results.get('/proposta-comercial-mei').body;
if (!proposta.includes(`rel="canonical" href="${canonicalBase}/proposta-comercial-mei"`)) {
  failures.push('/proposta-comercial-mei: canonical autorreferente ausente');
}
if (proposta.includes('hreflang')) {
  failures.push('/proposta-comercial-mei: hreflang indevido');
}

const autonomos = results.get('/para/autonomos');
const autonomosLocation = autonomos.response.headers.get('location') || '';
if (![301, 308].includes(autonomos.response.status) || !autonomosLocation.includes('/para/freelancers')) {
  failures.push('/para/autonomos: redirect permanente para /para/freelancers ausente');
}

const robots = results.get('/robots.txt').body.replace(/\r\n/g, '\n');
const crawlerGroups = robots.split(/\n[ \t]*\n/);
for (const agent of ['OAI-SearchBot', 'Google-Extended', 'GPTBot']) {
  const group = crawlerGroups.find((section) =>
    section.split(/\r?\n/).some((line) => line.toLowerCase() === `user-agent: ${agent.toLowerCase()}`)
  );
  if (!group?.includes('Allow: /\n') || !group.includes('Disallow: /documento/')) {
    failures.push(`/robots.txt: regras de rastreamento público incompletas para ${agent}`);
  }
}
if (!robots.includes(`Sitemap: ${canonicalBase}/sitemaps/index\n`)) {
  failures.push('/robots.txt: Sitemap /sitemaps/index ausente');
}
if (!robots.includes(`Sitemap: ${canonicalBase}/sitemaps/index.xml`)) {
  failures.push('/robots.txt: índice de sitemaps ausente');
}
if (/^Disallow:\s*\/conta\s*$/m.test(robots)) {
  failures.push('/robots.txt: Disallow /conta sem delimitador (bloqueia /contato)');
}
if (!robots.includes('Allow: /contato')) {
  failures.push('/robots.txt: Allow /contato ausente');
}
if (!robots.includes('Allow: /ferramentas$')) {
  failures.push('/robots.txt: Allow explícito do catálogo /ferramentas ausente');
}
if (!robots.includes('Disallow: /conta$') && !robots.includes('Disallow: /conta/')) {
  failures.push('/robots.txt: Disallow /conta$ ou /conta/ ausente');
}

const sitemap = results.get('/sitemap.xml').body;
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const escapedCanonicalBase = canonicalBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const privatePath = new RegExp(`^${escapedCanonicalBase}/(?:api|conta(?:/|$)|ferramentas(?:/|$)|checkout(?:/|$)|login(?:/|$)|cadastro(?:/|$)|documento(?:/|$)|orcamento/)`);
const leaked = urls.filter((url) => privatePath.test(url));
if (new Set(urls).size !== urls.length) failures.push('/sitemap.xml: URLs duplicadas');
for (const path of [...focusPaths, '/orcamento-com-pix', '/gerador-de-proposta-comercial', '/recibos/recibo-pagamento-pix', '/orcamento-para/eletricista', '/orcamento-para/chaveiro', '/orcamento-para/marceneiro', '/orcamento-para/gesseiro', '/orcamento-para/instalacao-de-piso']) {
  if (!urls.includes(`${canonicalBase}${path}`)) failures.push(`/sitemap.xml: página comercial ausente: ${path}`);
}
if (leaked.length) failures.push(`/sitemap.xml: URLs privadas encontradas: ${leaked.join(', ')}`);

const sitemapIndex = results.get('/sitemaps/index.xml').body;
if ((sitemapIndex.match(/<sitemap>/g) || []).length !== 4) {
  failures.push('/sitemaps/index.xml: quantidade inesperada de segmentos');
}
if (sitemapIndex.includes('/sitemaps/games')) {
  failures.push('/sitemaps/index.xml: segmento games ainda no índice canônico');
}

const notFound = results.get('/pagina-que-nao-deve-existir-audit').body;
if (!notFound.includes('noindex') || !notFound.includes('Esta página não foi encontrada')) {
  failures.push('404: conteúdo personalizado ou noindex ausente');
}

if (failures.length) {
  console.error(`Smoke test SEO falhou (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Smoke test SEO aprovado em ${base}: ${checks.length} endpoints, ${urls.length} URLs e 4 sitemaps no índice canônico.`);
