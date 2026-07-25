'use client';

import Link from 'next/link';
import type React from 'react';
import {
  MercadoPagoLogo,
  NuPayLogo,
  PAYMENT_METHODS,
  PixLogo,
  StripeLogo,
  type PaymentMethodId
} from '@/components/billing/payment-provider-logos';
import { cn } from '@/lib/utils';

const LOGO: Record<
  PaymentMethodId,
  (props: { className?: string }) => React.ReactElement
> = {
  mercadopago: MercadoPagoLogo,
  stripe: StripeLogo,
  nupay: NuPayLogo,
  pix: PixLogo
};

type Props = {
  className?: string;
  /** Variante escura (aside Premium) ou clara. */
  tone?: 'dark' | 'light';
};

/**
 * Grade de logos clicáveis. Sem botões de texto — só a marca leva ao checkout seguro.
 */
export function PaymentMethodsGrid({ className, tone = 'dark' }: Props) {
  const isDark = tone === 'dark';

  return (
    <div className={cn('space-y-3', className)}>
      <p
        className={cn(
          'text-[11px] font-semibold uppercase tracking-[0.18em]',
          isDark ? 'text-slate-400' : 'text-slate-500'
        )}
      >
        Escolha como pagar
      </p>
      <ul className="grid grid-cols-2 gap-2.5">
        {PAYMENT_METHODS.map((method) => {
          const Logo = LOGO[method.id];
          return (
            <li key={method.id}>
              <Link
                href={method.href}
                aria-label={`Pagar com ${method.label}`}
                title={method.description}
                className={cn(
                  'group relative flex h-[4.25rem] items-center justify-center overflow-hidden rounded-2xl border transition duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2',
                  isDark
                    ? 'border-white/12 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.09] focus-visible:ring-offset-slate-950'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-offset-white',
                  'hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-16px_rgba(14,165,233,0.55)]'
                )}
              >
                <span className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                  <span
                    className={cn(
                      'absolute -left-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full blur-2xl',
                      method.id === 'stripe' && 'bg-indigo-500/25',
                      method.id === 'mercadopago' && 'bg-sky-400/25',
                      method.id === 'pix' && 'bg-teal-400/25',
                      method.id === 'nupay' && 'bg-fuchsia-500/25'
                    )}
                  />
                </span>
                <Logo className="relative z-[1] scale-[1.02] transition duration-200 group-hover:scale-105" />
              </Link>
            </li>
          );
        })}
      </ul>
      <p className={cn('text-[11px] leading-4', isDark ? 'text-slate-500' : 'text-slate-500')}>
        Você será levado a uma página segura para concluir e acompanhar o pagamento.
      </p>
    </div>
  );
}
