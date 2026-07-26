import { Suspense } from 'react';
import type { Metadata } from 'next';
import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { LandingPage } from '@/components/marketing/landing-page';
import { SiteJsonLd } from '@/components/marketing/site-json-ld';
import { ReferralCapture } from '@/components/referral/referral-capture';

export const metadata: Metadata = {
  alternates: { canonical: '/' }
};

export default function HomePage() {
  return (
    <>
      <SiteJsonLd />
      <TopEnvBanner />
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
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
