import type { Metadata } from 'next';
import { RemoverFundoApp } from '@/components/remover-fundo/remover-fundo-app';
import { OrphanToolLandingPage } from '@/components/marketing/orphan-tool-landing-page';
import { getOrphanLanding } from '@/lib/seo/orphan-tool-landings';
import { getViralBaseUrl } from '@/lib/viral-loop';

const landing = getOrphanLanding('remover-fundo')!;
const SITE = getViralBaseUrl().replace(/\/$/, '');

export const metadata: Metadata = {
  title: landing.metaTitle,
  description: landing.metaDescription,
  keywords: landing.keywords,
  alternates: { canonical: landing.path },
  openGraph: {
    title: landing.metaTitle,
    description: landing.metaDescription,
    url: `${SITE}${landing.path}`,
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: `${landing.path}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: landing.metaTitle,
    description: landing.metaDescription,
    images: [`${landing.path}/opengraph-image`]
  }
};

export default function RemoverFundoDeImagemPage() {
  return (
    <OrphanToolLandingPage landing={landing}>
      <RemoverFundoApp />
    </OrphanToolLandingPage>
  );
}
