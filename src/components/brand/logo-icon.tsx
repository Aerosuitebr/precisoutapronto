import { cn } from '@/lib/utils';
import { BRAND_DISPLAY_NAME } from '@/lib/brand';

interface LogoIconProps {
  className?: string;
}

export function LogoIcon({ className }: LogoIconProps) {
  return (
    <svg viewBox="0 0 64 64" className={cn('h-10 w-10', className)} role="img" aria-label={BRAND_DISPLAY_NAME}>
      <rect width="64" height="64" rx="16" fill="#071b45" />
      <path d="M18 12h25l9 9v29a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4Z" fill="none" stroke="#155dfc" strokeWidth="5" strokeLinejoin="round" />
      <path d="M43 12v10h9" fill="none" stroke="#155dfc" strokeWidth="5" strokeLinejoin="round" />
      <path d="m24 38 6 6 12-14" fill="none" stroke="#84cc16" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 25h8M3 34h10M7 43h6" stroke="#155dfc" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
