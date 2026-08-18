#!/usr/bin/env node
/**
 * Envia as URLs públicas via IndexNow (Bing, Yandex, Seznam, Naver).
 * Envia somente URLs novas ou realmente atualizadas, informadas explicitamente.
 *
 * Uso:
 *   node scripts/seo/submit-indexnow.mjs --url /para/mei --url /recibo-de-aluguel
 *   node scripts/seo/submit-indexnow.mjs --file scripts/seo/indexnow-updated-urls.txt
 */

const KEY = '2251b69074c73278c321f4313c84fe76';
const BASE = (process.env.INDEXNOW_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://precisoutapronto.com.br').replace(/\/$/, '');
const HOST = new URL(BASE).host;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH_SIZE = 100;

function parseArgs(argv) {
  const urls = [];
  const files = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--url' && argv[i + 1]) {
      urls.push(argv[++i]);
    } else if (argv[i] === '--file' && argv[i + 1]) {
      files.push(argv[++i]);
    }
  }
  return { urls, files };
}

async function readUrlFile(path) {
  const { readFile } = await import('node:fs/promises');
  const content = await readFile(path, 'utf8');
  return content.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
}

function toAbsolute(paths) {
  return paths.map((p) => (p.startsWith('http') ? p : `${BASE}${p === '/' ? '/' : p}`));
}

async function submitBatch(urlList) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `${BASE}/${KEY}.txt`,
      urlList
    })
  });
  const text = await res.text().catch(() => '');
  console.log(`HTTP ${res.status}${text ? `\n${text}` : ''}`);
  if (![200, 202, 204].includes(res.status)) {
    throw new Error(`IndexNow rejeitou o lote (HTTP ${res.status})`);
  }
}

async function main() {
  const { urls: fromArgs, files } = parseArgs(process.argv.slice(2));
  const fromFiles = [];
  for (const file of files) {
    fromFiles.push(...await readUrlFile(file));
  }
  const urlList = [...new Set(toAbsolute([...fromArgs, ...fromFiles]))]
    .filter((url) => new URL(url).host === HOST);

  if (urlList.length === 0) {
    throw new Error('Nenhuma URL informada. Use --url ou --file; o sitemap completo não é enviado.');
  }

  console.log(`Origem: ${fromArgs.length} --url; ${files.length} arquivo(s)`);
  console.log(`IndexNow → ${urlList.length} URL(s)`);
  if (urlList.length <= 40) {
    for (const u of urlList) console.log(`  - ${u}`);
  } else {
    for (const u of urlList.slice(0, 12)) console.log(`  - ${u}`);
    console.log(`  ... +${urlList.length - 12} URLs`);
  }

  for (let i = 0; i < urlList.length; i += BATCH_SIZE) {
    const batch = urlList.slice(i, i + BATCH_SIZE);
    console.log(`\nLote ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} URL(s)`);
    await submitBatch(batch);
  }

  console.log('\nOK - IndexNow aceitou o(s) lote(s) (Bing e parceiros).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
