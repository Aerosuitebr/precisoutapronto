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
  return (await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }))).flat();
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

if (failures.length) {
  console.error(`Auditoria SEO falhou (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Auditoria SEO concluída: ${required.length} arquivos essenciais e ${publicPages.length} rotas verificadas.`);
