export const locales = ['pt-BR', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];

export const localeHomePath: Record<Locale, string> = {
  'pt-BR': '/',
  en: '/en',
  es: '/es'
};

export const LOCALE_COOKIE = 'rj_locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'pt-BR' || value === 'en' || value === 'es';
}

/** Infere o idioma pela URL (`/en`, `/es` ou restante em PT). */
export function localeFromPathname(pathname: string): Locale {
  if (pathname === '/en' || pathname.startsWith('/en/')) return 'en';
  if (pathname === '/es' || pathname.startsWith('/es/')) return 'es';
  return 'pt-BR';
}

/**
 * Escolhe o locale a partir de Accept-Language.
 * `pt*` → pt-BR, `es*` → es, `en*` → en. Fallback: pt-BR.
 */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return 'pt-BR';

  const candidates = header
    .split(',')
    .map((part) => {
      const [tagRaw, ...params] = part.trim().split(';');
      const tag = (tagRaw || '').trim().toLowerCase();
      let quality = 1;
      for (const param of params) {
        const match = param.trim().match(/^q=([0-9.]+)$/i);
        if (match) {
          const parsed = Number(match[1]);
          if (Number.isFinite(parsed)) quality = parsed;
        }
      }
      return { tag, quality };
    })
    .filter((item) => item.tag)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of candidates) {
    if (tag === '*') continue;
    if (tag === 'pt' || tag.startsWith('pt-')) return 'pt-BR';
    if (tag === 'es' || tag.startsWith('es-')) return 'es';
    if (tag === 'en' || tag.startsWith('en-')) return 'en';
  }

  return 'pt-BR';
}

export function homePathForLocale(locale: Locale): string {
  return localeHomePath[locale];
}

export function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|wget|curl|python-requests|scrapy/i.test(
    userAgent
  );
}
