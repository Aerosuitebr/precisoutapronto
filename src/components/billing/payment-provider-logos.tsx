import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  title?: string;
};

/** Marca Mercado Pago (azul). */
export function MercadoPagoLogo({ className, title = 'Mercado Pago' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 168 48"
      className={cn('h-8 w-auto', className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="168" height="48" rx="8" fill="#009EE3" />
      <text
        x="84"
        y="30"
        textAnchor="middle"
        fill="#fff"
        fontFamily="IBM Plex Sans, Helvetica, Arial, sans-serif"
        fontSize="14"
        fontWeight="700"
      >
        Mercado Pago
      </text>
    </svg>
  );
}

/** Marca Stripe. */
export function StripeLogo({ className, title = 'Stripe' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 120 48"
      className={cn('h-8 w-auto', className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="120" height="48" rx="8" fill="#635BFF" />
      <text
        x="60"
        y="30"
        textAnchor="middle"
        fill="#fff"
        fontFamily="IBM Plex Sans, Helvetica, Arial, sans-serif"
        fontSize="18"
        fontWeight="700"
      >
        Stripe
      </text>
    </svg>
  );
}

/** Marca NuPay / Nubank. */
export function NuPayLogo({ className, title = 'NuPay' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 120 48"
      className={cn('h-8 w-auto', className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="120" height="48" rx="8" fill="#820AD1" />
      <text
        x="60"
        y="30"
        textAnchor="middle"
        fill="#fff"
        fontFamily="IBM Plex Sans, Helvetica, Arial, sans-serif"
        fontSize="16"
        fontWeight="700"
        letterSpacing="0.5"
      >
        NuPay
      </text>
    </svg>
  );
}

/** Ícone Pix (marca BC). */
export function PixLogo({ className, title = 'Pix' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('h-8 w-8', className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="48" height="48" rx="10" fill="#32BCAD" />
      <path
        fill="#fff"
        d="M24.1 12.2 15 21.3a2.4 2.4 0 0 0 0 3.4l9.1 9.1a2.4 2.4 0 0 0 3.4 0l9.1-9.1a2.4 2.4 0 0 0 0-3.4l-9.1-9.1a2.4 2.4 0 0 0-3.4 0Zm-6.4 10.8 5.4-5.4 5.4 5.4-5.4 5.4-5.4-5.4Z"
      />
    </svg>
  );
}

export type PaymentMethodId = 'mercadopago' | 'stripe' | 'nupay' | 'pix';

export const PAYMENT_METHODS: Array<{
  id: PaymentMethodId;
  label: string;
  href: string;
  description: string;
}> = [
  {
    id: 'mercadopago',
    label: 'Mercado Pago',
    href: '/checkout?method=mercadopago',
    description: 'Pix, boleto e cartão'
  },
  {
    id: 'pix',
    label: 'Pix',
    href: '/checkout?method=pix',
    description: 'Pagamento instantâneo'
  },
  {
    id: 'stripe',
    label: 'Stripe',
    href: '/checkout?method=stripe',
    description: 'Cartão internacional'
  },
  {
    id: 'nupay',
    label: 'NuPay',
    href: '/checkout?method=nupay',
    description: 'Conta Nubank'
  }
];
