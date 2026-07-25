'use client';

import Link from 'next/link';
import { PremiumHireArt } from '@/components/billing/premium-hire-art';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';

const ASAAS_CHECKOUT = '/checkout?method=asaas';

type Props = {
  className?: string;
  /** Variante escura (aside Premium) ou clara. */
  tone?: 'dark' | 'light';
};

/**
 * CTA único de contratação Premium via Asaas (Pix ou cartão).
 */
export function PaymentMethodsGrid({ className, tone = 'dark' }: Props) {
  const isDark = tone === 'dark';

  return (
    <div className={cn('space-y-4', className)}>
      <p
        className={cn(
          'text-[11px] font-semibold uppercase tracking-[0.18em]',
          isDark ? 'text-slate-400' : 'text-slate-500'
        )}
      >
        Pix ou cartão
      </p>
      <PremiumHireArt />
      <Button
        asChild
        className={cn(
          'w-full font-bold',
          isDark
            ? 'bg-white text-slate-950 hover:bg-sky-50'
            : 'bg-slate-950 text-white hover:bg-slate-800'
        )}
      >
        <Link href={ASAAS_CHECKOUT}>Assinar Premium por {PLANS.premium.priceLabel}</Link>
      </Button>
      <p className={cn('text-[11px] leading-4', isDark ? 'text-slate-500' : 'text-slate-500')}>
        Checkout seguro na Asaas. Crédito ou débito na fatura hospedada.
      </p>
    </div>
  );
}
