import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CronogramaEstudosApp } from '@/components/cronograma-estudos/cronograma-estudos-app';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';
import { findInternationalTool } from '@/lib/international-tools-catalog';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  const tool = findInternationalTool('study-schedule')!;
  return {
    title: tool[locale].name,
    description: tool[locale].description,
    ...internationalSeo(locale, 'tools/study-schedule', tool.ptPath)
  };
}

export default async function StudySchedulePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <CronogramaEstudosApp locale={locale} />
    </>
  );
}
