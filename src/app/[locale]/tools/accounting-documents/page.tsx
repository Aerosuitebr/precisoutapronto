import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalAccountingDocuments } from '@/components/contabeis/international-accounting-documents';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  return {
    title: locale === 'en' ? 'Accounting document templates' : 'Modelos de documentos contables',
    description: locale === 'en'
      ? 'Create editable accounting and administrative documents and export them as PDF.'
      : 'Crea documentos contables y administrativos editables y expórtalos en PDF.',
    ...internationalSeo(locale, 'tools/accounting-documents', '/documentos-contabeis-online')
  };
}

export default async function AccountingDocumentsPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <InternationalAccountingDocuments locale={locale} />
    </>
  );
}
