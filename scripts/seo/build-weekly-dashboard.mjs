import fs from 'node:fs';
import path from 'node:path';

const TARGET_PATHS = [
  '/corretor-de-redacao-enem',
  '/calculadora-de-rescisao',
  '/guias/como-calcular-rescisao',
  '/gerador-de-proposta-comercial',
  '/gerador-de-recibo',
  '/gerador-de-qr-code-pix',
  '/orcamento-com-pix'
];

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [headers = [], ...records] = rows;
  return records.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

function loadCsv(file) {
  if (!file || !fs.existsSync(file)) return [];
  return parseCsv(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function pagePath(value) {
  try {
    return new URL(value).pathname.replace(/\/$/, '') || '/';
  } catch {
    return value.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/';
  }
}

const endDate = argument('end', '2026-08-09');
const gscFile = argument('gsc');
const bingFile = argument('bing');
const conversionFile = argument('conversions');
const outputFile = argument('output', `docs/seo/painel-semanal-${endDate}.md`);

if (!gscFile) throw new Error('Informe --gsc com o CSV de Páginas exportado do Search Console.');

const gsc = new Map(loadCsv(gscFile).map((row) => [pagePath(row['Páginas principais'] || row.Page || row.URL), row]));
const bing = new Map(loadCsv(bingFile).map((row) => [pagePath(row.Page || row.URL), row]));
const conversions = new Map(loadCsv(conversionFile).map((row) => [pagePath(row.page || row.Page || row.URL), row.conversions || row.Conversions]));

const lines = [
  `# Painel semanal de SEO por página · até ${endDate}`,
  '',
  '> Conversões usam o export do GA4 quando `--conversions` é informado. `n/d` significa dado não exportado; nunca é convertido silenciosamente em zero.',
  '',
  '| Página | Google imp. | Google pos. | Google CTR | Google cliques | Bing imp. | Bing pos. | Bing CTR | Bing cliques | Conversões |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|'
];

for (const target of TARGET_PATHS) {
  const google = gsc.get(target) || {};
  const microsoft = bing.get(target) || {};
  lines.push(
    `| \`${target}\` | ${google['Impressões'] || 0} | ${google['Posição'] || '—'} | ${google.CTR || '0%'} | ${google['Cliques'] || 0} | ${microsoft.Impressions || 0} | ${microsoft['Avg. Position'] || '—'} | ${microsoft.CTR || '0%'} | ${microsoft.Clicks || 0} | ${conversions.get(target) ?? 'n/d'} |`
  );
}

lines.push('', '## Definição de conversão', '', '- Guias: evento `guide_tool_click`.', '- Ferramentas comerciais: `begin_checkout` e `purchase` devem ser exportados separadamente no GA4 por landing page.', '');
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${lines.join('\n')}\n`);
console.log(`Painel gerado em ${outputFile}`);
