import type { Metadata, Viewport } from 'next';
import { AnalyticsScripts } from '@/components/analytics/analytics-scripts';
import { AppProviders } from '@/components/providers/app-providers';
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
    default: 'Resolva Jato | Orçamento com Pix no WhatsApp',
    template: '%s | Resolva Jato'
  },
  description:
    'Mande o orçamento, o cliente aprova no celular e você cobra com Pix no WhatsApp. Também currículo, contrato e proposta. Comece grátis.',
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
    title: 'Resolva Jato | Orçamento com Pix no WhatsApp',
    description: 'Cliente aprova no celular. Você recebe no Pix. Sem app, sem cartão.',
    locale: 'pt_BR',
    type: 'website',
    url: siteUrl,
    siteName: 'Resolva Jato'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resolva Jato | Orçamento com Pix no WhatsApp',
    description: 'Cliente aprova no celular. Você recebe no Pix.'
  },
  keywords: [
    'orçamento com pix',
    'orçamento online grátis',
    'gerador de recibo',
    'gerador de contrato',
    'gerador de currículo',
    'proposta comercial',
    'ferramentas grátis para MEI'
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <AppProviders>{children}</AppProviders>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
