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
  '/planos',
  '/recursos',
  '/guias',
  '/orcamento-com-pix',
  '/gerador-de-qr-code-pix',
  '/para/mei',
  '/para/freelancers',
  '/para/estudantes',
  '/gerador-de-curriculo',
  '/gerador-de-contrato',
  '/gerador-de-proposta-comercial',
  '/gerador-de-recibo',
  '/documentos-juridicos-online',
  '/documentos-contabeis-online',
  '/calculadora-de-rescisao',
  '/calculadora-de-preco-freelancer',
  '/mei-ou-clt',
  '/contrato-de-aluguel',
  '/recibo-de-pagamento',
  '/proposta-comercial-mei',
  '/calculadora-de-ferias',
  '/calculadora-de-decimo-terceiro',
  '/recibo-de-aluguel',
  '/guias/modelo-de-recibo-mei',
  '/guias/contrato-de-prestacao-de-servicos-gratis',
  '/guias/como-calcular-rescisao',
  '/guias/curriculo-pronto-para-baixar',
  '/guias/como-fazer-orcamento-com-pix',
  '/guias/proposta-comercial-para-mei',
  '/guias/como-precificar-servico-freelancer',
  '/guias/mei-ou-clt-como-comparar',
  '/guias/aviso-previo-proporcional-como-calcular',
  '/guias/quanto-cobrar-por-hora-freelancer',
  '/guias/custos-fixos-do-freelancer-como-ratear',
  '/guias/quando-o-mei-compensa-mais-que-a-clt',
  '/contato',
  '/sobre',
  '/privacidade',
  '/termos',
  '/en',
  '/en/tools',
  '/en/tools/quote-pix',
  '/en/tools/pix',
  '/es',
  '/es/tools',
  '/es/tools/quote-pix',
  '/es/tools/pix'
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
  console.log('OK - IndexNow aceitou o lote (Bing e parceiros).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
