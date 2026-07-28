import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalLandingPage } from '@/components/marketing/international-landing-page';
import { internationalCopy, isInternationalLocale } from '@/lib/i18n';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  const copy = internationalCopy[locale].metadata;

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'pt-BR': '/',
        en: '/en',
        es: '/es',
        'x-default': '/'
      }
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      locale: locale === 'en' ? 'en_US' : 'es_ES',
      alternateLocale: ['pt_BR', locale === 'en' ? 'es_ES' : 'en_US'],
      type: 'website',
      url: `/${locale}`,
      siteName: 'Resolva Jato',
      images: [{ url: `/${locale}/opengraph-image`, width: 1200, height: 630 }]
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [`/${locale}/opengraph-image`]
    }
  };
}

export default async function InternationalHomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(locale)};`
        }}
      />
      <InternationalLandingPage locale={locale} />
    </>
  );
}
