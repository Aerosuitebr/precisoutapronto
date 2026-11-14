import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { ELECTRICIAN_CONTENT, electricianCampaignUrl } from '../../src/lib/growth/electrician-campaign.ts';

const folder = path.resolve(process.argv[2] || 'output/campanha-eletricistas-2026-11-04');
await fs.mkdir(folder, { recursive: true });
const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
const csv = value => `"${String(value).replaceAll('"', '""')}"`;
const rows = [['dia_relativo', 'peca', 'canal', 'arquivo', 'link', 'status', 'data_publicacao', 'url_publicacao']];
for (const asset of ELECTRICIAN_CONTENT) {
  const lines = asset.card.map((line, index) => `<text x="80" y="${650 + index * 105}" font-size="58" font-weight="700">${escape(line)}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><rect width="1080" height="1920" fill="#064e3b"/><g fill="white" font-family="Arial, sans-serif"><rect x="80" y="270" width="150" height="12" fill="#fbbf24"/><text x="80" y="360" font-size="34" fill="#fbbf24">PARA ELETRICISTAS</text>${lines}<text x="80" y="1120" font-size="40">Orçamento profissional no WhatsApp</text><text x="80" y="1190" font-size="38">Comece grátis, sem cadastro.</text><text x="80" y="1480" font-size="48" font-weight="700" fill="#fbbf24">Precisou, Tá Pronto</text><text x="80" y="1560" font-size="34">precisoutapronto.com.br</text><text x="80" y="1660" font-size="28">Uso gratuito com a marca da plataforma.</text></g></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(folder, asset.id + '.png'));
  const captions = [];
  for (const channel of ['instagram', 'tiktok', 'youtube', 'whatsapp']) {
    const link = electricianCampaignUrl(channel, 'organic_social', asset.id);
    captions.push(`CANAL: ${channel}\n${asset.caption}\n\nCrie seu orçamento grátis; o documento leva a marca da plataforma.\n${link}`);
    rows.push([asset.day, asset.id, channel, asset.id + '.png', link, 'preparado_nao_publicado', '', '']);
  }
  await fs.writeFile(path.join(folder, asset.id + '.txt'), `TÍTULO: ${asset.title}\nABERTURA: ${asset.hook}\n\nROTEIRO DE DEMONSTRAÇÃO:\n${asset.script}\n\n${captions.join('\n\n---\n\n')}\n`);
}
await fs.writeFile(path.join(folder, 'publicacoes.csv'), '\uFEFF' + rows.map(row => row.map(csv).join(',')).join('\n') + '\n');
await fs.writeFile(path.join(folder, 'LEIA-ME.md'), '# Campanha para eletricistas\n\nSeis cards PNG 1080 × 1920, roteiros e legendas por canal. Dias relativos ao lançamento. Status inicial: preparado, não publicado.\n\nGrave as demonstrações com dados fictícios seguindo os roteiros. Os PNGs são cards estáticos, não vídeos gravados.\n\nNo Story/Status, acrescente o link da legenda; em canais sem link clicável na legenda, configure um destino clicável no perfil correspondente.\n\nRegistre data e URL pública no CSV somente após publicar. Compare origem por criação confirmada e segundo uso; visualizações e downloads de cards não são utilização da ferramenta.\n');
console.log(`Campanha exportada: ${folder}`);
