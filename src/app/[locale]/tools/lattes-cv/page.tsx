import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LattesApp } from '@/components/lattes/lattes-app';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';
import { findInternationalTool } from '@/lib/international-tools-catalog';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  const tool = findInternationalTool('lattes-cv')!;
  return {
    title: tool[locale].name,
    description: tool[locale].description,
    ...internationalSeo(locale, 'tools/lattes-cv', tool.ptPath)
  };
}

export default async function LattesCvPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <h1 className="sr-only">
        {locale === 'en' ? 'Lattes CV builder for academic profiles' : 'Creador de currículum Lattes para perfiles académicos'}
      </h1>
      <LattesApp locale={locale} />
    </>
  );
}
