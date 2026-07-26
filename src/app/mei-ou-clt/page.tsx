import type { Metadata } from 'next';
import { MeiVsCltApp } from '@/components/mei-vs-clt/mei-vs-clt-app';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import {
  CalculatorContentSections,
  CalculatorJsonLd,
  PUBLIC_CALCULATORS
} from '@/lib/seo/public-calculators';

const seo = PUBLIC_CALCULATORS['mei-clt'];

export const metadata: Metadata = {
  title: 'MEI ou CLT: simulador gratuito',
  description: seo.description,
  alternates: { canonical: seo.path },
  openGraph: {
    title: 'MEI ou CLT: compare os cenários | Resolva Jato',
    description: 'Simule os dois cenários gratuitamente antes de tomar uma decisão.',
    url: seo.path,
    images: [{ url: `${seo.path}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MEI ou CLT: compare os cenários | Resolva Jato',
    description: 'Simule os dois cenários gratuitamente antes de tomar uma decisão.',
    images: [`${seo.path}/opengraph-image`]
  }
};

export default function MeiOuCltPage() {
  return (
    <>
      <CalculatorJsonLd calculator={seo} />
      <SiteHeader />
      <main className="bg-[image:var(--rj-page-bg)]">
        <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
          <MeiVsCltApp publicAccess />
          <CalculatorContentSections calculator={seo} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
