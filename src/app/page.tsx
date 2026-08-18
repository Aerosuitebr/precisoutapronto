import type { Metadata } from 'next';
import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { LandingPage } from '@/components/marketing/landing-page';

export const metadata: Metadata = {
  title: { absolute: 'Resolva Jato: Recibos, Cálculos e Documentos Online' },
  description:
    'Resolva tarefas práticas com recibos, calculadoras, documentos e ferramentas online. Encontre o que precisa e saia com o resultado pronto.',
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
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
