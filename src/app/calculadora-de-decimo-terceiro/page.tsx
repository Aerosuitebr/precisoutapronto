import type { Metadata } from 'next';
import { DecimoTerceiroApp } from '@/components/decimo-terceiro/decimo-terceiro-app';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import {
  CalculatorContentSections,
  CalculatorJsonLd,
  PUBLIC_CALCULATORS
} from '@/lib/seo/public-calculators';

const seo = PUBLIC_CALCULATORS.decimoTerceiro;

export const metadata: Metadata = {
  title: 'Calculadora de décimo terceiro 2026 grátis',
  description: seo.description,
  alternates: { canonical: seo.path },
  openGraph: {
    title: 'Calculadora de décimo terceiro 2026 | Precisou, Tá Pronto',
    description: 'Estime o 13º proporcional por avos e as duas parcelas sem cadastro.',
    url: seo.path,
    images: [{ url: `${seo.path}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de décimo terceiro 2026 | Precisou, Tá Pronto',
    description: 'Estime o 13º proporcional por avos e as duas parcelas sem cadastro.',
    images: [`${seo.path}/opengraph-image`]
  }
};

export default function CalculadoraDeDecimoTerceiroPage() {
  return (
    <>
      <CalculatorJsonLd calculator={seo} />
      <SiteHeader />
      <main className="bg-[image:var(--precisoutapronto-page-bg)]">
        <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
          <DecimoTerceiroApp publicAccess />
          <CalculatorContentSections calculator={seo} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
