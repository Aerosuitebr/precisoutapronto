import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalToolsCatalog } from '@/components/marketing/international-tools-catalog';
import { isInternationalLocale } from '@/lib/i18n';

type PageProps = {
  params: Promise<{ locale: string }>;
};

const metadataCopy = {
  en: {
    title: 'Free online tools for work and study',
    description: 'Explore tools for quotes, Pix payments, contracts, receipts, résumés and organization.'
  },
  es: {
    title: 'Herramientas online gratis para trabajar y estudiar',
    description: 'Explora herramientas para presupuestos, Pix, contratos, recibos, currículums y organización.'
  }
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  const copy = metadataCopy[locale];
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: `/${locale}/tools`,
      languages: {
        'pt-BR': '/recursos',
        en: '/en/tools',
        es: '/es/tools',
        'x-default': '/recursos'
      }
    }
  };
}

export default async function LocalizedToolsPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <InternationalToolsCatalog locale={locale} />
    </>
  );
}
