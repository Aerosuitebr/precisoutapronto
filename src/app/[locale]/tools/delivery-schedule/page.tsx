import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CronogramaEntregasApp } from '@/components/cronograma-entregas/cronograma-entregas-app';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';
import { findInternationalTool } from '@/lib/international-tools-catalog';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  const tool = findInternationalTool('delivery-schedule')!;
  return {
    title: tool[locale].name,
    description: tool[locale].description,
    ...internationalSeo(locale, 'tools/delivery-schedule', tool.ptPath)
  };
}

export default async function DeliverySchedulePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <CronogramaEntregasApp locale={locale} />
    </>
  );
}
