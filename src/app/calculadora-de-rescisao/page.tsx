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
  title: 'Calculadora de rescisão online grátis 2026',
  description:
    'Calculadora de rescisão online grátis 2026: saldo de salário, férias, 13º, aviso prévio e FGTS por modalidade. Sem cadastro.',
  keywords: [
    'calculadora de rescisão',
    'calcular rescisão CLT',
    'rescisão comum acordo',
    'cálculo rescisão 2026',
    'simulador de rescisão'
  ],
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
    title: 'Calculadora de rescisão online grátis 2026',
    description: 'Calcule saldo de salário, férias, 13º, aviso prévio e FGTS sem cadastro.',
    url: seo.path,
    images: [{ url: `${seo.path}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de rescisão online grátis 2026',
    description: 'Calcule saldo de salário, férias, 13º, aviso prévio e FGTS sem cadastro.',
    images: [`${seo.path}/opengraph-image`]
  }
};

export default function CalculadoraDeRescisaoPage() {
  return (
    <>
      <CalculatorJsonLd calculator={seo} />
      <SiteHeader />
      <main className="bg-[image:var(--precisoutapronto-page-bg)]">
        <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
          <RescisaoApp publicAccess />
          <CalculatorContentSections calculator={seo} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
