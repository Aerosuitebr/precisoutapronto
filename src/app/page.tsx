import type { Metadata } from 'next';
import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { LandingPage } from '@/components/marketing/landing-page';
import { StrategicHubs } from '@/components/marketing/strategic-hubs';

export const metadata: Metadata = {
  title: { absolute: 'Resolva Jato: Orçamentos, Recibos e Pix Grátis' },
  description:
    'Crie um orçamento profissional grátis, envie pelo WhatsApp, receba a aprovação do cliente e cobre por Pix. Teste sem cadastro.',
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

export default function HomePage() {
  return (
    <>
      <TopEnvBanner />
      <div className="pt-8">
        <SiteHeader />
        <main>
          <LandingPage />
          <StrategicHubs />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
