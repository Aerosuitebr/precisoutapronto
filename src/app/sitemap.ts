import type { MetadataRoute } from 'next';
import { isStagingEnv } from '@/lib/app-env';
import { listSeoLandings } from '@/lib/seo/landing-content';
import { getViralBaseUrl } from '@/lib/viral-loop';
import { guides } from '@/lib/guides';

/** Datas editoriais reais. Só devem mudar quando o conteúdo correspondente for revisado. */
const CORE_UPDATED_AT = new Date('2026-07-28T21:00:00.000Z');
const GUIDES_UPDATED_AT = new Date('2026-07-26T18:00:00.000Z');

/** Landings públicas de ferramenta (fora de /ferramentas, que exige login). */
const PUBLIC_TOOL_LANDINGS = [
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
  '/contato',
  '/sobre',
  '/privacidade',
  '/termos'
  ,'/contrato-de-aluguel'
  ,'/recibo-de-pagamento'
  ,'/proposta-comercial-mei'
] as const;

const INTERNATIONAL_PUBLIC_PATHS = [
  '',
  '/tools',
  '/plans',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/tools/quote-pix',
  '/tools/pix',
  '/tools/receipt',
  '/tools/proposal',
  '/tools/resume',
  '/tools/service-contract',
  '/tools/freelance-pricing',
  '/tools/severance',
  '/tools/agenda',
  '/tools/academic-cover',
  '/tools/legal-documents',
  '/tools/accounting-documents',
  '/tools/resource-search'
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (isStagingEnv()) {
    return [];
  }

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

  const internationalRoutes: MetadataRoute.Sitemap = (['en', 'es'] as const).flatMap((locale) =>
    INTERNATIONAL_PUBLIC_PATHS.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: path === '' || path === '/tools' ? 'weekly' as const : 'monthly' as const,
      priority: path === '' ? 0.9 : path === '/tools' ? 0.85 : path.startsWith('/tools/') ? 0.7 : 0.5
    }))
  );

  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of [...staticRoutes, ...seoRoutes, ...toolLandingRoutes, ...guideRoutes, ...internationalRoutes]) {
    byUrl.set(entry.url, entry);
  }
  return [...byUrl.values()];
}
