import type { Metadata } from 'next';
import { PixApp } from '@/components/pix/pix-app';
import { SeoLandingPage } from '@/components/marketing/seo-landing-page';
import { SEO_LANDINGS } from '@/lib/seo/landing-content';
import { getViralBaseUrl } from '@/lib/viral-loop';
import { ToolStartBoundary } from '@/components/analytics/tool-start-boundary';

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
            <details className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-800">
              <summary className="cursor-pointer font-bold text-emerald-900">Ver exemplo de mensagem de cobrança</summary>
              <p className="mt-3 rounded-xl bg-white p-4">Olá! Segue a cobrança de R$ 150,00 pela instalação de uma luminária. Use o QR Code ou o Pix Copia e Cola para pagar.</p>
              <p className="mt-2">Exemplo ilustrativo. Confira o recebimento no seu banco.</p>
            </details>
            <ToolStartBoundary toolName="pix" landingPath={content.path}>
              <PixApp publicAccess />
            </ToolStartBoundary>
          </div>
        </section>
      }
    />
  );
}
