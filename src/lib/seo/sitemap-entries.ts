import type { MetadataRoute } from 'next';
import { gamesCatalog } from '@/lib/games/games';
import { hardwareGuides } from '@/lib/games/hardware';
import { listSeoLandings } from '@/lib/seo/landing-content';
import { getViralBaseUrl } from '@/lib/viral-loop';
import { guides } from '@/lib/guides';
import { growthSegments } from '@/lib/growth/segments';
import { intentPages } from '@/lib/growth/intents';
import { INTERNATIONAL_TOOLS } from '@/lib/international-tools-catalog';
import { isPublicIndexablePath } from '@/lib/seo/public-indexable-path';

/** Datas editoriais reais. Só devem mudar quando o conteúdo correspondente for revisado. */
export const CORE_UPDATED_AT = new Date('2026-08-01T15:00:00.000Z');
export const GUIDES_UPDATED_AT = new Date('2026-07-26T18:00:00.000Z');
export const GAMES_UPDATED_AT = new Date('2026-07-29T04:00:00.000Z');

/** Landings públicas de ferramenta (fora de /ferramentas, que exige login). */
export const PUBLIC_TOOL_LANDINGS = [
  '/gerador-de-curriculo',
  '/gerador-de-contrato',
  '/documentos-juridicos-online',
  '/documentos-contabeis-online',
  '/gerador-de-proposta-comercial',
  '/gerador-de-recibo',
  '/gerador-de-qr-code-pix',
  '/calculadora-de-rescisao',
  '/calculadora-de-preco-freelancer',
  '/mei-ou-clt',
  '/corretor-de-redacao-enem',
  '/editor-de-pdf-online',
  '/gerador-de-referencias-abnt',
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
    { url: `${base}/imprensa`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/embed`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${base}/checklist-cobranca-mei`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/privacidade`, lastModified: CORE_UPDATED_AT, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/termos`, lastModified: CORE_UPDATED_AT, changeFrequency: 'yearly', priority: 0.2 }
  ];
}

/** Paths já cobertos por `buildGrowth` (evita URL duplicada nos sitemaps segmentados). */
function growthPaths(): Set<string> {
  return new Set([
    ...growthSegments
      .filter((segment) => segment.slug !== 'autonomos')
      .map((segment) => `/para/${segment.slug}`),
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

  return dedupe([...seoRoutes, ...toolLandingRoutes]);
}

function buildGrowth(base: string): MetadataRoute.Sitemap {
  return [
    ...growthSegments
      // /para/autonomos redireciona para /para/freelancers (evita canibalização).
      .filter((segment) => segment.slug !== 'autonomos')
      .map((segment) => ({
      url: `${base}/para/${segment.slug}`,
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
    ...intentPages.map((intent) => ({
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
    lastModified: GUIDES_UPDATED_AT,
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
  switch (segment) {
    case 'core':
      return buildCore(base);
    case 'tools':
      return buildTools(base);
    case 'growth':
      return buildGrowth(base);
    case 'guides':
      return buildGuides(base);
    case 'games':
      return buildGames(base);
    case 'i18n':
      return buildI18n(base);
    default:
      return [];
  }
}

/** Sitemap completo (deduplicado) para `/sitemap.xml` e IndexNow. */
export function buildFullSitemap(baseUrl?: string): MetadataRoute.Sitemap {
  return dedupe(SITEMAP_SEGMENTS.flatMap((segment) => buildSitemapSegment(segment, baseUrl)));
}
