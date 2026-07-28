import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalPixGenerator } from '@/components/pix/international-pix-generator';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  return {
    ...internationalSeo(locale, 'tools/pix', '/ferramentas/pix'),
    title: locale === 'en' ? 'Pix QR code generator' : 'Generador de código QR Pix',
    description:
      locale === 'en'
        ? 'Create a Pix QR code, copy-and-paste payment code and WhatsApp payment message.'
        : 'Crea un código QR Pix, un código para copiar y pegar y un mensaje de cobro para WhatsApp.'
  };
}

export default async function PixPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <InternationalPixGenerator locale={locale} />
    </>
  );
}
