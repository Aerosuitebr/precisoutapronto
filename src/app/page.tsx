import type { Metadata } from 'next';
import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { LandingPage } from '@/components/marketing/landing-page';
import { SiteJsonLd } from '@/components/marketing/site-json-ld';

export const metadata: Metadata = {
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
      <SiteJsonLd />
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
