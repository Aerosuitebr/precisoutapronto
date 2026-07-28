import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalLegalDocuments } from '@/components/juridicos/international-legal-documents';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  return {
    title: locale === 'en' ? 'Editable legal document templates' : 'Modelos editables de documentos jurídicos',
    description: locale === 'en'
      ? 'Create an authorization letter, formal notice or settlement draft and export it as a PDF.'
      : 'Crea una carta de autorización, notificación formal o borrador de acuerdo y expórtalo en PDF.',
    ...internationalSeo(locale, 'tools/legal-documents', '/documentos-juridicos-online')
  };
}

export default async function LegalDocumentsPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <InternationalLegalDocuments locale={locale} />
    </>
  );
}
