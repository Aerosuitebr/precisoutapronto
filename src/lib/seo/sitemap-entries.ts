import type { MetadataRoute } from 'next';
import { gamesCatalog } from '@/lib/games/games';
import { hardwareGuides } from '@/lib/games/hardware';
import { listSeoLandings } from '@/lib/seo/landing-content';
import { getViralBaseUrl } from '@/lib/viral-loop';
import { guides } from '@/lib/guides';
import { intentPages } from '@/lib/growth/intents';
import { INTERNATIONAL_TOOLS } from '@/lib/international-tools-catalog';
import { isPublicIndexablePath } from '@/lib/seo/public-indexable-path';
import { receiptClusterPages } from '@/lib/seo/receipt-cluster';
import { viralClusters } from '@/lib/seo/viral-clusters';
import { PROFESSION_LANDINGS } from '@/lib/orcamentos/profession-presets';
import { CONTRACT_PROFESSION_CONTEXTS } from '@/lib/contratos/profession-contexts';
import { RECEIPT_PROFESSION_CONTEXTS } from '@/lib/recibos/profession-contexts';

/** Datas editoriais reais. Só devem mudar quando o conteúdo correspondente for revisado. */
export const CORE_UPDATED_AT = new Date('2026-08-27T12:00:00.000Z');
export const GUIDES_UPDATED_AT = new Date('2026-08-07T15:00:00.000Z');
export const GAMES_UPDATED_AT = new Date('2026-07-29T04:00:00.000Z');

/**
 * Datas verificadas de revisão material. URLs sem data própria omitem `lastmod`:
 * uma data global de deploy não representa mudança relevante de conteúdo.
 */
const VERIFIED_LASTMOD_BY_PATH = new Map<string, Date>([
  ['/', new Date('2026-08-31T12:00:00.000Z')],
  ['/orcamento-com-pix', new Date('2026-08-31T12:00:00.000Z')],
  ['/orcamento-para/eletricista', new Date('2026-08-31T12:00:00.000Z')],
  ['/orcamento-para/pedreiro', new Date('2026-08-31T12:00:00.000Z')],
  ['/orcamento-para/fotografo', new Date('2026-08-31T12:00:00.000Z')],
  ['/orcamento-para/manutencao-residencial', new Date('2026-08-31T12:00:00.000Z')],
  ['/recibos/recibo-pagamento-pix', new Date('2026-08-31T12:00:00.000Z')],
  ['/corretor-de-redacao-enem', new Date('2026-08-31T12:00:00.000Z')],
  ['/gerador-de-recibo', new Date('2026-08-31T12:00:00.000Z')],
  ['/gerador-de-curriculo', new Date('2026-08-31T12:00:00.000Z')],
  ['/gerador-de-referencias-abnt', new Date('2026-08-31T12:00:00.000Z')],
  ['/calculadora-de-decimo-terceiro', new Date('2026-08-31T12:00:00.000Z')],
  ['/calculadora-de-ferias', new Date('2026-08-31T12:00:00.000Z')],
  ['/calculadora-de-rescisao', new Date('2026-08-31T12:00:00.000Z')],
  ['/rescisao', new Date('2026-08-30T12:00:00.000Z')],
  ['/guias/calculo-rescisao-com-fgts', new Date('2026-08-30T12:00:00.000Z')],
  ['/guias', new Date('2026-08-28T12:00:00.000Z')],
  ['/recibos', new Date('2026-08-28T12:00:00.000Z')],
  ['/modelos-de-orcamento', new Date('2026-08-28T12:00:00.000Z')],
  ['/pesquisa/orcamentos-prestadores', new Date('2026-09-02T12:00:00.000Z')]
]);

function normalizeLastModified(entries: MetadataRoute.Sitemap, base: string): MetadataRoute.Sitemap {
  return entries.map((entry) => {
    const path = entry.url.startsWith(base) ? entry.url.slice(base.length) || '/' : entry.url;
    const verified = VERIFIED_LASTMOD_BY_PATH.get(path);
    if (verified) return { ...entry, lastModified: verified };
    if (entry.lastModified?.valueOf() === CORE_UPDATED_AT.valueOf()) {
      const { lastModified: _unverified, ...withoutLastModified } = entry;
      return withoutLastModified;
    }
    return entry;
  });
}

/** Landings públicas de ferramenta (fora de /ferramentas, que exige login). */
export const PUBLIC_TOOL_LANDINGS = [
  '/gerador-de-curriculo',
  '/gerador-de-contrato',
  '/documentos-juridicos-online',
  '/declaracao-de-residencia',
  '/orcamento-pix-copia-e-cola',
  '/documentos-contabeis-online',
  '/gerador-de-proposta-comercial',
  '/gerador-de-recibo',
  '/gerador-de-qr-code-pix',
  '/calculadora-de-rescisao',
  '/calculadora-de-preco-freelancer',
  '/mei-ou-clt',
  '/corretor-de-redacao-enem',
  '/editor-de-pdf-online',
  '/remover-fundo-de-imagem',
  '/juntar-pdf-online',
  '/dividir-pdf-online',
  '/comprimir-pdf-online',
  '/comprimir-redimensionar-imagem',
  '/converter-imagem-online',
  '/gerador-de-referencias-abnt',
  '/assinatura-de-email',
  '/agenda-online',
  '/divisor-de-conta',
  '/contato',
  '/sobre',
  '/privacidade',
  '/termos',
  '/contrato-de-aluguel',
  '/recibo-de-pagamento',
  '/proposta-comercial-mei',
  '/calculadora-de-ferias',
  '/calculadora-de-decimo-terceiro',
  '/recibo-de-aluguel'
] as const;

export const INTERNATIONAL_PUBLIC_PATHS = [
  '',
  '/tools',
  '/plans',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  ...INTERNATIONAL_TOOLS.filter((tool) => isPublicIndexablePath(tool.ptPath)).map(
    (tool) => `/tools/${tool.slug}`
  )
] as const;

export type SitemapSegment = 'core' | 'tools' | 'growth' | 'guides' | 'games' | 'i18n';

export const SITEMAP_SEGMENTS: readonly SitemapSegment[] = [
  'core',
  'tools',
  'growth',
  'guides',
  'games',
  'i18n'
] as const;

/** Segmentos enviados ao Google. Games fica no ar, mas fora do índice canônico. */
export const INDEXABLE_SITEMAP_SEGMENTS: readonly SitemapSegment[] = [
  'core',
  'tools',
  'growth',
  'guides',
  'i18n'
] as const;

function dedupe(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of entries) {
    byUrl.set(entry.url, entry);
  }
  return [...byUrl.values()];
}

function buildCore(base: string): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, lastModified: CORE_UPDATED_AT, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/planos`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/recursos`, lastModified: CORE_UPDATED_AT, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/guias`, lastModified: GUIDES_UPDATED_AT, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/biblioteca`, lastModified: CORE_UPDATED_AT, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/assistente/documentos`, lastModified: CORE_UPDATED_AT, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${base}/contato`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/sobre`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/precisou-ta-pronto`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/qualidade-e-seguranca`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${base}/autores/equipe-editorial`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/criterios-editoriais`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/politica-de-correcoes`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/metodologia-calculadoras`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/imprensa`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/embed`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${base}/checklist-cobranca-mei`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/conteudos-para-compartilhar`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/modelos-de-orcamento`, lastModified: CORE_UPDATED_AT, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${base}/pesquisa/orcamentos-prestadores`, lastModified: new Date('2026-09-02T12:00:00.000Z'), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/indique-e-ganhe`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/parcerias/criadores`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/campanhas/eletricistas-30-dias`, lastModified: CORE_UPDATED_AT, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/depoimentos`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.6 },
    ...PROFESSION_LANDINGS.map((page) => ({
      url: `${base}/orcamento-para/${page.slug}`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: 'monthly' as const,
      priority: 0.9
    })),
    ...CONTRACT_PROFESSION_CONTEXTS.map((page) => ({
      url: `${base}/contrato/${page.slug}`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: 'monthly' as const,
      priority: 0.88
    })),
    ...RECEIPT_PROFESSION_CONTEXTS.map((page) => ({
      url: `${base}/recibo/${page.slug}`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: 'monthly' as const,
      priority: 0.9
    })),
    { url: `${base}/privacidade`, lastModified: CORE_UPDATED_AT, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/termos`, lastModified: CORE_UPDATED_AT, changeFrequency: 'yearly', priority: 0.2 }
  ];
}

/** Slugs de `/para/[segmento]` indexáveis. Mantido aqui para o sitemap não importar lucide-react. */
const GROWTH_INDEXABLE_SEGMENT_SLUGS = [
  'mei',
  'freelancers',
  'empresas',
  'rh',
  'contadores',
  'advogados',
  'estudantes',
  'prestadores',
  'saude',
  'gestores'
] as const;

/** Paths já cobertos por `buildGrowth` (evita URL duplicada nos sitemaps segmentados). */
function growthPaths(): Set<string> {
  return new Set([
    ...GROWTH_INDEXABLE_SEGMENT_SLUGS.map((slug) => `/para/${slug}`),
    '/para/freelancers',
    ...intentPages.map((intent) => `/modelos/${intent.slug}`)
  ]);
}

function buildTools(base: string): MetadataRoute.Sitemap {
  const inGrowth = growthPaths();
  const seoRoutes = listSeoLandings()
    .filter((page) => !inGrowth.has(page.path))
    .map((page) => ({
      url: `${base}${page.path}`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: 'weekly' as const,
      priority: page.id === 'orcamento-com-pix' ? 0.95 : 0.8
    }));

  const toolLandingRoutes: MetadataRoute.Sitemap = PUBLIC_TOOL_LANDINGS.filter(
    (path) =>
      !['/contato', '/sobre', '/privacidade', '/termos'].includes(path) && !inGrowth.has(path)
  ).map((path) => {
    let priority = 0.4;
    if (
      path.startsWith('/gerador-') ||
      path.startsWith('/documentos-') ||
      path.startsWith('/corretor-') ||
      path.startsWith('/editor-') ||
      path.startsWith('/remover-') ||
      path.startsWith('/juntar-') ||
      path.startsWith('/dividir-') ||
      path.startsWith('/comprimir-') ||
      path.startsWith('/converter-') ||
      path === '/agenda-online' ||
      path === '/divisor-de-conta'
    ) {
      priority = 0.9;
    } else if (
      path === '/calculadora-de-rescisao' ||
      path === '/calculadora-de-preco-freelancer' ||
      path === '/mei-ou-clt' ||
      path === '/calculadora-de-ferias' ||
      path === '/calculadora-de-decimo-terceiro'
    ) {
      priority = 0.9;
    } else if (
      path === '/contrato-de-aluguel' ||
      path === '/recibo-de-pagamento' ||
      path === '/proposta-comercial-mei' ||
      path === '/recibo-de-aluguel'
    ) {
      priority = 0.8;
    }
    return {
      url: `${base}${path}`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: 'weekly' as const,
      priority
    };
  });

  const receiptClusterRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/recibos`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: 'weekly',
      priority: 0.9
    },
    ...receiptClusterPages.map((page) => ({
      url: `${base}/recibos/${page.slug}`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: 'monthly' as const,
      priority: 0.8
    }))
  ];

  const rentalReceiptRoutes: MetadataRoute.Sitemap = ['residencial', 'comercial', 'pix'].map((slug) => ({
    url: `${base}/recibo-de-aluguel/${slug}`,
    lastModified: CORE_UPDATED_AT,
    changeFrequency: 'monthly' as const,
    priority: 0.82
  }));

  const viralClusterRoutes: MetadataRoute.Sitemap = viralClusters.map((cluster) => ({
    url: `${base}${cluster.path}`,
    lastModified: CORE_UPDATED_AT,
    changeFrequency: 'weekly' as const,
    priority: 0.9
  }));

  return dedupe([...seoRoutes, ...toolLandingRoutes, ...receiptClusterRoutes, ...rentalReceiptRoutes, ...viralClusterRoutes]);
}

function buildGrowth(base: string): MetadataRoute.Sitemap {
  return [
    ...GROWTH_INDEXABLE_SEGMENT_SLUGS.map((slug) => ({
      url: `${base}/para/${slug}`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: 'weekly' as const,
      priority: 0.85
    })),
    // Landing SEO dedicada substitui o segmento genérico "autonomos".
    {
      url: `${base}/para/freelancers`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: 'weekly' as const,
      priority: 0.85
    },
    ...intentPages
      .filter((intent) => !['recibo-para-mei', 'recibo-de-pagamento'].includes(intent.slug))
      .map((intent) => ({
      url: `${base}/modelos/${intent.slug}`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: 'monthly' as const,
      priority: 0.8
    }))
  ];
}

function buildGuides(base: string): MetadataRoute.Sitemap {
  return guides.map((guide) => ({
    url: `${base}/guias/${guide.slug}`,
    lastModified: new Date(`${guide.updatedAt ?? guide.publishedAt ?? '2026-07-26'}T12:00:00.000Z`),
    changeFrequency: 'monthly' as const,
    priority: 0.75
  }));
}

function buildGames(base: string): MetadataRoute.Sitemap {
  const gamesStatic = [
    '/games',
    '/games/top-jogos',
    '/games/ferramentas',
    '/games/ferramentas/calculadora-edpi',
    '/games/ferramentas/planejador-armazenamento',
    '/games/ferramentas/custo-por-hora',
    '/games/ferramentas/meu-pc-roda',
    '/games/diagnostico',
    '/games/diagnostico/privacidade',
    '/games/diagnostico/termos',
    '/games/diagnostico/suporte',
    '/games/diagnostico/changelog',
    '/games/hardware',
    '/games/consoles',
    '/games/lojas'
  ] as const;

  return [
    ...gamesStatic.map((path) => ({
      url: `${base}${path}`,
      lastModified: GAMES_UPDATED_AT,
      changeFrequency: 'weekly' as const,
      priority: path === '/games' ? 0.9 : 0.8
    })),
    ...gamesCatalog.map((game) => ({
      url: `${base}/games/jogos/${game.slug}`,
      lastModified: GAMES_UPDATED_AT,
      changeFrequency: 'monthly' as const,
      priority: 0.75
    })),
    ...hardwareGuides.map((guide) => ({
      url: `${base}/games/hardware/${guide.slug}`,
      lastModified: GAMES_UPDATED_AT,
      changeFrequency: 'monthly' as const,
      priority: 0.75
    }))
  ];
}

function buildI18n(base: string): MetadataRoute.Sitemap {
  return (['en', 'es'] as const).flatMap((locale) =>
    INTERNATIONAL_PUBLIC_PATHS.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: path === '' || path === '/tools' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '' ? 0.9 : path === '/tools' ? 0.85 : path.startsWith('/tools/') ? 0.7 : 0.5
    }))
  );
}

export function buildSitemapSegment(segment: SitemapSegment, baseUrl?: string): MetadataRoute.Sitemap {
  const base = (baseUrl ?? getViralBaseUrl()).replace(/\/$/, '');
  let entries: MetadataRoute.Sitemap;
  switch (segment) {
    case 'core':
      entries = buildCore(base);
      break;
    case 'tools':
      entries = buildTools(base);
      break;
    case 'growth':
      entries = buildGrowth(base);
      break;
    case 'guides':
      entries = buildGuides(base);
      break;
    case 'games':
      entries = buildGames(base);
      break;
    case 'i18n':
      entries = buildI18n(base);
      break;
    default:
      entries = [];
  }
  return normalizeLastModified(entries, base);
}

/** Sitemap canônico com todas as URLs públicas indexáveis, exceto Games. */
export function buildFullSitemap(baseUrl?: string): MetadataRoute.Sitemap {
  return dedupe(INDEXABLE_SITEMAP_SEGMENTS.flatMap((segment) => buildSitemapSegment(segment, baseUrl)));
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** urlset XML para um segmento ou para o sitemap único. */
export function sitemapEntriesToXml(entries: MetadataRoute.Sitemap): string {
  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastModified
        ? `<lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>`
        : '';
      const changefreq = entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : '';
      const priority =
        typeof entry.priority === 'number' ? `<priority>${entry.priority}</priority>` : '';
      return `<url><loc>${xmlEscape(entry.url)}</loc>${lastmod}${changefreq}${priority}</url>`;
    })
    .join('');

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  );
}

/** Índice apontando para `/sitemaps/{segment}`. O XML completo fica em `/sitemaps/full`. */
export function buildSitemapIndexXml(baseUrl?: string): string {
  const base = (baseUrl ?? getViralBaseUrl()).replace(/\/$/, '');
  const lastmod = CORE_UPDATED_AT.toISOString();
  const body = INDEXABLE_SITEMAP_SEGMENTS.map(
    (segment) =>
      `<sitemap><loc>${xmlEscape(`${base}/sitemaps/${segment}`)}</loc><lastmod>${lastmod}</lastmod></sitemap>`
  ).join('');

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`
  );
}
