import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AssinaturaEmailApp } from '@/components/assinatura-email/assinatura-email-app';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';
import { findInternationalTool } from '@/lib/international-tools-catalog';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  const tool = findInternationalTool('email-signature')!;
  return {
    title: tool[locale].name,
    description: tool[locale].description,
    ...internationalSeo(locale, 'tools/email-signature', tool.ptPath)
  };
}

export default async function EmailSignaturePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <AssinaturaEmailApp locale={locale} />
    </>
  );
}
