import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  homePathForLocale,
  isLikelyBot,
  localeFromPathname,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_QUERY,
  parseLocale,
  type Locale
} from '@/lib/i18n-locale';

const DEVICE_COOKIE = 'precisoutapronto_device';
const PUBLIC_CACHEABLE_PATHS = new Set([
  '/',
  '/busca',
  '/calculadora-de-preco-freelancer',
  '/calculadora-de-rescisao',
  '/calculadora-de-ferias',
  '/calculadora-de-decimo-terceiro',
  '/contato',
  '/contrato-de-aluguel',
  '/corretor-de-redacao-enem',
  '/editor-de-pdf-online',
  '/gerador-de-referencias-abnt',
  '/agenda-online',
  '/divisor-de-conta',
  '/imprensa',
  '/embed',
  '/checklist-cobranca-mei',
  '/documentos-contabeis-online',
  '/documentos-juridicos-online',
  '/gerador-de-contrato',
  '/gerador-de-curriculo',
  '/gerador-de-proposta-comercial',
  '/gerador-de-recibo',
  '/gerador-de-qr-code-pix',
  '/guias',
  '/llms.txt',
  '/mei-ou-clt',
  '/orcamento-com-pix',
  '/planos',
  '/privacidade',
  '/proposta-comercial-mei',
  '/recibo-de-pagamento',
  '/recibo-de-aluguel',
  '/recursos',
  '/sobre',
  '/termos'
]);
const PUBLIC_CACHEABLE_PREFIXES = ['/guias/', '/para/', '/modelos/', '/biblioteca'];

function needsDeviceCookie(pathname: string) {
  const withoutOg = pathname.replace(/\/opengraph-image$/, '') || '/';
  if (PUBLIC_CACHEABLE_PATHS.has(pathname) || PUBLIC_CACHEABLE_PATHS.has(withoutOg)) return false;
  return !PUBLIC_CACHEABLE_PREFIXES.some(
    (prefix) => pathname.startsWith(prefix) || withoutOg.startsWith(prefix)
  );
}

function randomDeviceId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function isStagingRequest(request: NextRequest) {
  const appEnv = (process.env.APP_ENV || '').toLowerCase();
  if (appEnv === 'staging' || appEnv === 'homolog' || appEnv === 'homologacao') return true;
  const host = request.headers.get('host') || request.nextUrl.hostname || '';
  return host.startsWith('staging.') || host.startsWith('homolog.');
}

function localeCookieOptions() {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE
  };
}

function setLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set(LOCALE_COOKIE, locale, localeCookieOptions());
}

function applyCommonHeaders(request: NextRequest, response: NextResponse) {
  const pathLocale = localeFromPathname(request.nextUrl.pathname);
  const htmlLang = pathLocale === 'en' || pathLocale === 'es' ? pathLocale : 'pt-BR';
  response.headers.set('x-html-lang', htmlLang);
  response.headers.set('Content-Language', htmlLang);

  if (isStagingRequest(request)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }
  if (needsDeviceCookie(request.nextUrl.pathname) && !request.cookies.get(DEVICE_COOKIE)?.value) {
    response.cookies.set(DEVICE_COOKIE, randomDeviceId(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365
    });
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL;

  // Normaliza somente o www do domínio oficial. Domínios externos não são tratados aqui.
  if (configuredOrigin && !pathname.startsWith('/api/')) {
    const requestHost = (request.headers.get('host') || request.nextUrl.hostname || '')
      .split(':')[0]
      .toLowerCase();
    const canonical = new URL(configuredOrigin);
    const canonicalHost = canonical.hostname.toLowerCase();
    const shouldNormalizeWww = requestHost === `www.${canonicalHost}`;
    if (shouldNormalizeWww) {
      const destination = request.nextUrl.clone();
      destination.protocol = canonical.protocol;
      destination.host = canonical.host;
      // O NextURL pode carregar a porta interna do origin (por exemplo, :3000)
      // mesmo depois da troca de host. Nunca a exponha no redirect publico.
      destination.port = canonical.port;
      return NextResponse.redirect(destination, 301);
    }
  }

  const pathLocale = localeFromPathname(pathname);
  const forcedLocale = parseLocale(request.nextUrl.searchParams.get(LOCALE_QUERY));
  const userAgent = request.headers.get('user-agent');
  const bot = isLikelyBot(userAgent);

  // Escolha explícita via query (bandeira PT) ganha de cookie antigo e Accept-Language.
  if (forcedLocale) {
    const url = request.nextUrl.clone();
    url.searchParams.delete(LOCALE_QUERY);
    if (forcedLocale === 'en' || forcedLocale === 'es') {
      url.pathname = homePathForLocale(forcedLocale);
    }
    const redirect = NextResponse.redirect(url);
    setLocaleCookie(redirect, forcedLocale);
    return applyCommonHeaders(request, redirect);
  }

  // Home PT é sempre `/`. Nunca redireciona por Accept-Language nem por cookie
  // legado (ex.: precisoutapronto_locale=en gravado quando o usuário só visitou /en).
  // Idioma EN/ES fica em /en e /es; a bandeira PT força cookie via ?precisoutapronto_locale=.
  if (pathname === '/') {
    const response = NextResponse.next();
    // Apaga cookie EN/ES legado para a home PT não “grudar” idioma errado.
    if (!bot) setLocaleCookie(response, 'pt-BR');
    return applyCommonHeaders(request, response);
  }

  const response = NextResponse.next();
  // EN/ES na URL sincronizam a preferência. PT fica a cargo do switcher (cookie/query).
  if (pathLocale === 'en' || pathLocale === 'es') {
    setLocaleCookie(response, pathLocale);
  }
  return applyCommonHeaders(request, response);
}

export const config = {
  // Sitemap, robots, verificação Google e chave IndexNow não precisam de cookie de device.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|sitemaps/|google[^/]*\\.html|[a-f0-9]{32}\\.txt|videos/|images/).*)'
  ]
};
