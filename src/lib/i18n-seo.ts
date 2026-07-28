import type { Metadata } from 'next';
import { isStagingEnv, stagingRobots } from '@/lib/app-env';
import type { InternationalLocale } from '@/lib/i18n';

export function internationalSeo(
  locale: InternationalLocale,
  internationalPath: string,
  portuguesePath: string
): Pick<Metadata, 'alternates' | 'robots' | 'openGraph' | 'twitter'> {
  const suffix = internationalPath ? `/${internationalPath.replace(/^\/+/, '')}` : '';
  const socialImage = `/${locale}/opengraph-image`;
  return {
    alternates: {
      canonical: `/${locale}${suffix}`,
      languages: {
        'pt-BR': portuguesePath,
        en: `/en${suffix}`,
        es: `/es${suffix}`,
        'x-default': portuguesePath
      }
    },
    robots: isStagingEnv() ? stagingRobots() : { index: true, follow: true },
    openGraph: {
      locale: locale === 'en' ? 'en_US' : 'es_ES',
      alternateLocale: ['pt_BR', locale === 'en' ? 'es_ES' : 'en_US'],
      type: 'website',
      url: `/${locale}${suffix}`,
      siteName: 'Resolva Jato',
      images: [{ url: socialImage, width: 1200, height: 630 }]
    },
    twitter: {
      card: 'summary_large_image',
      images: [socialImage]
    }
  };
}
