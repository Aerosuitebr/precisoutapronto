'use client';

import Link from 'next/link';
import { localeLabel, localePath, locales, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const localeCode: Record<Locale, string> = {
  'pt-BR': 'PT',
  en: 'EN',
  es: 'ES'
};

export function LocaleSwitcher({
  locale,
  label = 'Idioma',
  paths
}: {
  locale: Locale;
  label?: string;
  paths?: Partial<Record<Locale, string>>;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-slate-50/90 p-1 shadow-sm"
    >
      {locales.map((item) => {
        const active = item === locale;
        const href = paths?.[item] || localePath[item];

        return (
          <Link
            key={item}
            href={href}
            hrefLang={item === 'pt-BR' ? 'pt-BR' : item}
            aria-current={active ? 'true' : undefined}
            aria-label={localeLabel[item]}
            title={localeLabel[item]}
            className={cn(
              'inline-flex h-8 min-w-[2.25rem] items-center justify-center rounded-full px-2.5 text-[11px] font-bold tracking-wide transition',
              active
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-slate-900'
            )}
          >
            {localeCode[item]}
          </Link>
        );
      })}
    </div>
  );
}
