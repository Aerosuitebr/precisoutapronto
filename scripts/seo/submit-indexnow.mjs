#!/usr/bin/env node
/**
 * Envia as URLs públicas via IndexNow (Bing, Yandex, Seznam, Naver).
 * Por padrão lê o sitemap.xml ao vivo (cobertura completa). Se falhar, usa fallback.
 *
 * Uso:
 *   node scripts/seo/submit-indexnow.mjs
 *   node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/para/mei
 *   node scripts/seo/submit-indexnow.mjs --fallback
 */

const KEY = '2251b69074c73278c321f4313c84fe76';
const HOST = 'resolvajato.com.br';
const BASE = `https://${HOST}`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const SITEMAP_URL = `${BASE}/sitemap.xml`;
const BATCH_SIZE = 10000;

/** Fallback se o sitemap ao vivo estiver indisponível. */
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
  '/biblioteca',
  '/assistente/documentos',
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
  '/games',
  '/games/top-jogos',
  '/games/ferramentas',
  '/games/ferramentas/calculadora-edpi',
  '/games/ferramentas/planejador-armazenamento',
  '/games/ferramentas/custo-por-hora',
  '/games/ferramentas/meu-pc-roda',
  '/games/hardware',
  '/games/consoles',
  '/games/lojas',
  '/games/jogos/counter-strike-2',
  '/games/jogos/league-of-legends',
  '/games/jogos/valorant',
  '/games/jogos/grand-theft-auto-v',
  '/games/jogos/minecraft',
  '/games/jogos/fortnite',
  '/games/jogos/elden-ring',
  '/games/jogos/free-fire',
  '/games/jogos/roblox',
  '/games/jogos/ea-sports-fc',
  '/games/hardware/escolher-placa-de-video',
  '/games/hardware/processador-para-jogos',
  '/games/hardware/o-que-e-game-engine',
  '/games/hardware/montar-pc-gamer-sem-desperdicar',
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
  let forceFallback = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--url' && argv[i + 1]) {
      urls.push(argv[++i]);
    } else if (argv[i] === '--fallback') {
      forceFallback = true;
    }
  }
  return { urls, forceFallback };
}

async function fetchSitemapUrls() {
  const res = await fetch(SITEMAP_URL, {
    headers: { Accept: 'application/xml,text/xml,*/*' }
  });
  if (!res.ok) {
    throw new Error(`sitemap HTTP ${res.status}`);
  }
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
  const unique = [...new Set(locs)].filter((u) => u.startsWith('https://'));
  if (unique.length === 0) {
    throw new Error('sitemap sem <loc>');
  }
  return unique;
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
  const { urls: fromArgs, forceFallback } = parseArgs(process.argv.slice(2));
  let urlList;

  if (fromArgs.length > 0) {
    urlList = toAbsolute(fromArgs);
    console.log('Origem: --url');
  } else if (forceFallback) {
    urlList = toAbsolute(SEO_LANDINGS);
    console.log('Origem: fallback (--fallback)');
  } else {
    try {
      urlList = await fetchSitemapUrls();
      console.log(`Origem: ${SITEMAP_URL}`);
    } catch (err) {
      console.warn(`Sitemap indisponível (${err.message}). Usando fallback.`);
      urlList = toAbsolute(SEO_LANDINGS);
    }
  }

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
