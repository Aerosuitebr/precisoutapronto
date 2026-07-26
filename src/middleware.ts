import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  if (PUBLIC_CACHEABLE_PATHS.has(pathname)) return false;
  return !PUBLIC_CACHEABLE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function randomDeviceId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
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

export const config = {
  // Sitemap, robots, verificação Google e chave IndexNow não precisam de cookie de device.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|google[^/]*\\.html|[a-f0-9]{32}\\.txt|videos/|images/).*)'
  ]
};
