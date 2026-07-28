'use client';

import { Languages } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { localeLabel, localePath, locales, type Locale } from '@/lib/i18n';

export function LocaleSwitcher({
  locale,
  label = 'Idioma',
  paths
}: {
  locale: Locale;
  label?: string;
  paths?: Partial<Record<Locale, string>>;
}) {
  const router = useRouter();

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <Languages
        className="pointer-events-none absolute left-2.5 h-4 w-4 text-slate-500"
        aria-hidden
      />
      <select
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value as Locale;
          router.push(paths?.[nextLocale] || localePath[nextLocale]);
        }}
        className="h-10 appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-7 text-xs font-bold text-slate-700 shadow-sm outline-none transition hover:border-sky-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        aria-label={label}
      >
        {locales.map((item) => (
          <option key={item} value={item}>
            {localeLabel[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
