import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { SharedResultView } from '@/components/growth/shared-result-view';
import { getPrisma } from '@/lib/db';
import { BRAND_DISPLAY_NAME } from '@/lib/brand';
import { loadSharedResult, sanitizeSharedResultLines } from '@/lib/shared-results';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await loadSharedResult((await params).id);
  if (!result) return { title: 'Resultado indisponível', robots: { index: false, follow: false } };
  return {
    title: result.title,
    description: result.subtitle || `Veja este resultado criado no ${BRAND_DISPLAY_NAME}.`,
    robots: { index: false, follow: true },
    openGraph: {
      title: result.title,
      description: result.subtitle || `Resultado criado no ${BRAND_DISPLAY_NAME}.`,
      images: [{ url: `/r/${result.token}/opengraph-image` }]
    },
    twitter: { card: 'summary_large_image', images: [`/r/${result.token}/opengraph-image`] }
  };
}

export default async function ResultPage({ params }: Props) {
  const result = await loadSharedResult((await params).id);
  if (!result) notFound();
  await getPrisma().sharedResult.update({ where: { id: result.id }, data: { viewCount: { increment: 1 }, lastViewedAt: new Date() } });
  return <><SiteHeader /><main className="min-h-[72vh] bg-[linear-gradient(180deg,#f8fafc,#ecfdf5)] px-4 py-12 sm:py-16"><SharedResultView token={result.token} tool={result.tool} title={result.title} subtitle={result.subtitle} lines={sanitizeSharedResultLines(result.data)} ctaLabel={result.ctaLabel} ctaPath={result.ctaPath} /></main><SiteFooter /></>;
}
