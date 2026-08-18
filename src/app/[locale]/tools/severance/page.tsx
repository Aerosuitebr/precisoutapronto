import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalSeveranceCalculator } from '@/components/rescisao/international-severance-calculator';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  return {
    ...internationalSeo(locale, 'tools/severance', '/calculadora-de-rescisao'),
    title: locale === 'en'
      ? 'Free Brazilian severance calculator (CLT)'
      : 'Calculadora de liquidación laboral de Brasil gratis',
    description: locale === 'en'
      ? 'Calculate an estimated Brazilian CLT termination online, including salary balance, vacation, 13th salary, notice and the FGTS penalty.'
      : 'Calcula gratis una liquidación laboral CLT de Brasil con saldo salarial, vacaciones, aguinaldo, preaviso y multa del FGTS.'
  };
}

export default async function SeverancePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return <><script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} /><InternationalSeveranceCalculator locale={locale} /></>;
}
