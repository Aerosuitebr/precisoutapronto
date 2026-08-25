'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { localeFromPathname } from '@/lib/i18n-locale';

interface ToolsBackButtonProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  href?: string;
}

/** Volta para a grade de ferramentas no locale atual. */
export function ToolsBackButton({ className, size = 'sm', href }: ToolsBackButtonProps) {
  const pathname = usePathname() || '/';
  const locale = localeFromPathname(pathname);
  const fallback =
    locale === 'en' ? '/en/tools' : locale === 'es' ? '/es/tools' : '/ferramentas';
  const label = locale === 'en' ? 'Back' : locale === 'es' ? 'Volver' : 'Voltar';
  const aria =
    locale === 'en'
      ? 'Back to tools'
      : locale === 'es'
        ? 'Volver a herramientas'
        : 'Voltar para ferramentas';

  return (
    <Link
      href={href || fallback}
      aria-label={aria}
      className={cn(
        'precisoutapronto-press inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all duration-150',
        'hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2',
        size === 'default' && 'min-h-11 h-11 px-4 text-sm',
        size === 'sm' && 'min-h-10 h-10 px-3 text-xs',
        size === 'lg' && 'min-h-12 h-12 px-6 text-base',
        className
      )}
    >
      <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </Link>
  );
}
