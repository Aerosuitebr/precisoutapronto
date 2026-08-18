import type { Metadata } from 'next';
import { PrecificacaoApp } from '@/components/precificacao/precificacao-app';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import {
  CalculatorContentSections,
  CalculatorJsonLd,
  PUBLIC_CALCULATORS
} from '@/lib/seo/public-calculators';

const seo = PUBLIC_CALCULATORS.precificacao;

export const metadata: Metadata = {
  title: 'Calculadora de preço para freelancer grátis',
  description: seo.description,
  alternates: {
    canonical: seo.path,
    languages: {
      'pt-BR': seo.path,
      en: '/en/tools/freelance-pricing',
      es: '/es/tools/freelance-pricing',
      'x-default': seo.path
    }
  },
  openGraph: {
    title: 'Calculadora de preço para freelancer | Precisou, Tá Pronto',
    description: 'Descubra quanto cobrar considerando custos, tempo, impostos e margem.',
    url: seo.path,
    images: [{ url: `${seo.path}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de preço para freelancer | Precisou, Tá Pronto',
    description: 'Descubra quanto cobrar considerando custos, tempo, impostos e margem.',
    images: [`${seo.path}/opengraph-image`]
  }
};

export default function CalculadoraDePrecoFreelancerPage() {
  return (
    <>
      <CalculatorJsonLd calculator={seo} />
      <SiteHeader />
      <main className="bg-[image:var(--rj-page-bg)]">
        <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
          <PrecificacaoApp publicAccess />
          <CalculatorContentSections calculator={seo} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
