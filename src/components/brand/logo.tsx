import Image from 'next/image';
import { FileCheck2 } from 'lucide-react';
import { BRAND_DISPLAY_NAME, BRAND_LOGO_DARK, BRAND_LOGO_LIGHT } from '@/lib/brand';
import { cn } from '@/lib/utils';

interface LogoProps {
  collapsed?: boolean;
  variant?: 'sidebar' | 'marketing' | 'hero' | 'app' | 'auth' | 'footer';
  className?: string;
}

export function Logo({ collapsed = false, variant = 'marketing', className }: LogoProps) {
  const isHero = variant === 'hero' || variant === 'footer';
  const src = isHero ? BRAND_LOGO_DARK : BRAND_LOGO_LIGHT;

  if (!collapsed && variant === 'marketing') {
    return (
      <span
        className={cn(
          'inline-flex h-11 w-auto shrink-0 items-center gap-2.5 sm:h-12',
          className
        )}
        role="img"
        aria-label={`${BRAND_DISPLAY_NAME} — documentos, cálculos e ferramentas online`}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-900 text-white shadow-sm ring-1 ring-emerald-950/10 sm:h-11 sm:w-11">
          <FileCheck2 className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.8} aria-hidden />
        </span>
        <span className="rj-display flex flex-col text-left font-black leading-[0.88] tracking-[-0.035em] text-emerald-950" aria-hidden>
          <span className="text-[0.82rem] sm:text-sm">Precisou,</span>
          <span className="text-lg sm:text-xl">Tá Pronto!</span>
        </span>
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={`${BRAND_DISPLAY_NAME} — documentos, cálculos e ferramentas online`}
      width={2048}
      height={768}
      priority
      className={cn(
        'w-auto object-contain object-left',
        collapsed && 'h-10 max-w-[3rem]',
        !collapsed && variant === 'hero' && 'h-[6rem] sm:h-[7.5rem] lg:h-[9rem]',
        !collapsed && variant === 'footer' && 'h-14 sm:h-16',
        !collapsed && variant === 'auth' && 'mx-auto h-[5.25rem] sm:h-[6rem]',
        !collapsed && variant === 'app' && 'h-14 sm:h-16 lg:h-[4.5rem]',
        !collapsed && variant === 'sidebar' && 'h-14',
        className
      )}
    />
  );
}
