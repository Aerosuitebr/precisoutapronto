import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const required = [
  'src/app/layout.tsx',
  'src/app/not-found.tsx',
  'src/app/robots.txt/route.ts',
  'src/app/sitemap.ts',
  'src/app/sitemaps/index.xml/route.ts',
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

const layout = await readFile(path.join(root, 'src/app/layout.tsx'), 'utf8');
if (!layout.includes("template: '%s | Resolva Jato'")) {
  failures.push('layout.tsx: title template sem marca Resolva Jato');
}
if (!layout.includes('x-html-lang')) {
  failures.push('layout.tsx: html lang dinamico ausente');
}

const nextConfig = await readFile(path.join(root, 'next.config.mjs'), 'utf8');
if (!nextConfig.includes("source: '/para/autonomos'")) {
  failures.push('next.config.mjs: redirect /para/autonomos ausente');
}

if (privatePtPaths.includes('/ferramentas/pix') || privatePtPaths.includes('/ferramentas/mei-vs-clt')) {
  failures.push('international-tools-catalog.ts: pix/mei ainda apontam para /ferramentas/*');
}

if (failures.length) {
  console.error(`Auditoria SEO falhou (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Auditoria SEO concluída: ${required.length} arquivos essenciais e ${publicPages.length} rotas verificadas.`
);
