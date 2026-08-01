import { isStagingEnv } from '@/lib/app-env';
import { getViralBaseUrl } from '@/lib/viral-loop';

const PRIVATE_DISALLOWS = [
  '/api/',
  '/conta',
  '/ferramentas/',
  '/oficina/',
  '/comercial/',
  '/checkout',
  '/design-system',
  '/verificar-email',
  '/login',
  '/cadastro',
  '/busca',
  '/documento/',
  '/orcamento/',
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
] as const;

/** Corpo de `/robots.txt` (texto puro, com descoberta de `llms.txt`). */
export function buildRobotsBody(): string {
  const base = getViralBaseUrl().replace(/\/$/, '');

  if (isStagingEnv()) {
    return ['User-Agent: *', 'Disallow: /', ''].join('\n');
  }

  const lines = [
    '# Resolva Jato · crawlers de busca e IA',
    `# LLM context: ${base}/llms.txt`,
    'User-Agent: *',
    'Allow: /',
    ...PRIVATE_DISALLOWS.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${base}/sitemap.xml`,
    `Sitemap: ${base}/sitemaps/index.xml`,
    ''
  ];

  return lines.join('\n');
}
