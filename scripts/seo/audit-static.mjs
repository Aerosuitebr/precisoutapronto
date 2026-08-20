import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const required = [
  'src/app/layout.tsx',
  'src/app/not-found.tsx',
  'src/app/robots.txt/route.ts',
  'src/app/sitemap.ts',
  'src/app/sitemaps/[segment]/route.ts',
  'public/llms.txt',
  'public/manifest.webmanifest',
  'public/.well-known/security.txt'
];

const failures = [];
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
if (!layout.includes("template: '%s | Resolva Jato'")) {
  failures.push('layout.tsx: title template sem marca Resolva Jato');
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

const nextConfig = await readFile(path.join(root, 'next.config.mjs'), 'utf8');
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
if (!rescisaoPage.includes('Calculadora de Rescisão CLT Grátis: Cálculo 2026')) {
  failures.push('calculadora-de-rescisao: title de CTR prioritario ausente');
}
if (/[—–]/.test(rescisaoPage)) {
  failures.push('calculadora-de-rescisao: title ainda usa travessao');
}

const recibosContent = await readFile(path.join(root, 'src/lib/seo-pages/recibos.ts'), 'utf8');
if (!recibosContent.includes("metaTitle: 'Gerador de Recibo Online Grátis em PDF'")) {
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
for (const target of ['/recibo-de-aluguel', '/ferramentas/redacao-enem', '/corretor-de-redacao-enem', '/rescisao']) {
  if (!weeklyDashboard.includes(`'${target}'`)) failures.push(`painel semanal: falta URL prioritária ${target}`);
}

const seoLandingPage = await readFile(path.join(root, 'src/components/marketing/seo-landing-page.tsx'), 'utf8');
if (!seoLandingPage.includes('LandingConversionLink') || !seoLandingPage.includes('footer_primary')) {
  failures.push('seo-landing-page: CTAs primárias sem medição de conversão');
}

if (failures.length) {
  console.error(`Auditoria SEO falhou (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Auditoria SEO concluída: ${required.length} arquivos essenciais e ${publicPages.length} rotas verificadas.`
);
