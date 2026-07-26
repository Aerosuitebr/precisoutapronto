import type { MetadataRoute } from 'next';
import { listSeoLandings } from '@/lib/seo/landing-content';
import { getViralBaseUrl } from '@/lib/viral-loop';
import { guides } from '@/lib/guides';

/** Datas editoriais reais. Só devem mudar quando o conteúdo correspondente for revisado. */
const CORE_UPDATED_AT = new Date('2026-07-26T00:00:00.000Z');
const GUIDES_UPDATED_AT = new Date('2026-07-26T00:00:00.000Z');

/** Landings públicas de ferramenta (fora de /ferramentas, que exige login). */
const PUBLIC_TOOL_LANDINGS = [
  '/gerador-de-curriculo',
  '/gerador-de-contrato',
  '/documentos-juridicos-online',
  '/documentos-contabeis-online',
  '/gerador-de-proposta-comercial',
  '/gerador-de-recibo',
  '/calculadora-de-rescisao',
  '/calculadora-de-preco-freelancer',
  '/mei-ou-clt',
  '/contato',
  '/sobre',
  '/privacidade',
  '/termos'
  ,'/contrato-de-aluguel'
  ,'/recibo-de-pagamento'
  ,'/proposta-comercial-mei'
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getViralBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: CORE_UPDATED_AT, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/planos`, lastModified: CORE_UPDATED_AT, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/recursos`, lastModified: CORE_UPDATED_AT, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/guias`, lastModified: GUIDES_UPDATED_AT, changeFrequency: 'weekly', priority: 0.9 }
  ];

  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${base}/guias/${guide.slug}`,
    lastModified: GUIDES_UPDATED_AT,
    changeFrequency: 'monthly',
    priority: 0.75
  }));

  const seoRoutes = listSeoLandings().map((page) => ({
    url: `${base}${page.path}`,
    lastModified: CORE_UPDATED_AT,
    changeFrequency: 'weekly' as const,
    priority: page.id === 'orcamento-com-pix' ? 0.95 : 0.8
  }));

  const toolLandingRoutes: MetadataRoute.Sitemap = PUBLIC_TOOL_LANDINGS.map((path) => {
    let priority = 0.4;
    if (path.startsWith('/gerador-') || path.startsWith('/documentos-')) priority = 0.9;
    else if (
      path === '/calculadora-de-rescisao' ||
      path === '/calculadora-de-preco-freelancer' ||
      path === '/mei-ou-clt'
    ) {
      priority = 0.9;
    } else if (
      path === '/contrato-de-aluguel' ||
      path === '/recibo-de-pagamento' ||
      path === '/proposta-comercial-mei'
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

  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of [...staticRoutes, ...seoRoutes, ...toolLandingRoutes, ...guideRoutes]) {
    byUrl.set(entry.url, entry);
  }
  return [...byUrl.values()];
}
