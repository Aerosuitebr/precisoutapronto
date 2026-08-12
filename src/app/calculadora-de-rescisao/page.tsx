import type { Metadata } from 'next';
import { RescisaoApp } from '@/components/rescisao/rescisao-app';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import {
  CalculatorContentSections,
  CalculatorJsonLd,
  PUBLIC_CALCULATORS
} from '@/lib/seo/public-calculators';

const seo = PUBLIC_CALCULATORS.rescisao;

export const metadata: Metadata = {
  title: 'Calculadora de Rescisão Trabalhista Grátis com FGTS',
  description: seo.description,
  alternates: {
    canonical: seo.path,
    languages: {
      'pt-BR': seo.path,
      en: '/en/tools/severance',
      es: '/es/tools/severance',
      'x-default': seo.path
    }
  },
  openGraph: {
    title: 'Calculadora de rescisão grátis | Resolva Jato',
    description: 'Faça uma estimativa educativa das principais verbas rescisórias.',
    url: seo.path,
    images: [{ url: `${seo.path}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de rescisão grátis | Resolva Jato',
    description: 'Faça uma estimativa educativa das principais verbas rescisórias.',
    images: [`${seo.path}/opengraph-image`]
  }
};

export default function CalculadoraDeRescisaoPage() {
  return (
    <>
      <CalculatorJsonLd calculator={seo} />
      <SiteHeader />
      <main className="bg-[image:var(--rj-page-bg)]">
        <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
          <RescisaoApp publicAccess />
          <CalculatorContentSections calculator={seo} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
