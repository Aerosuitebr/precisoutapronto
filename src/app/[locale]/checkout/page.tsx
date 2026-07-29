import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { InternationalCheckoutPage } from '@/components/billing/international-checkout-page';
import { isInternationalLocale } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === 'en' ? 'Premium checkout' : 'Checkout Premium',
    robots: { index: false, follow: false }
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <Suspense><InternationalCheckoutPage locale={locale} /></Suspense>
    </>
  );
}
