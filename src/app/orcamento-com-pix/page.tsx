import type { Metadata } from 'next';
import { OrcamentosApp } from '@/components/orcamentos/orcamentos-app';
import { SeoLandingPage } from '@/components/marketing/seo-landing-page';
import { SEO_LANDINGS } from '@/lib/seo/landing-content';
import { PROMO_ORCAMENTO_VIDEO, promoOrcamentoAbsoluteUrl } from '@/lib/seo/promo-orcamento-video';
import { getViralBaseUrl } from '@/lib/viral-loop';

const content = SEO_LANDINGS['orcamento-com-pix'];
const SITE_URL = getViralBaseUrl().replace(/\/$/, '');
const VIDEO_URL = promoOrcamentoAbsoluteUrl(SITE_URL, PROMO_ORCAMENTO_VIDEO.path);
const VIDEO_THUMB = promoOrcamentoAbsoluteUrl(SITE_URL, `${content.path}/opengraph-image`);

export const metadata: Metadata = {
  title: content.title,
  description: content.description,
    keywords: [
    'gerador de orçamento grátis',
    'gerador de orçamento',
    'orçamento com pix',
    'orçamento online grátis',
    'orçamento whatsapp',
    'orçamento mei',
    'cobrança pix orçamento'
  ],
  alternates: {
    canonical: content.path,
    languages: {
      'pt-BR': content.path,
      en: '/en/tools/quote-pix',
      es: '/es/tools/quote-pix',
      'x-default': content.path
    }
  },
  openGraph: {
    title: content.title,
    description: content.description,
    url: `${SITE_URL}${content.path}`,
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: `${content.path}/opengraph-image` }],
    videos: [
      {
        url: VIDEO_URL,
        width: PROMO_ORCAMENTO_VIDEO.width,
        height: PROMO_ORCAMENTO_VIDEO.height,
        type: 'video/mp4'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: content.title,
    description: content.description,
    images: [`${content.path}/opengraph-image`]
  }
};

const videoJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: PROMO_ORCAMENTO_VIDEO.title,
  description: PROMO_ORCAMENTO_VIDEO.description,
  thumbnailUrl: VIDEO_THUMB,
  contentUrl: VIDEO_URL,
  url: `${SITE_URL}${content.path}`,
  uploadDate: PROMO_ORCAMENTO_VIDEO.publishedAt,
  width: PROMO_ORCAMENTO_VIDEO.width,
  height: PROMO_ORCAMENTO_VIDEO.height,
  inLanguage: 'pt-BR',
  publisher: {
    '@type': 'Organization',
    name: 'Precisou, Tá Pronto',
    url: SITE_URL,
    sameAs: ['https://www.youtube.com/@precisoutapronto']
  }
};

export default function OrcamentoComPixPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }} />
      <SeoLandingPage
        content={content}
        demo={
          <section
            id="montar"
            className="scroll-mt-24 border-b border-slate-200 bg-[image:var(--precisoutapronto-page-bg)]"
          >
            <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
              <OrcamentosApp publicAccess />
            </div>
          </section>
        }
      />
    </>
  );
}
