import type { Metadata } from 'next';
import { FeriasApp } from '@/components/ferias/ferias-app';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import {
  CalculatorContentSections,
  CalculatorJsonLd,
  PUBLIC_CALCULATORS
} from '@/lib/seo/public-calculators';

const seo = PUBLIC_CALCULATORS.ferias;

export const metadata: Metadata = {
  title: 'Calculadora de férias CLT grátis',
  description: seo.description,
  alternates: { canonical: seo.path },
  openGraph: {
    title: 'Calculadora de férias grátis | Precisou, Tá Pronto',
    description: 'Estime férias, 1/3 constitucional e abono pecuniário sem cadastro.',
    url: seo.path,
    images: [{ url: `${seo.path}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de férias grátis | Precisou, Tá Pronto',
    description: 'Estime férias, 1/3 constitucional e abono pecuniário sem cadastro.',
    images: [`${seo.path}/opengraph-image`]
  }
};

export default function CalculadoraDeFeriasPage() {
  return (
    <>
      <CalculatorJsonLd calculator={seo} />
      <SiteHeader />
      <main className="bg-[image:var(--rj-page-bg)]">
        <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
          <FeriasApp publicAccess />
          <CalculatorContentSections calculator={seo} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
