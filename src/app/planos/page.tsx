import type { Metadata } from 'next';
import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { PricingPage } from '@/components/marketing/pricing-page';

export const metadata: Metadata = {
  title: 'Planos e preços',
  description:
    'Comece grátis: orçamento com Pix, recibo, contrato e proposta. Com o Premium, documentos sem marca por 30 dias.',
  alternates: { canonical: '/planos' },
  openGraph: {
    title: 'Planos e preços | Resolva Jato',
    description:
      'Comece grátis: orçamento com Pix, recibo, contrato e proposta. Com o Premium, documentos sem marca por 30 dias.',
    type: 'website',
    locale: 'pt_BR',
    url: '/planos',
    images: [{ url: '/planos/opengraph-image' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planos e preços | Resolva Jato',
    description:
      'Comece grátis: orçamento com Pix, recibo, contrato e proposta. Com o Premium, documentos sem marca por 30 dias.',
    images: ['/planos/opengraph-image']
  }
};

export default function PlanosPage() {
  return (
    <>
      <TopEnvBanner />
      <div className="pt-8">
        <SiteHeader />
        <main>
          <PricingPage />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
