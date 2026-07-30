'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { localeLabel, localePath, locales, type Locale } from '@/lib/i18n';
import {
  hrefWithLocalePreference,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE
} from '@/lib/i18n-locale';
import { cn } from '@/lib/utils';

function FlagBrazil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
      <rect width="24" height="16" rx="1.5" fill="#009B3A" />
      <path d="M12 2.2 21.2 8 12 13.8 2.8 8Z" fill="#FEDF00" />
      <circle cx="12" cy="8" r="3.15" fill="#002776" />
      <path
        d="M9.1 7.35c1.7-.95 3.55-.95 5.8.15"
        fill="none"
        stroke="#fff"
        strokeWidth="0.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FlagUnitedStates({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
      <rect width="24" height="16" rx="1.5" fill="#B22234" />
      <path
        d="M0 1.23h24M0 3.69h24M0 6.15h24M0 8.62h24M0 11.08h24M0 13.54h24"
        stroke="#fff"
        strokeWidth="1.23"
      />
      <rect width="9.6" height="8.55" rx="1" fill="#3C3B6E" />
      <g fill="#fff">
        <circle cx="1.7" cy="1.5" r="0.35" />
        <circle cx="3.5" cy="1.5" r="0.35" />
        <circle cx="5.3" cy="1.5" r="0.35" />
        <circle cx="7.1" cy="1.5" r="0.35" />
        <circle cx="2.6" cy="2.7" r="0.35" />
        <circle cx="4.4" cy="2.7" r="0.35" />
        <circle cx="6.2" cy="2.7" r="0.35" />
        <circle cx="1.7" cy="3.9" r="0.35" />
        <circle cx="3.5" cy="3.9" r="0.35" />
        <circle cx="5.3" cy="3.9" r="0.35" />
        <circle cx="7.1" cy="3.9" r="0.35" />
        <circle cx="2.6" cy="5.1" r="0.35" />
        <circle cx="4.4" cy="5.1" r="0.35" />
        <circle cx="6.2" cy="5.1" r="0.35" />
        <circle cx="1.7" cy="6.3" r="0.35" />
        <circle cx="3.5" cy="6.3" r="0.35" />
        <circle cx="5.3" cy="6.3" r="0.35" />
        <circle cx="7.1" cy="6.3" r="0.35" />
      </g>
    </svg>
  );
}

function FlagSpain({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
      <rect width="24" height="16" rx="1.5" fill="#AA151B" />
      <rect y="4" width="24" height="8" fill="#F1BF00" />
      <rect x="5.2" y="6.1" width="2.4" height="3.8" rx="0.3" fill="#AA151B" opacity="0.85" />
      <rect x="8" y="6.6" width="1.5" height="2.8" rx="0.25" fill="#C60B1E" opacity="0.9" />
    </svg>
  );
}

const localeFlag: Record<Locale, (props: { className?: string }) => ReactNode> = {
  'pt-BR': FlagBrazil,
  en: FlagUnitedStates,
  es: FlagSpain
};

function persistLocalePreference(locale: Locale) {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  // Valor literal (sem encode) para bater com o Set-Cookie do middleware.
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

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
      className="inline-flex h-9 shrink-0 items-center rounded-xl border border-slate-200 bg-white p-0.5 sm:h-10"
    >
      {locales.map((item) => {
        const active = item === locale;
        const href = hrefWithLocalePreference(paths?.[item] || localePath[item], item);
        const Flag = localeFlag[item];

        return (
          <Link
            key={item}
            href={href}
            prefetch={false}
            hrefLang={item === 'pt-BR' ? 'pt-BR' : item}
            aria-current={active ? 'true' : undefined}
            aria-label={localeLabel[item]}
            title={localeLabel[item]}
            onClick={() => persistLocalePreference(item)}
            className={cn(
              'relative inline-flex h-7 w-8 items-center justify-center rounded-lg transition duration-150 sm:h-8 sm:w-9',
              active
                ? 'bg-slate-100 ring-1 ring-slate-200'
                : 'hover:bg-slate-50'
            )}
          >
            <Flag
              className={cn(
                'h-[14px] w-[21px] rounded-[2px] shadow-sm transition duration-150',
                active
                  ? 'opacity-100'
                  : 'opacity-65 hover:opacity-100'
              )}
            />
          </Link>
        );
      })}
    </div>
  );
}
