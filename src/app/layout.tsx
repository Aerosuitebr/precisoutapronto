import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { AnalyticsScripts } from '@/components/analytics/analytics-scripts';
import { AppProviders } from '@/components/providers/app-providers';
import { ReferralCapture } from '@/components/referral/referral-capture';
import { SiteJsonLd } from '@/components/marketing/site-json-ld';
import { isStagingEnv, stagingRobots } from '@/lib/app-env';
import { getViralBaseUrl } from '@/lib/viral-loop';
import './globals.css';

const siteUrl = getViralBaseUrl();
const staging = isStagingEnv();

const googleVerification =
  process.env.GOOGLE_SITE_VERIFICATION || 'DK13pDrQ06EP4nkGF8Dyqp_pby4oOT14LvkL0bBOSSk';
const bingVerification = process.env.BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Resolva Jato | Ferramentas online grátis para o dia a dia',
    template: '%s | Resolva Jato'
  },
  description:
    'Ferramentas online grátis para trabalho, estudo e tarefas do dia a dia: contratos, recibos, currículo, Pix, cálculos, documentos, IA e Jato Games.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Resolva Jato'
  },
  icons: {
    icon: '/favicon.svg'
  },
  ...(staging ? { robots: stagingRobots() } : {}),
  openGraph: {
    title: 'Resolva Jato | Ferramentas online grátis para o dia a dia',
    description: 'Documentos, cálculos, estudo, produtividade e games em ferramentas práticas que funcionam no navegador.',
    locale: 'pt_BR',
    type: 'website',
    url: siteUrl,
    siteName: 'Resolva Jato'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resolva Jato | Ferramentas online grátis',
    description: 'Resolva trabalho, estudo e tarefas práticas com ferramentas gratuitas no navegador.'
  },
  keywords: [
    'orçamento com pix',
    'orçamento online grátis',
    'gerador de recibo',
    'gerador de contrato',
    'gerador de currículo',
    'proposta comercial',
    'ferramentas grátis para MEI',
    'ferramentas online grátis',
    'ferramentas para o dia a dia',
    'calculadoras online',
    'ferramentas para estudantes'
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
  themeColor: '#0c4a6e',
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
