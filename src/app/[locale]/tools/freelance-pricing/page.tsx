import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalFreelancePricing } from '@/components/precificacao/international-freelance-pricing';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  return {
    ...internationalSeo(locale, 'tools/freelance-pricing', '/calculadora-de-preco-freelancer'),
    title: locale === 'en' ? 'Freelance pricing calculator' : 'Calculadora de precio freelance',
    description:
      locale === 'en'
        ? 'Calculate a sustainable freelance project price from costs, hours, fees, taxes and desired profit.'
        : 'Calcula un precio freelance sostenible a partir de costos, horas, comisiones, impuestos y ganancia deseada.'
  };
}

export default async function FreelancePricingPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <InternationalFreelancePricing locale={locale} />
    </>
  );
}
