import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalServiceContractEditor } from '@/components/contratos/international-service-contract-editor';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  return {
    title: locale === 'en' ? 'Service agreement template' : 'Contrato de prestación de servicios',
    description:
      locale === 'en'
        ? 'Create an editable service agreement with scope, payment, term and PDF export.'
        : 'Crea un contrato editable de servicios con objeto, pago, vigencia y exportación a PDF.',
    ...internationalSeo(locale, 'tools/service-contract', '/gerador-de-contrato')
  };
}

export default async function ServiceContractPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <InternationalServiceContractEditor locale={locale} />
    </>
  );
}
