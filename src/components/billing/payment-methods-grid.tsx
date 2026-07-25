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
  (props: { className?: string; fill?: boolean }) => React.ReactElement
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
 * Grade de logos clicáveis com assets oficiais das marcas.
 * Sem botões de texto — só a marca leva ao checkout seguro.
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
          const isCover = Boolean(method.cover);

          return (
            <li key={method.id}>
              <Link
                href={method.href}
                aria-label={`Pagar com ${method.label}`}
                title={method.description}
                className={cn(
                  'group relative flex h-[4.75rem] items-center justify-center overflow-hidden rounded-2xl border transition duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2',
                  isDark
                    ? 'focus-visible:ring-offset-slate-950'
                    : 'focus-visible:ring-offset-white',
                  isCover
                    ? 'border-transparent shadow-[0_10px_24px_-14px_rgba(99,91,255,0.85)]'
                    : isDark
                      ? 'border-white/15 bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                      : 'border-slate-200 bg-white shadow-sm',
                  'hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-16px_rgba(14,165,233,0.55)]'
                )}
              >
                {isCover ? (
                  <>
                    <Logo fill className="transition duration-300 group-hover:scale-105" />
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10 opacity-70 transition group-hover:opacity-40" />
                  </>
                ) : (
                  <span className="relative z-[1] flex h-full w-full items-center justify-center px-3 py-2">
                    <Logo className="transition duration-200 group-hover:scale-105" />
                  </span>
                )}
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
