import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const [performancePath, indexingPath, discoveredPath, crawledPath, outputPath] = process.argv.slice(2);
if (![performancePath, indexingPath, discoveredPath, crawledPath, outputPath].every(Boolean)) {
  throw new Error('Uso: node build-search-console-action-plan.mjs performance.xlsx indexing.xlsx discovered.xlsx crawled.xlsx output.xlsx');
}

async function load(path) {
  return SpreadsheetFile.importXlsx(await FileBlob.load(path));
}

const performance = await load(performancePath);
const indexing = await load(indexingPath);
const discovered = await load(discoveredPath);
const crawled = await load(crawledPath);

const values = (book, sheetName) => book.worksheets.getItem(sheetName).getUsedRange(true).values;
const queries = values(performance, 'Consultas');
const pages = values(performance, 'Páginas');
const trend = values(performance, 'Gráfico');
const issues = values(indexing, 'Problemas críticos');
const discoveredRows = values(discovered, 'Tabela');
const crawledRows = values(crawled, 'Tabela');

function pathOf(url) {
  try { return new URL(String(url)).pathname; } catch { return String(url); }
}

function clusterFor(url) {
  const path = pathOf(url);
  if (/recibo|pix/.test(path)) return 'Recibos e cobrança';
  if (/orcamento|proposta/.test(path)) return 'Orçamentos';
  if (/preco|freelancer|mei-ou-clt/.test(path)) return 'Precificação';
  if (/ferias|decimo|rescis/.test(path)) return 'Trabalhista';
  if (/pdf|imagem|fundo|image/.test(path)) return 'Arquivos e imagens';
  return 'Outros';
}

const pageRows = pages.slice(1).filter((row) => row[0]);
const trendRows = trend.slice(1).map((row) => {
  const impressions = Number(row[2]) || 0;
  return [row[0], Number(row[1]) || 0, impressions, impressions ? Number(row[3]) || 0 : 0, impressions ? Number(row[4]) || 0 : null];
});
const priorityBoost = { 'Recibos e cobrança': 18, Orçamentos: 16, Precificação: 14, Trabalhista: 8, 'Arquivos e imagens': 4, Outros: 0 };
const ranked = pageRows
  .map((row) => ({
    url: String(row[0]), clicks: Number(row[1]) || 0, impressions: Number(row[2]) || 0,
    ctr: Number(row[3]) || 0, position: Number(row[4]) || 0, cluster: clusterFor(row[0])
  }))
  .map((row) => ({ ...row, score: row.impressions + row.clicks * 25 + (priorityBoost[row.cluster] ?? 0) + (row.position <= 20 ? 10 : 0) }))
  .sort((a, b) => b.score - a.score);

const strategicRequired = [
  '/modelos-de-orcamento', '/orcamento-com-pix', '/gerador-de-recibo', '/recibos',
  '/recibos/recibo-pagamento-pix', '/recibos/modelo-de-recibo-simples',
  '/calculadora-de-preco-freelancer', '/guias/como-cobrar-cliente-pelo-whatsapp',
  '/orcamento-para/eletricista', '/guias/modelo-de-orcamento-para-designer'
];
const byPath = new Map(ranked.map((row) => [pathOf(row.url), row]));
const selected = [];
for (const path of strategicRequired) {
  selected.push(byPath.get(path) ?? { url: `https://precisoutapronto.com.br${path}`, clicks: 0, impressions: 0, ctr: 0, position: 0, cluster: clusterFor(path), score: priorityBoost[clusterFor(path)] ?? 0 });
}
for (const row of ranked) {
  if (!selected.some((item) => pathOf(item.url) === pathOf(row.url))) selected.push(row);
  if (selected.length === 30) break;
}

const top10 = [...pageRows]
  .sort((a, b) => (Number(b[2]) || 0) - (Number(a[2]) || 0))
  .slice(0, 10)
  .map((row, index) => [index + 1, row[0], Number(row[1]) || 0, Number(row[2]) || 0, Number(row[3]) || 0, Number(row[4]) || 0, clusterFor(row[0]),
    index < 3 ? 'Revisar intenção, título e resposta direta; ampliar exemplos e links contextuais.' : 'Melhorar snippet, prova de utilidade e ligação com páginas do mesmo cluster.']);

const workbook = Workbook.create();
const dashboard = workbook.worksheets.add('Resumo');
const priority = workbook.worksheets.add('30 URLs Prioritárias');
const top = workbook.worksheets.add('Top 10 Impressões');
const coverage = workbook.worksheets.add('Cobertura');
const actions = workbook.worksheets.add('Plano 90 Dias');
const outreach = workbook.worksheets.add('Parcerias e Distribuição');
const rawPages = workbook.worksheets.add('Fonte - Páginas');
const rawQueries = workbook.worksheets.add('Fonte - Consultas');

for (const sheet of workbook.worksheets.items) sheet.showGridLines = false;
rawPages.getRangeByIndexes(0, 0, pages.length, pages[0].length).values = pages;
rawQueries.getRangeByIndexes(0, 0, queries.length, queries[0].length).values = queries;

dashboard.getRange('A1:H1').merge();
dashboard.getRange('A1').values = [['Plano de visibilidade orgânica — Precisou, Tá Pronto']];
dashboard.getRange('A2:H2').merge();
dashboard.getRange('A2').values = [['Fonte: Google Search Console · exportado em 2026-08-28 · janela disponível: 2026-08-18 a 2026-08-26']];
dashboard.getRange('A4:B4').values = [['Indicador', 'Valor']];
dashboard.getRange('A5:B10').values = [
  ['Cliques', 5], ['Impressões', 411], ['CTR média', 0.012], ['Posição média', 65],
  ['Páginas indexadas', 52], ['Páginas não indexadas', 247]
];
dashboard.getRange('D4:E4').values = [['Diagnóstico', 'Leitura']];
dashboard.getRange('D5:E9').values = [
  ['Descobertas, não indexadas', 130], ['Rastreadas, não indexadas', 78], ['Canônica divergente', 2],
  ['Bloqueadas por robots', 10], ['Excluídas por noindex', 12]
];
dashboard.getRange('A12:E12').values = [['Data', 'Cliques', 'Impressões', 'CTR', 'Posição']];
dashboard.getRangeByIndexes(12, 0, trendRows.length, 5).values = trendRows;
const chart = dashboard.charts.add('line', dashboard.getRange(`A12:C${11 + trend.length}`));
chart.title = 'Impressões cresceram na primeira semana observada';
chart.hasLegend = true;
chart.xAxis = { axisType: 'textAxis' };
chart.yAxis = { numberFormatCode: '#,##0' };
chart.setPosition('G4', 'N19');

priority.getRange('A1:J1').values = [['Prioridade','URL','Cluster','Cliques','Impressões','CTR','Posição','Score','Ação principal','Status']];
priority.getRangeByIndexes(1, 0, selected.length, 10).values = selected.map((row, index) => [
  index + 1, row.url, row.cluster, row.clicks, row.impressions, row.ctr, row.position, row.score,
  row.impressions > 10 ? 'Otimizar conteúdo e snippet; reforçar links internos.' : 'Reforçar descoberta, links internos e distribuição externa.',
  index < 10 ? 'Em execução' : 'Fila'
]);

top.getRange('A1:H1').values = [['Rank','URL','Cliques','Impressões','CTR','Posição','Cluster','Melhoria recomendada']];
top.getRangeByIndexes(1, 0, top10.length, 8).values = top10;

coverage.getRange('A1:D1').values = [['Motivo','Fonte','Validação','Páginas']];
coverage.getRangeByIndexes(1, 0, issues.length - 1, 4).values = issues.slice(1);
coverage.getRange('F1:H1').values = [['Constatação','Quantidade','Decisão']];
coverage.getRange('F2:H5').values = [
  ['URLs descobertas sem rastreamento', discoveredRows.length - 1, 'Priorizar apenas URLs estratégicas e reduzir dispersão.'],
  ['URLs rastreadas sem indexação', crawledRows.length - 1, 'Melhorar diferenciação, exemplos e autoridade.'],
  ['Canônicas divergentes', 2, 'São páginas de games fora do índice principal; monitorar, sem priorizar.'],
  ['URLs indexadas', 52, 'Usar como nós de links internos para as 30 prioritárias.']
];

actions.getRange('A1:F1').values = [['Fase','Prazo','Ação','Métrica','Responsável','Status']];
actions.getRange('A2:F10').values = [
  ['Fundação','0–7 dias','Corrigir lastmod e links entre orçamento, recibo e precificação','Sitemaps e build válidos','Produto/SEO','Concluído no código'],
  ['Fundação','0–7 dias','Revisar as 10 páginas com mais impressões','CTR e posição por URL','Conteúdo','Em execução'],
  ['Indexação','7–14 dias','Submeter sitemap após deploy e validar cobertura','Indexadas / enviadas','SEO','Pendente de deploy'],
  ['Conteúdo','7–30 dias','Adicionar exemplos demonstrativos verificáveis nas páginas prioritárias','Tempo e cliques internos','Conteúdo','Planejado'],
  ['Autoridade','7–30 dias','Prospectar contadores, MEIs e associações profissionais','Domínios de referência','Parcerias','Material pronto'],
  ['Distribuição','Semanal','Publicar 3 conteúdos curtos por semana','Alcance e cliques','Social','Calendário pronto'],
  ['Distribuição','Quinzenal','Publicar tutorial ou estudo demonstrativo aprofundado','Links e inscrições','Conteúdo','Calendário pronto'],
  ['Otimização','30–60 dias','Consolidar páginas sem impressões e conteúdo sobreposto','Cobertura e canônicas','SEO','Planejado'],
  ['Revisão','90 dias','Comparar baseline e decidir expansão dos clusters','Cliques, CTR e top 20','Gestão','Planejado']
];

outreach.getRange('A1:G1').values = [['Tipo','Público/canal','Tema','Formato','CTA','Cadência','Status']];
outreach.getRange('A2:G10').values = [
  ['Parceria','Contadores e BPO financeiro','Recibo, orçamento e cobrança para MEI','Guia coassinado + link','Testar gerador de recibo','5 contatos/semana','Não enviado'],
  ['Parceria','Associações de eletricistas e manutenção','Modelo de orçamento profissional','Página/recurso gratuito','Abrir modelo da profissão','3 contatos/semana','Não enviado'],
  ['Parceria','Comunidades de freelancers','Precificação sem trabalhar no prejuízo','Calculadora + tutorial','Calcular preço','2 comunidades/semana','Não publicado'],
  ['Vídeo','Instagram/TikTok/Shorts','Orçamento → aprovação → Pix','Vídeo 30–45 s','Criar orçamento','3 por semana','Roteiro pendente'],
  ['Comunidade','Reddit/Facebook/WhatsApp profissional','Como comprovar um Pix','Resposta educativa + ferramenta','Gerar recibo Pix','1 contribuição/semana','Não publicado'],
  ['Conteúdo','Blog próprio','Exemplo demonstrativo de eletricista','Guia com valores editáveis','Abrir modelo','Quinzenal','Planejado'],
  ['Conteúdo','Blog próprio','Exemplo demonstrativo de designer','Escopo, revisões e entrada','Abrir modelo','Quinzenal','Planejado'],
  ['Newsletter','Base própria','Checklist de cobrança profissional','E-mail curto','Baixar checklist','Quinzenal','Depende de base'],
  ['Relações públicas','Portais de MEI e pequenos negócios','Dados agregados de uso das ferramentas','Pauta com metodologia','Conhecer plataforma','Mensal','Depende de dados']
];

const header = { fill: '#0B5CFF', font: { bold: true, color: '#FFFFFF' }, wrapText: true };
const title = { fill: '#071A33', font: { bold: true, color: '#FFFFFF', size: 18 }, verticalAlignment: 'center' };
for (const sheet of [priority, top, coverage, actions, outreach, rawPages, rawQueries]) {
  sheet.getRange(`A1:${sheet.getUsedRange(true).address.split(':')[1].replace(/\d+/g, '')}1`).format = header;
  sheet.freezePanes.freezeRows(1);
  sheet.getUsedRange(true).format.autofitColumns();
  sheet.getUsedRange(true).format.autofitRows();
}
dashboard.getRange('A1:H1').format = title;
dashboard.getRange('A2:H2').format = { fill: '#E8F0FF', font: { color: '#334155', italic: true } };
dashboard.getRange('A4:B4').format = header;
dashboard.getRange('D4:E4').format = header;
dashboard.getRange('A12:E12').format = header;
dashboard.getRange('B7').format.numberFormat = '0.0%';
dashboard.getRange('D5:E9').format.borders = { preset: 'inside', style: 'thin', color: '#D7E0EA' };
priority.getRange('F2:F31').format.numberFormat = '0.0%';
top.getRange('E2:E11').format.numberFormat = '0.0%';

const widths = [
  [priority, [['A:A',10],['B:B',58],['C:C',22],['D:H',12],['I:I',46],['J:J',14]]],
  [top, [['A:A',8],['B:B',60],['C:F',12],['G:G',20],['H:H',55]]],
  [coverage, [['A:A',48],['B:D',16],['F:F',34],['G:G',12],['H:H',52]]],
  [actions, [['A:B',15],['C:C',58],['D:D',28],['E:F',20]]],
  [outreach, [['A:A',16],['B:B',34],['C:C',42],['D:G',24]]]
];
for (const [sheet, specs] of widths) for (const [range, width] of specs) sheet.getRange(range).format.columnWidth = width;
for (const sheet of [priority, top, coverage, actions, outreach]) sheet.getUsedRange(true).format.wrapText = true;
dashboard.getRange('A:A').format.columnWidth = 28;
dashboard.getRange('B:B').format.columnWidth = 14;
dashboard.getRange('C:C').format.columnWidth = 13;
dashboard.getRange('D:D').format.columnWidth = 32;
dashboard.getRange('E:E').format.columnWidth = 14;
dashboard.getRange('F:F').format.columnWidth = 4;
dashboard.getRange('G:N').format.columnWidth = 14;
dashboard.getRange('A1').format.rowHeight = 32;

const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A', options: { useRegex: true, maxResults: 100 }, summary: 'formula errors' });
console.log(errors.ndjson);
const preview = await workbook.render({ sheetName: 'Resumo', range: 'A1:N21', scale: 1, format: 'png' });
await fs.mkdir(new URL('.', `file:///${outputPath.replace(/\\/g, '/')}`).pathname, { recursive: true }).catch(() => {});
await fs.writeFile(outputPath.replace(/\.xlsx$/i, '-preview.png'), new Uint8Array(await preview.arrayBuffer()));
for (const sheet of workbook.worksheets.items) {
  const visual = await workbook.render({ sheetName: sheet.name, autoCrop: 'all', scale: 0.8, format: 'png' });
  await fs.writeFile(outputPath.replace(/\.xlsx$/i, `-${sheet.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-preview.png`), new Uint8Array(await visual.arrayBuffer()));
}
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(outputPath);
