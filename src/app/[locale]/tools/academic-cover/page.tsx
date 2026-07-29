import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalAcademicCover } from '@/components/trabalhos/international-academic-cover';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  return {
    title: locale === 'en' ? 'Brazilian ABNT academic cover' : 'Portada académica brasileña ABNT',
    description: locale === 'en'
      ? 'Create a school or university cover based on Brazilian ABNT conventions and download it as a PDF.'
      : 'Crea una portada escolar o universitaria basada en las convenciones brasileñas ABNT y descárgala en PDF.',
    ...internationalSeo(locale, 'tools/academic-cover', '/ferramentas/trabalhos')
  };
}

export default async function AcademicCoverPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <InternationalAcademicCover locale={locale} />
    </>
  );
}
