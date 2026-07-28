import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalQuoteEditor } from '@/components/orcamentos/international-quote-editor';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  return {
    title: locale === 'en' ? 'Quote, client approval and Pix' : 'Presupuesto, aprobación y Pix',
    description:
      locale === 'en'
        ? 'Create a professional quote, send the approval link and prepare the Pix payment.'
        : 'Crea un presupuesto profesional, envía el enlace de aprobación y prepara el cobro con Pix.',
    ...internationalSeo(locale, 'tools/quote-pix', '/orcamento-com-pix')
  };
}

export default async function QuotePixPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <InternationalQuoteEditor locale={locale} />
    </>
  );
}
