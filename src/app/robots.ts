import type { MetadataRoute } from 'next';
import { isStagingEnv } from '@/lib/app-env';
import { getViralBaseUrl } from '@/lib/viral-loop';

export default function robots(): MetadataRoute.Robots {
  const base = getViralBaseUrl();

  if (isStagingEnv()) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/'
      }
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/conta',
        '/ferramentas/',
        '/oficina/',
        '/comercial/',
        '/checkout',
        '/design-system',
        '/verificar-email',
        '/en/account',
        '/es/account',
        '/en/checkout',
        '/es/checkout',
        '/en/login',
        '/es/login',
        '/en/cadastro',
        '/es/cadastro',
        '/en/verify-email',
        '/es/verify-email',
        '/en/quote/',
        '/es/quote/'
      ]
    },
    sitemap: `${base}/sitemap.xml`
  };
}
