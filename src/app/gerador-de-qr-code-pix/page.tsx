import type { Metadata } from 'next';
import { PixApp } from '@/components/pix/pix-app';
import { SeoLandingPage } from '@/components/marketing/seo-landing-page';
import { SEO_LANDINGS } from '@/lib/seo/landing-content';
import { getViralBaseUrl } from '@/lib/viral-loop';

const content = SEO_LANDINGS['gerador-de-qr-code-pix'];
const SITE_URL = getViralBaseUrl().replace(/\/$/, '');

export const metadata: Metadata = {
  title: content.title,
  description: content.description,
  keywords: [
    'gerador de qr code pix',
    'gerador de pix grátis',
    'pix copia e cola',
    'qr code pix online',
    'gerar qr code pix',
    'cobrança pix'
  ],
  alternates: {
    canonical: content.path,
    languages: {
      'pt-BR': content.path,
      en: '/en/tools/pix',
      es: '/es/tools/pix',
      'x-default': content.path
    }
  },
  openGraph: {
    title: content.title,
    description: content.description,
    url: `${SITE_URL}${content.path}`,
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: `${content.path}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: content.title,
    description: content.description,
    images: [`${content.path}/opengraph-image`]
  }
};

export default function GeradorDeQrCodePixPage() {
  return (
    <SeoLandingPage
      content={content}
      demo={
        <section
          id="gerar"
          className="scroll-mt-24 border-b border-slate-200 bg-[image:var(--precisoutapronto-page-bg)]"
        >
          <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
            <PixApp publicAccess />
          </div>
        </section>
      }
    />
  );
}
