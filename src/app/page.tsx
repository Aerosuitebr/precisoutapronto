import type { Metadata } from 'next';
import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { SiteFooter } from '@/components/marketing/site-footer';
import { LandingPage } from '@/components/marketing/landing-page';
import { BRAND_NAME } from '@/lib/brand';

const homeTitle = `${BRAND_NAME}: orçamento no WhatsApp, recibo e Pix grátis`;
const homeDescription =
  'Crie orçamentos com Pix, emita recibos em PDF, calcule férias, rescisão e 13º e gere seu link de WhatsApp. Encontre a ferramenta para resolver sua tarefa pelo celular.';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/',
      en: '/en',
      es: '/es',
      'x-default': '/'
    }
  },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: '/',
    siteName: BRAND_NAME,
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: homeTitle }]
  },
  twitter: {
    card: 'summary_large_image',
    title: homeTitle,
    description: homeDescription,
    images: ['/opengraph-image']
  }
};

export default function HomePage() {
  return (
    <>
      <TopEnvBanner />
      <div>
        <LandingPage />
        <SiteFooter />
      </div>
    </>
  );
}
