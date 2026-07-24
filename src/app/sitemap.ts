import type { MetadataRoute } from 'next';
import { listSeoLandings } from '@/lib/seo/landing-content';
import { getViralBaseUrl } from '@/lib/viral-loop';

/** Landings públicas de ferramenta (fora de /ferramentas, que exige login). */
const PUBLIC_TOOL_LANDINGS = [
  '/gerador-de-curriculo',
  '/gerador-de-contrato',
  '/documentos-juridicos-online',
  '/documentos-contabeis-online',
  '/gerador-de-proposta-comercial',
  '/gerador-de-recibo',
  '/contato',
  '/sobre',
  '/privacidade',
  '/termos'
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getViralBaseUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/busca`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/planos`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/cadastro`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 }
  ];

  const seoRoutes = listSeoLandings().map((page) => ({
    url: `${base}${page.path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: page.id === 'orcamento-com-pix' ? 0.95 : 0.8
  }));

  const toolLandingRoutes: MetadataRoute.Sitemap = PUBLIC_TOOL_LANDINGS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path.startsWith('/gerador-') || path.startsWith('/documentos-') ? 0.9 : 0.4
  }));

  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of [...staticRoutes, ...seoRoutes, ...toolLandingRoutes]) {
    byUrl.set(entry.url, entry);
  }
  return [...byUrl.values()];
}
