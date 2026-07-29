import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RemoverFundoApp } from '@/components/remover-fundo/remover-fundo-app';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';
import { findInternationalTool } from '@/lib/international-tools-catalog';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  const tool = findInternationalTool('background-remover')!;
  return {
    title: tool[locale].name,
    description: tool[locale].description,
    ...internationalSeo(locale, 'tools/background-remover', tool.ptPath)
  };
}

export default async function BackgroundRemoverPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <RemoverFundoApp locale={locale} />
    </>
  );
}
