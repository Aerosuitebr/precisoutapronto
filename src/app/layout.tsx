import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { AnalyticsScripts } from '@/components/analytics/analytics-scripts';
import { AppProviders } from '@/components/providers/app-providers';
import { ReferralCapture } from '@/components/referral/referral-capture';
import { SiteJsonLd } from '@/components/marketing/site-json-ld';
import { isStagingEnv, stagingRobots } from '@/lib/app-env';
import { getViralBaseUrl } from '@/lib/viral-loop';
import { BRAND_DESCRIPTION, BRAND_DISPLAY_NAME, BRAND_TAGLINE } from '@/lib/brand';
import './globals.css';

const siteUrl = getViralBaseUrl();
const staging = isStagingEnv();

const googleVerification =
  process.env.GOOGLE_SITE_VERIFICATION || 'DK13pDrQ06EP4nkGF8Dyqp_pby4oOT14LvkL0bBOSSk';
const bingVerification = process.env.BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND_TAGLINE} | ${BRAND_DISPLAY_NAME}`,
    template: `%s | ${BRAND_DISPLAY_NAME}`
  },
  description: BRAND_DESCRIPTION,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: BRAND_DISPLAY_NAME
  },
  icons: {
    icon: '/favicon.svg'
  },
  ...(staging ? { robots: stagingRobots() } : {}),
  openGraph: {
    title: `${BRAND_TAGLINE} | ${BRAND_DISPLAY_NAME}`,
    description: BRAND_DESCRIPTION,
    locale: 'pt_BR',
    type: 'website',
    url: siteUrl,
    siteName: BRAND_DISPLAY_NAME
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_TAGLINE} | ${BRAND_DISPLAY_NAME}`,
    description: BRAND_DESCRIPTION
  },
  keywords: [
    'orçamento no WhatsApp',
    'orçamento com pix',
    'orçamento online grátis',
    'gerador de recibo',
    'recibo online grátis',
    'cobrança para autônomos',
    'ferramentas grátis para MEI',
    'Precisou, Tá Pronto',
    'proposta comercial',
    'gerador de contrato',
    'documentos para prestadores de serviço'
  ],
  ...(!staging && (googleVerification || bingVerification)
    ? {
        verification: {
          ...(googleVerification ? { google: googleVerification } : {}),
          ...(bingVerification ? { other: { 'msvalidate.01': bingVerification } } : {})
        }
      }
    : {})
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b5cff',
  viewportFit: 'cover'
};

/**
 * Não chamar `headers()` / `cookies()` aqui.
 * Isso tornava o root dinâmico e o Next streamava title/canonical DEPOIS de `</head>`,
 * o que o GSC interpretava como “canônica declarada: nenhuma”.
 * Idioma EN/ES: scripts nas páginas `[locale]` + Content-Language no middleware.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <SiteJsonLd />
        <AppProviders>
          <Suspense fallback={null}><ReferralCapture /></Suspense>
          {children}
        </AppProviders>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
