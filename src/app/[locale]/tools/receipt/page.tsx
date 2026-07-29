import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalReceiptEditor } from '@/components/recibos/international-receipt-editor';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  return {
    title: locale === 'en' ? 'Professional receipt in PDF' : 'Recibo profesional en PDF',
    description:
      locale === 'en'
        ? 'Create a professional Brazilian payment receipt and download it as a PDF.'
        : 'Crea un recibo de pago brasileño profesional y descárgalo en PDF.',
    ...internationalSeo(locale, 'tools/receipt', '/gerador-de-recibo')
  };
}

export default async function ReceiptPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <InternationalReceiptEditor locale={locale} />
    </>
  );
}
