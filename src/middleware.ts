import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  homePathForLocale,
  isLikelyBot,
  isLocale,
  localeFromAcceptLanguage,
  localeFromPathname,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type Locale
} from '@/lib/i18n-locale';

const DEVICE_COOKIE = 'rj_device';
const PUBLIC_CACHEABLE_PATHS = new Set([
  '/',
  '/busca',
  '/calculadora-de-preco-freelancer',
  '/calculadora-de-rescisao',
  '/contato',
  '/contrato-de-aluguel',
  '/documentos-contabeis-online',
  '/documentos-juridicos-online',
  '/gerador-de-contrato',
  '/gerador-de-curriculo',
  '/gerador-de-proposta-comercial',
  '/gerador-de-recibo',
  '/guias',
  '/llms.txt',
  '/mei-ou-clt',
  '/orcamento-com-pix',
  '/planos',
  '/privacidade',
  '/proposta-comercial-mei',
  '/recibo-de-pagamento',
  '/recursos',
  '/sobre',
  '/termos'
]);
const PUBLIC_CACHEABLE_PREFIXES = ['/guias/', '/para/'];

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
  const pathLocale = localeFromPathname(pathname);
  const cookieLocaleRaw = request.cookies.get(LOCALE_COOKIE)?.value;
  const cookieLocale = isLocale(cookieLocaleRaw) ? cookieLocaleRaw : null;
  const userAgent = request.headers.get('user-agent');
  const bot = isLikelyBot(userAgent);

  // Home: usa preferência salva ou Accept-Language na primeira visita (sem redirecionar bots).
  if (pathname === '/' && !bot) {
    const preferred = cookieLocale || localeFromAcceptLanguage(request.headers.get('accept-language'));
    if (preferred !== 'pt-BR') {
      const url = request.nextUrl.clone();
      url.pathname = homePathForLocale(preferred);
      const redirect = NextResponse.redirect(url);
      setLocaleCookie(redirect, preferred);
      return applyCommonHeaders(request, redirect);
    }
    const response = NextResponse.next();
    if (!cookieLocale) setLocaleCookie(response, 'pt-BR');
    return applyCommonHeaders(request, response);
  }

  const response = NextResponse.next();
  // EN/ES na URL sincronizam a preferência. PT fica a cargo do switcher (cookie no clique).
  if (pathLocale === 'en' || pathLocale === 'es') {
    setLocaleCookie(response, pathLocale);
  }
  return applyCommonHeaders(request, response);
}

export const config = {
  // Sitemap, robots, verificação Google e chave IndexNow não precisam de cookie de device.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|google[^/]*\\.html|[a-f0-9]{32}\\.txt|videos/|images/).*)'
  ]
};
