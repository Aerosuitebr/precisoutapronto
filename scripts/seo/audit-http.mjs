const base = (process.env.SEO_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

async function request(path) {
  const response = await fetch(`${base}${path}`, { redirect: 'manual' });
  return { response, body: await response.text() };
}

const failures = [];
const checks = [
  ['/', 200, 'text/html'],
  ['/robots.txt', 200, 'text/plain'],
  ['/sitemap.xml', 200, 'application/xml'],
  ['/sitemaps/index.xml', 200, 'application/xml'],
  ['/biblioteca', 200, 'text/html'],
  ['/modelos/contrato-de-prestacao-de-servicos', 200, 'text/html'],
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
  if (!type.includes(expectedType)) {
    failures.push(`${path}: Content-Type ${type || 'ausente'}, esperado ${expectedType}`);
  }
  if (result.response.headers.get('x-content-type-options') !== 'nosniff') {
    failures.push(`${path}: cabeçalho X-Content-Type-Options ausente`);
  }
}

const home = results.get('/').body;
if (!home.includes('rel="canonical" href="https://resolvajato.com.br"')) {
  failures.push('/: canonical de produção ausente');
}

const library = results.get('/biblioteca').body;
if (!library.includes('rel="canonical" href="https://resolvajato.com.br/biblioteca"')) {
  failures.push('/biblioteca: canonical incorreto ou ausente');
}

const robots = results.get('/robots.txt').body;
if (!robots.includes('Sitemap: https://resolvajato.com.br/sitemaps/index.xml')) {
  failures.push('/robots.txt: índice de sitemaps ausente');
}

const sitemap = results.get('/sitemap.xml').body;
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const privatePath = /^https:\/\/resolvajato\.com\.br\/(?:api|conta(?:\/|$)|ferramentas(?:\/|$)|checkout(?:\/|$)|login(?:\/|$)|cadastro(?:\/|$)|documento(?:\/|$)|orcamento\/)/;
const leaked = urls.filter((url) => privatePath.test(url));
if (urls.length < 100) failures.push(`/sitemap.xml: somente ${urls.length} URLs`);
if (leaked.length) failures.push(`/sitemap.xml: URLs privadas encontradas: ${leaked.join(', ')}`);

const sitemapIndex = results.get('/sitemaps/index.xml').body;
if ((sitemapIndex.match(/<sitemap>/g) || []).length !== 6) {
  failures.push('/sitemaps/index.xml: quantidade inesperada de segmentos');
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

console.log(`Smoke test SEO aprovado em ${base}: ${checks.length} endpoints, ${urls.length} URLs e 6 sitemaps segmentados.`);
