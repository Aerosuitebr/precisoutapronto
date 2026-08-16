import type { Metadata } from 'next';
import { AssinaturaEmailApp } from '@/components/assinatura-email/assinatura-email-app';
import { OrphanToolLandingPage } from '@/components/marketing/orphan-tool-landing-page';
import { getOrphanLanding } from '@/lib/seo/orphan-tool-landings';
import { getViralBaseUrl } from '@/lib/viral-loop';

const landing = getOrphanLanding('assinatura-email')!;
const site = getViralBaseUrl().replace(/\/$/, '');

export const metadata: Metadata = {
  title: { absolute: `${landing.metaTitle} | Resolva Jato` },
  description: landing.metaDescription,
  keywords: landing.keywords,
  alternates: {
    canonical: landing.path,
    languages: {
      'pt-BR': landing.path,
      en: '/en/tools/email-signature',
      es: '/es/tools/email-signature',
      'x-default': landing.path
    }
  },
  openGraph: {
    title: landing.metaTitle,
    description: landing.metaDescription,
    url: `${site}${landing.path}`,
    type: 'website',
    locale: 'pt_BR'
  },
  twitter: { card: 'summary', title: landing.metaTitle, description: landing.metaDescription }
};

export default function EmailSignatureLandingPage() {
  return <OrphanToolLandingPage landing={landing}><AssinaturaEmailApp publicLanding /></OrphanToolLandingPage>;
}
