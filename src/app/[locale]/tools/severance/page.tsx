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
    title: locale === 'en' ? 'Brazilian employment termination calculator' : 'Calculadora de liquidación laboral de Brasil',
    description: locale === 'en'
      ? 'Estimate gross Brazilian CLT termination amounts including salary, vacation, 13th salary, notice and FGTS penalty.'
      : 'Estima valores brutos de liquidación CLT brasileña, incluyendo salario, vacaciones, 13.º, preaviso y multa FGTS.'
  };
}

export default async function SeverancePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return <><script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} /><InternationalSeveranceCalculator locale={locale} /></>;
}
