import { Suspense } from 'react';
import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { LandingPage } from '@/components/marketing/landing-page';
import { SiteJsonLd } from '@/components/marketing/site-json-ld';
import { ReferralCapture } from '@/components/referral/referral-capture';

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
