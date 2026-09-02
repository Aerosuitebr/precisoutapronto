#!/usr/bin/env node
/**
 * Confere se páginas acompanhadas já citam ou linkam o domínio.
 * Não consulta motores de busca e não envia mensagens.
 *
 * Uso:
 *   npm run seo:backlinks
 *   node scripts/seo/audit-backlinks.mjs --file=docs/divulgacao/backlink-prospects-2026-09-02.json
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fileArg = process.argv.find((arg) => arg.startsWith('--file='))?.slice(7);
const trackerPath = path.resolve(root, fileArg || 'docs/divulgacao/backlink-prospects-2026-09-02.json');
const prospects = JSON.parse(readFileSync(trackerPath, 'utf8'));

if (!Array.isArray(prospects) || prospects.length === 0) throw new Error('Tracker de backlinks vazio');

const domainPattern = /(?:https?:\/\/)?(?:www\.)?precisoutapronto\.com\.br/i;
const hrefPattern = /href=["'][^"']*precisoutapronto\.com\.br[^"']*["']/i;

async function inspect(prospect) {
  if (!prospect.sourceUrl) return { ...prospect, result: 'sem-url-publicada' };
  try {
    const response = await fetch(prospect.sourceUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: { 'user-agent': 'PrecisouTaPronto-LinkMonitor/1.0 (+https://precisoutapronto.com.br/imprensa)' }
    });
    const html = await response.text();
    return {
      ...prospect,
      httpStatus: response.status,
      result: hrefPattern.test(html) ? 'link-encontrado' : domainPattern.test(html) ? 'mencao-sem-link' : 'nao-encontrado'
    };
  } catch (error) {
    return { ...prospect, result: 'erro-de-leitura', error: error instanceof Error ? error.message : String(error) };
  }
}

const results = await Promise.all(prospects.map(inspect));
console.log('| Organização | Etapa | Verificação | Página acompanhada |');
console.log('|---|---|---|---|');
for (const item of results) {
  console.log(`| ${item.org} | ${item.stage || 'prospecção'} | ${item.result} | ${item.sourceUrl || 'a definir'} |`);
}

const links = results.filter((item) => item.result === 'link-encontrado').length;
const mentions = results.filter((item) => item.result === 'mencao-sem-link').length;
console.log(`\nResumo: ${links} links, ${mentions} menções sem link, ${results.length - links - mentions} pendentes ou não encontrados.`);
