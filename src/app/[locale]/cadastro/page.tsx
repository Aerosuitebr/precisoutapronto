import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { InternationalRegisterPage } from '@/components/auth/international-auth-page';
import { internationalCopy, isInternationalLocale } from '@/lib/i18n';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  return {
    title: internationalCopy[locale].auth.register.metadataTitle,
    robots: { index: false, follow: false }
  };
}

export default async function LocalizedRegisterPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <Suspense>
        <InternationalRegisterPage locale={locale} />
      </Suspense>
    </>
  );
}
