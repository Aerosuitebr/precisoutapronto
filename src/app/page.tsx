import type { Metadata } from 'next';
import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { LandingPage } from '@/components/marketing/landing-page';
import { BRAND_DISPLAY_NAME } from '@/lib/brand';
import { getPublicStats } from '@/lib/public-stats';

export const metadata: Metadata = {
  title: { absolute: `${BRAND_DISPLAY_NAME} Orçamento no WhatsApp, aprovado, Pix recebido` },
  description:
    'Monte o orçamento, envie o link no WhatsApp e receba a aprovação no celular. Recibo em PDF sem cadastro para começar. Cliente não instala aplicativo.',
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/',
      en: '/en',
      es: '/es',
      'x-default': '/'
    }
  }
};

export default async function HomePage() {
  const initialStats = await getPublicStats();

  return (
    <>
      <TopEnvBanner />
      <div className="pt-8">
        <SiteHeader />
        <main>
          <LandingPage initialStats={initialStats} />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
