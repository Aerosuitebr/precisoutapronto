import type { Metadata } from 'next';
import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { SiteFooter } from '@/components/marketing/site-footer';
import { LandingPage } from '@/components/marketing/landing-page';
import { BRAND_DISPLAY_NAME, BRAND_TAGLINE } from '@/lib/brand';

const homeTitle = `Orçamento pelo WhatsApp com Pix Grátis | ${BRAND_DISPLAY_NAME}`;
const homeDescription =
  'Monte o orçamento, envie o link no WhatsApp e receba a aprovação no celular. Recibo em PDF sem cadastro para começar. Cliente não instala aplicativo.';

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
    siteName: BRAND_DISPLAY_NAME,
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
