import fs from 'node:fs';
import path from 'node:path';

const TARGET_PATHS = [
  '/recibo-de-aluguel',
  '/ferramentas/redacao-enem',
  '/corretor-de-redacao-enem',
  '/rescisao',
  '/calculadora-de-rescisao',
  '/guias/como-calcular-rescisao',
  '/guias/calculo-rescisao-pedido-de-demissao',
  '/guias/calculo-rescisao-sem-justa-causa',
  '/guias/calculo-rescisao-comum-acordo',
  '/guias/calculo-rescisao-com-fgts',
  '/gerador-de-proposta-comercial',
  '/gerador-de-recibo',
  '/gerador-de-qr-code-pix',
  '/orcamento-com-pix',
  '/orcamento-para/eletricista',
  '/orcamento-para/pedreiro',
  '/orcamento-para/encanador',
  '/orcamento-para/marceneiro',
  '/orcamento-para/social-media',
  '/orcamento-para/manicure',
  '/orcamento-para/diarista',
  '/orcamento-para/vidraceiro',
  '/orcamento-para/serralheiro',
  '/orcamento-para/jardinagem',
  '/orcamento-para/reforma-apartamento',
  '/orcamento-para/instalacao-eletrica',
  '/orcamento-para/manutencao-ar-condicionado',
  '/orcamento-para/criacao-de-logotipo',
  '/orcamento-para/fotografia-casamento',
  '/modelos-de-orcamento',
  '/orcamento-para/limpeza-pos-obra',
  '/orcamento-para/moveis-planejados',
  '/orcamento-para/box-de-banheiro',
  '/orcamento-para/portao-de-ferro',
  '/orcamento-para/identidade-visual',
  '/orcamento-para/fotografia-de-evento',
  '/orcamento-para/gesseiro',
  '/orcamento-para/tecnico-de-informatica'
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

lines.push(
  '',
  '## Leitura das URLs prioritárias',
  '',
  '- `/ferramentas/redacao-enem` é a URL antiga. Suas impressões devem cair enquanto `/corretor-de-redacao-enem` absorve a demanda.',
  '- `/recibo-de-aluguel` mede aquisição orgânica; `/gerador-de-recibo` mede a ferramenta de destino.',
  '- `/rescisao` e os guias medem a autoridade temática que deve sustentar a calculadora.',
  '- As URLs `/orcamento-para/*` medem o cluster comercial por profissão e necessidade; compare impressões, posição, clique no gerador e orçamento criado.',
  '',
  '## Definição de conversão',
  '',
  '- Landings: evento `landing_cta_click`, segmentado por `landing_path` e `placement`.',
  '- Guias: evento `guide_tool_click`.',
  '- Ferramentas comerciais: `begin_checkout` e `purchase` devem ser exportados separadamente no GA4 por landing page.',
  ''
);
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${lines.join('\n')}\n`);
console.log(`Painel gerado em ${outputFile}`);
