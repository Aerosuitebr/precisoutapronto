import { isStagingEnv } from '@/lib/app-env';
import { getViralBaseUrl } from '@/lib/viral-loop';

/**
 * Regras Disallow com delimitação explícita.
 * Google trata Disallow como prefixo: `/conta` bloqueava `/contato`.
 * `$` = fim da URL (suportado pelo Google); `/` = só descendentes.
 */
const PRIVATE_DISALLOWS = [
  '/api/',
  '/conta$',
  '/conta/',
  '/ferramentas/',
  '/oficina/',
  '/comercial/',
  '/checkout$',
  '/checkout/',
  '/design-system$',
  '/design-system/',
  '/verificar-email$',
  '/login$',
  '/login/',
  '/cadastro$',
  '/cadastro/',
  '/busca$',
  '/busca/',
  '/documento/',
  '/orcamento/',
  '/en/account$',
  '/en/account/',
  '/es/account$',
  '/es/account/',
  '/en/checkout$',
  '/en/checkout/',
  '/es/checkout$',
  '/es/checkout/',
  '/en/login$',
  '/en/login/',
  '/es/login$',
  '/es/login/',
  '/en/cadastro$',
  '/en/cadastro/',
  '/es/cadastro$',
  '/es/cadastro/',
  '/en/verify-email$',
  '/es/verify-email$',
  '/en/quote/',
  '/es/quote/',
  '/amostra-cinematica$',
  '/amostra-cinematica/'
] as const;

/** Explicitamente público: defesa contra prefix match residual. */
const PUBLIC_ALLOWS = [
  '/contato',
  '/contato/',
  // O catálogo público exato não é coberto pelo bloqueio dos descendentes privados.
  '/ferramentas$',
  // Permite que buscadores processem o redirect 308 e consolidem a URL antiga.
  '/ferramentas/redacao-enem'
] as const;

/** Agentes declarados explicitamente para busca, leitura e treinamento. */
const EXPLICIT_CRAWLERS = [
  'OAI-SearchBot',
  'Google-Extended',
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'PerplexityBot',
  'Applebot',
  'Applebot-Extended'
] as const;

/** Corpo de `/robots.txt` (texto puro, com descoberta de `llms.txt`). */
export function buildRobotsBody(): string {
  const base = getViralBaseUrl().replace(/\/$/, '');

  if (isStagingEnv()) {
    return ['User-Agent: *', 'Disallow: /', ''].join('\n');
  }

  // Grupos específicos não herdam as regras de User-agent: *.
  const lines = [
    '# Precisou, Tá Pronto · crawlers de busca e IA',
    `# LLM context: ${base}/llms.txt`,
    ...EXPLICIT_CRAWLERS.map((agent) => `User-agent: ${agent}`),
    'User-Agent: *',
    'Allow: /',
    ...PUBLIC_ALLOWS.map((path) => `Allow: ${path}`),
    ...PRIVATE_DISALLOWS.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${base}/sitemaps/index`,
    `Sitemap: ${base}/sitemaps/index.xml`,
    `Sitemap: ${base}/sitemap.xml`,
    ''
  ];

  return lines.join('\n');
}
