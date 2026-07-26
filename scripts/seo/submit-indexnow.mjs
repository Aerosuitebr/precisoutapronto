#!/usr/bin/env node
/**
 * Envia as URLs públicas (sitemap + landings SEO) via IndexNow
 * para Bing, Yandex, Seznam e Naver.
 *
 * Uso:
 *   node scripts/seo/submit-indexnow.mjs
 *   node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/para/mei
 */

const KEY = '2251b69074c73278c321f4313c84fe76';
const HOST = 'resolvajato.com.br';
const BASE = `https://${HOST}`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const SEO_LANDINGS = [
  '/',
  '/busca',
  '/planos',
  '/recursos',
  '/guias',
  '/contrato-de-aluguel',
  '/recibo-de-pagamento',
  '/proposta-comercial-mei',
  '/guias/modelo-de-recibo-mei',
  '/guias/contrato-de-prestacao-de-servicos-gratis',
  '/guias/como-calcular-rescisao',
  '/guias/curriculo-pronto-para-baixar',
  '/guias/como-fazer-orcamento-com-pix',
  '/guias/proposta-comercial-para-mei',
  '/guias/como-precificar-servico-freelancer',
  '/guias/mei-ou-clt-como-comparar',
  '/orcamento-com-pix',
  '/para/mei',
  '/para/freelancers',
  '/para/estudantes',
  '/gerador-de-curriculo',
  '/gerador-de-contrato',
  '/gerador-de-proposta-comercial',
  '/gerador-de-recibo',
  '/documentos-juridicos-online',
  '/documentos-contabeis-online',
  '/contato',
  '/sobre'
];

function parseArgs(argv) {
  const urls = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--url' && argv[i + 1]) {
      urls.push(argv[++i]);
    }
  }
  return urls;
}

async function main() {
  const fromArgs = parseArgs(process.argv.slice(2));
  const paths = fromArgs.length > 0 ? fromArgs : SEO_LANDINGS;
  const urlList = paths.map((p) => (p.startsWith('http') ? p : `${BASE}${p === '/' ? '/' : p}`));

  console.log(`IndexNow → ${urlList.length} URL(s)`);
  for (const u of urlList) console.log(`  - ${u}`);

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
  console.log(`\nHTTP ${res.status}`);
  if (text) console.log(text);

  if (![200, 202, 204].includes(res.status)) {
    process.exit(1);
  }
  console.log('OK — IndexNow aceitou o lote (Bing e parceiros).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
