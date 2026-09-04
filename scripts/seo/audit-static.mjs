import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const required = [
  'src/app/layout.tsx',
  'src/app/not-found.tsx',
  'src/app/robots.txt/route.ts',
  'src/app/sitemaps/[segment]/route.ts',
  'src/app/sitemap.xml/route.ts',
  'public/llms.txt',
  'public/manifest.webmanifest',
  'public/.well-known/security.txt'
];

const failures = [];
const tierFixture = JSON.parse(
  await readFile(path.join(root, 'scripts/seo/tier-fixtures.json'), 'utf8')
);
const tierEntries = Object.entries(tierFixture.tiers || {}).flatMap(([tier, entries]) =>
  entries.map((entry) => ({ ...entry, tier }))
);
const tierPaths = new Set();
for (const entry of tierEntries) {
  if (!entry.path?.startsWith('/') || !entry.routeFile || typeof entry.indexable !== 'boolean') {
    failures.push(`fixture SEO ${entry.tier}: contrato inválido`);
    continue;
  }
  if (tierPaths.has(entry.path)) failures.push(`fixture SEO: URL duplicada ${entry.path}`);
  tierPaths.add(entry.path);
  try {
    if (!(await stat(path.join(root, entry.routeFile))).isFile()) {
      failures.push(`fixture SEO ${entry.path}: routeFile não é arquivo`);
    }
  } catch {
    failures.push(`fixture SEO ${entry.path}: routeFile ausente (${entry.routeFile})`);
  }
}
if (!tierEntries.length) failures.push('fixture SEO: nenhuma URL Tier 0/1 definida');
for (const relative of required) {
  try {
    if (!(await stat(path.join(root, relative))).isFile()) failures.push(`${relative}: não é arquivo`);
  } catch {
    failures.push(`${relative}: ausente`);
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const target = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(target) : [target];
      })
    )
  ).flat();
}

const publicPages = (await walk(path.join(root, 'src/app')))
  .filter((file) => file.endsWith(`${path.sep}page.tsx`))
  .filter((file) => !file.includes(`${path.sep}api${path.sep}`));

const criticalPublicPrefixes = [
  `${path.sep}guias${path.sep}`,
  `${path.sep}modelos${path.sep}`,
  `${path.sep}para${path.sep}`,
  `${path.sep}games${path.sep}`
];

for (const file of publicPages) {
  if (!criticalPublicPrefixes.some((prefix) => file.includes(prefix))) continue;
  const source = await readFile(file, 'utf8');
  if (!/metadata|generateMetadata/.test(source)) {
    failures.push(`${path.relative(root, file)}: sem metadados`);
  }
}

const sitemapSource = await readFile(path.join(root, 'src/lib/seo/sitemap-entries.ts'), 'utf8');
for (const segment of ['core', 'tools', 'growth', 'guides', 'games', 'i18n']) {
  if (!sitemapSource.includes(`'${segment}'`)) failures.push(`sitemap: segmento ${segment} ausente`);
}

const selfCanonicalLandings = [
  ['src/app/recibo-de-pagamento/page.tsx', 'content.path'],
  ['src/app/proposta-comercial-mei/page.tsx', 'content.path'],
  ['src/app/recibo-de-aluguel/page.tsx', 'content.path'],
  ['src/app/contrato-de-aluguel/page.tsx', 'content.path']
];

for (const [relative, canonicalExpression] of selfCanonicalLandings) {
  const source = await readFile(path.join(root, relative), 'utf8');
  if (!source.includes(`canonical: ${canonicalExpression}`)) {
    failures.push(`${relative}: canonical nao e autorreferente`);
  }
  if (!source.includes(`url: ${canonicalExpression}`)) {
    failures.push(`${relative}: URL de Open Graph nao corresponde a pagina`);
  }
  if (/languages\s*:/.test(source)) {
    failures.push(`${relative}: hreflang indevido para conteudo sem traducao equivalente`);
  }
}

const catalog = await readFile(path.join(root, 'src/lib/international-tools-catalog.ts'), 'utf8');
const privatePtPaths = [...catalog.matchAll(/ptPath:\s*'([^']+)'/g)]
  .map((match) => match[1])
  .filter((ptPath) => ptPath.startsWith('/ferramentas') || ptPath === '/busca');

// Ferramentas sem landing PT pública podem manter ptPath privado para o LocaleSwitcher,
// mas o hreflang/sitemap precisam bloquear via isPublicIndexablePath.
const i18nSeo = await readFile(path.join(root, 'src/lib/i18n-seo.ts'), 'utf8');
if (!i18nSeo.includes('isPublicIndexablePath')) {
  failures.push('i18n-seo.ts: falta guarda isPublicIndexablePath para hreflang');
}
if (!i18nSeo.includes('includeHreflang') || !i18nSeo.includes('index: false')) {
  failures.push('i18n-seo.ts: EN/ES órfãs devem ser noindex sem landing PT pública');
}

const layout = await readFile(path.join(root, 'src/app/layout.tsx'), 'utf8');
if (!layout.includes('template: `%s | ${BRAND_NAME}`')) {
  failures.push('layout.tsx: title template não usa BRAND_NAME no snippet');
}
if (!layout.includes('lang="pt-BR"')) {
  failures.push('layout.tsx: lang pt-BR estático ausente');
}
if (layout.includes("from 'next/headers'") || layout.includes('await headers(')) {
  failures.push('layout.tsx: headers() no root atrasa title/canonical para depois de </head>');
}

const robotsBody = await readFile(path.join(root, 'src/lib/seo/robots-body.ts'), 'utf8');
if (/\b'\/conta'\b/.test(robotsBody) || /Disallow:\s*\/conta\s*$/m.test(robotsBody)) {
  failures.push('robots-body.ts: Disallow /conta sem delimitador bloqueia /contato');
}
if (!robotsBody.includes('/conta$') || !robotsBody.includes("'/contato'")) {
  failures.push('robots-body.ts: falta /conta$ e Allow /contato');
}
if (!robotsBody.includes("'/ferramentas/redacao-enem'")) {
  failures.push('robots-body.ts: Googlebot nao consegue processar o redirect antigo da redacao');
}
if (!robotsBody.includes("'Google-Extended'") || !robotsBody.includes("'GPTBot'")) {
  failures.push('robots-body.ts: Allow de Google-Extended e GPTBot ausente');
}
if (
  !robotsBody.includes('`Sitemap: ${base}/sitemaps/index`') ||
  !robotsBody.includes('`Sitemap: ${base}/sitemaps/index.xml`') ||
  !robotsBody.includes('`Sitemap: ${base}/sitemap.xml`')
) {
  failures.push('robots-body.ts: robots deve apontar /sitemaps/index, /sitemaps/index.xml e /sitemap.xml');
}
if (robotsBody.includes('/sitemaps/core')) {
  failures.push('robots-body.ts: /sitemaps/core não deve ir no robots');
}

const nextConfig = await readFile(path.join(root, 'next.config.mjs'), 'utf8');
const middlewareSource = await readFile(path.join(root, 'src/middleware.ts'), 'utf8');
if (middlewareSource.includes('robots\\.txt|sitemap\\.xml|sitemaps/')) {
  failures.push('middleware: sitemap e robots precisam entrar no matcher para o host legado receber 301');
}
if (!nextConfig.includes("source: '/para/autonomos'")) {
  failures.push('next.config.mjs: redirect /para/autonomos ausente');
}
if (
  !nextConfig.includes("source: '/ferramentas/redacao-enem'") ||
  !nextConfig.includes("destination: '/corretor-de-redacao-enem'") ||
  !nextConfig.includes('permanent: true')
) {
  failures.push('next.config.mjs: redirect permanente da redacao ENEM ausente');
}

const brandIdentitySource = await readFile(path.join(root, 'src/lib/brand.ts'), 'utf8');
const manifestIdentitySource = await readFile(path.join(root, 'public/manifest.webmanifest'), 'utf8');
const canonicalBrand = 'Precisou, Tá Pronto';
if (!brandIdentitySource.includes(`export const BRAND_NAME = '${canonicalBrand}'`)) {
  failures.push(`marca: BRAND_NAME deve usar a grafia canônica "${canonicalBrand}"`);
}
if (!brandIdentitySource.includes("export const BRAND_DISPLAY_NAME = 'Precisou, Tá Pronto'")) {
  failures.push('marca: BRAND_DISPLAY_NAME deve usar a grafia canônica Precisou, Tá Pronto');
}
if (!brandIdentitySource.includes('BRAND_SAME_AS') || !brandIdentitySource.includes('/imprensa')) {
  failures.push('marca: BRAND_SAME_AS precisa apontar páginas oficiais confirmadas');
}
const manifest = JSON.parse(manifestIdentitySource);
if (manifest.name !== canonicalBrand || manifest.short_name !== canonicalBrand) {
  failures.push(`manifest: name e short_name devem usar "${canonicalBrand}"`);
}
if (
  !nextConfig.includes("source: '/autores/equipe-resolva-jato'") ||
  !nextConfig.includes("destination: '/autores/equipe-editorial'")
) {
  failures.push('next.config.mjs: redirect da autoria anterior para a equipe editorial ausente');
}
if (!nextConfig.includes("key: 'x-forwarded-proto'") || !nextConfig.includes("destination: 'https://precisoutapronto.com.br/:path*'")) {
  failures.push('next.config.mjs: redirect HTTP → HTTPS da aplicação ausente');
}
if (!nextConfig.includes("source: '/sitemaps/:segment.xml'")) {
  failures.push('next.config.mjs: rewrite /sitemaps/:segment.xml ausente');
}
try {
  await stat(path.join(root, 'src/app/sitemap.xml/route.ts'));
} catch {
  failures.push('src/app/sitemap.xml/route.ts: route handler do sitemap canônico ausente');
}
try {
  await stat(path.join(root, 'src/app/sitemap.ts'));
  failures.push('src/app/sitemap.ts: a convenção metadata compete com o route handler e 500 em produção');
} catch {
  // ausente é o comportamento correto
}

const toolsCatalog = await readFile(path.join(root, 'src/lib/tools-catalog.ts'), 'utf8');
if (toolsCatalog.includes('href: "/ferramentas/redacao-enem"')) {
  failures.push('tools-catalog.ts: redacao ENEM ainda cria links para a URL privada');
}

const heroShowcase = await readFile(
  path.join(root, 'src/components/marketing/hero-tools-showcase.tsx'),
  'utf8'
);
if (heroShowcase.includes('path="/ferramentas/redacao-enem"')) {
  failures.push('hero-tools-showcase.tsx: mockup ainda exibe a URL antiga da redacao');
}

const rescisaoPage = await readFile(
  path.join(root, 'src/app/calculadora-de-rescisao/page.tsx'),
  'utf8'
);
if (!rescisaoPage.includes('Calculadora de rescisão online grátis 2026')) {
  failures.push('calculadora-de-rescisao: title de CTR prioritario ausente');
}
if (/[—–]/.test(rescisaoPage)) {
  failures.push('calculadora-de-rescisao: title ainda usa travessao');
}

const recibosContent = await readFile(path.join(root, 'src/lib/seo-pages/recibos.ts'), 'utf8');
if (!recibosContent.includes("metaTitle: 'Gerador de recibo online grátis em PDF'")) {
  failures.push('gerador-de-recibo: title de CTR prioritario ausente');
}
if (/metaTitle:.*[—–]/.test(recibosContent)) {
  failures.push('gerador-de-recibo: title ainda usa travessao');
}

const calculatorsSeo = await readFile(
  path.join(root, 'src/lib/seo/public-calculators.tsx'),
  'utf8'
);
if (!calculatorsSeo.includes('O que entra em cada modalidade de rescisão')) {
  failures.push('public-calculators: falta tabela de modalidades da rescisao');
}
if (!calculatorsSeo.includes('Exemplo numérico 2026: dispensa sem justa causa')) {
  failures.push('public-calculators: falta exemplo numerico 2026 da rescisao');
}
if (!calculatorsSeo.includes('leadWithFaq: true')) {
  failures.push('public-calculators: FAQ da rescisao precisa aparecer antes da dobra editorial');
}
if (!calculatorsSeo.includes('O que entra no cálculo de férias 2026')) {
  failures.push('public-calculators: falta tabela de ferias 2026');
}
if (!calculatorsSeo.includes('/metodologia-calculadoras')) {
  failures.push('public-calculators: falta link para a metodologia');
}

const homePage = await readFile(path.join(root, 'src/app/page.tsx'), 'utf8');
if (!homePage.includes('Precisou, Tá Pronto é o site oficial em precisoutapronto.com.br')) {
  failures.push('home: description de marca estável ausente');
}
if (!homePage.includes('${BRAND_NAME}: orçamento no WhatsApp, recibo e Pix grátis')) {
  failures.push('home: title de marca estável ausente');
}

if (!sitemapSource.includes('export function buildFullSitemap')) {
  failures.push('sitemap-entries: buildFullSitemap ausente');
}
if (!sitemapSource.includes('keepPromoted(entries, base)')) {
  failures.push('sitemap-entries: filtro editorial do ciclo de foco ausente');
}

const landingContent = await readFile(path.join(root, 'src/lib/seo/landing-content.ts'), 'utf8');
if (!landingContent.includes("title: 'Orçamento no WhatsApp: modelo, aprovação e Pix grátis'")) {
  failures.push('orcamento-com-pix: title de CTR ausente');
}

const receiptCluster = await readFile(path.join(root, 'src/lib/seo/receipt-cluster.ts'), 'utf8');
if (!receiptCluster.includes("question: 'O comprovante do Pix serve como recibo?'")) {
  failures.push('recibo-pagamento-pix: FAQ do comprovante Pix ausente');
}

const professionPresets = await readFile(path.join(root, 'src/lib/orcamentos/profession-presets.ts'), 'utf8');
if (!professionPresets.includes("title: 'Orçamento para eletricista: modelo, faixa de preço e Pix'")) {
  failures.push('orcamento-para/eletricista: title de preço ausente');
}
if (!professionPresets.includes("title: 'Quanto custa um eletricista em 2026'")) {
  failures.push('orcamento-para/eletricista: tabela quanto custa ausente');
}

const enemPage = await readFile(path.join(root, 'src/app/corretor-de-redacao-enem/page.tsx'), 'utf8');
if (!enemPage.includes("title: 'Analisar redação ENEM grátis: nota por competência'")) {
  failures.push('corretor-de-redacao-enem: title de analisar redação ausente');
}

const imprensaPage = await readFile(path.join(root, 'src/app/imprensa/page.tsx'), 'utf8');
if (imprensaPage.includes('>Boilerplate longo<') || imprensaPage.includes('>Boilerplate curto<')) {
  failures.push('imprensa: rotulos tecnicos podem vazar para o snippet do Google');
}

if (privatePtPaths.includes('/ferramentas/pix') || privatePtPaths.includes('/ferramentas/mei-vs-clt')) {
  failures.push('international-tools-catalog.ts: pix/mei ainda apontam para /ferramentas/*');
}
if (privatePtPaths.includes('/ferramentas/redacao-enem')) {
  failures.push('international-tools-catalog.ts: redação ENEM ainda aponta para /ferramentas/*');
}

const internationalAgendaPage = await readFile(
  path.join(root, 'src/app/[locale]/tools/agenda/page.tsx'),
  'utf8'
);
if (!internationalAgendaPage.includes("internationalSeo(locale, 'tools/agenda', '/agenda-online')")) {
  failures.push('agenda internacional: canonical/hreflang deve apontar para /agenda-online');
}

const seoPagesDir = path.join(root, 'src/lib/seo-pages');
const seoPageFiles = (await readdir(seoPagesDir))
  .filter((name) => name.endsWith('.ts') && name !== 'types.ts')
  .map((name) => path.join(seoPagesDir, name));
for (const file of seoPageFiles) {
  const source = await readFile(file, 'utf8');
  if (/ctaHref:\s*'\/ferramentas\//.test(source)) {
    failures.push(`${path.relative(root, file)}: ctaHref aponta para /ferramentas (noindex)`);
  }
}

const publicMap = await readFile(path.join(root, 'src/lib/seo/public-tool-landings.ts'), 'utf8');
if (!publicMap.includes('/corretor-de-redacao-enem') || !publicMap.includes('redacao-enem')) {
  failures.push('public-tool-landings.ts: falta mapeamento da redação ENEM');
}
for (const path of [
  '/editor-de-pdf-online',
  '/remover-fundo-de-imagem',
  '/gerador-de-referencias-abnt',
  '/agenda-online',
  '/divisor-de-conta'
]) {
  if (!publicMap.includes(path)) {
    failures.push(`public-tool-landings.ts: falta mapeamento ${path}`);
  }
}

const orphanLandings = await readFile(path.join(root, 'src/lib/seo/orphan-tool-landings.ts'), 'utf8');
if (!orphanLandings.includes("path: '/editor-de-pdf-online'")) {
  failures.push('orphan-tool-landings.ts: faltam landings órfãs');
}
if (!orphanLandings.includes("path: '/remover-fundo-de-imagem'")) {
  failures.push('orphan-tool-landings.ts: falta landing pública do removedor de fundo');
}

const weeklyDashboard = await readFile(path.join(root, 'scripts/seo/build-weekly-dashboard.mjs'), 'utf8');
for (const target of ['/recibo-de-aluguel', '/corretor-de-redacao-enem', '/rescisao', '/gerador-de-contrato']) {
  if (!weeklyDashboard.includes(`'${target}'`)) failures.push(`painel semanal: falta URL prioritária ${target}`);
}

const seoLandingPage = await readFile(path.join(root, 'src/components/marketing/seo-landing-page.tsx'), 'utf8');
if (!seoLandingPage.includes('LandingConversionLink') || !seoLandingPage.includes('footer_primary')) {
  failures.push('seo-landing-page: CTAs primárias sem medição de conversão');
}

const analyticsScripts = await readFile(
  path.join(root, 'src/components/analytics/analytics-scripts.tsx'),
  'utf8'
);
if (!analyticsScripts.includes("consent === 'accepted'") || !analyticsScripts.includes('gaId')) {
  failures.push('analytics-scripts: GA4 ou guarda de consentimento ausente');
}
if (/clarity\.ms|microsoft-clarity|DEFAULT_CLARITY_PROJECT_ID/.test(analyticsScripts)) {
  failures.push('analytics-scripts: Clarity voltou a ser carregado no navegador');
}

// Impede que domínio, e-mail ou nome público anteriores voltem ao produto ou à operação.
// A identidade vigente é Precisou, Tá Pronto / precisoutapronto.com.br.
const previousIdentityPattern = /resolvajato(?:\\?\.)com(?:\\?\.)br|Resolva Jato/i;
const brandSource = await readFile(path.join(root, 'src/lib/brand.ts'), 'utf8');
if (
  !brandSource.includes("export const BRAND_NAME = 'Precisou, Tá Pronto'") ||
  !brandSource.includes("export const BRAND_HOST = 'precisoutapronto.com.br'")
) {
  failures.push('brand.ts: identidade pública vigente ausente ou alterada');
}
for (const scanRoot of ['src', 'public', 'scripts', 'e2e', '.github']) {
  for (const file of await walk(path.join(root, scanRoot))) {
    if (!/\.(?:[cm]?[jt]sx?|json|ya?ml|md|txt|html|css|webmanifest|xml|sh|ps1)$/i.test(file)) continue;
    if (path.resolve(file) === path.resolve(import.meta.filename)) continue;
    const source = await readFile(file, 'utf8');
    // O middleware mantém somente a lista técnica de hosts legados para o redirect 301.
    if (path.relative(root, file).replaceAll('\\', '/') === 'src/middleware.ts') continue;
    if (previousIdentityPattern.test(source)) {
      failures.push(`${path.relative(root, file)}: referência à identidade anterior encontrada`);
    }
  }
}
for (const rootFile of ['next.config.mjs', 'playwright.config.ts']) {
  const source = await readFile(path.join(root, rootFile), 'utf8');
  if (previousIdentityPattern.test(source)) {
    failures.push(`${rootFile}: referência à identidade anterior encontrada`);
  }
}

if (failures.length) {
  console.error(`Auditoria SEO falhou (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Auditoria SEO concluída: ${required.length} arquivos essenciais e ${publicPages.length} rotas verificadas.`
);
