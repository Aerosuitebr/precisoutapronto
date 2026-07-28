import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalResourceSearch } from '@/components/busca/international-resource-search';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  return {
    title: locale === 'en' ? 'Free international resource search' : 'Buscador de recursos gratuitos en español',
    description: locale === 'en'
      ? 'Find curated English-language resources for business, study, public services, health and AI.'
      : 'Encuentra recursos seleccionados en español para negocios, estudios, servicios públicos, salud e IA.',
    ...internationalSeo(locale, 'tools/resource-search', '/busca')
  };
}

export default async function ResourceSearchPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <InternationalResourceSearch locale={locale} />
    </>
  );
}
