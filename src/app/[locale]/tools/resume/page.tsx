import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalResumeEditor } from '@/components/curriculo/international-resume-editor';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  return {
    title: locale === 'en' ? 'Professional résumé builder' : 'Creador de currículum profesional',
    description:
      locale === 'en'
        ? 'Create an international-ready professional résumé and download it as a PDF.'
        : 'Crea un currículum profesional preparado para oportunidades internacionales y descárgalo en PDF.',
    ...internationalSeo(locale, 'tools/resume', '/gerador-de-curriculo')
  };
}

export default async function ResumePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <InternationalResumeEditor locale={locale} />
    </>
  );
}
