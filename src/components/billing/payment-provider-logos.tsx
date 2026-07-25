import Image, { type StaticImageData } from 'next/image';
import mercadoPagoMark from '@/assets/mercado-pago-mark.png';
import nupayMark from '@/assets/Nupay.png';
import pixMark from '@/assets/pix-mark.png';
import stripeMark from '@/assets/Stripe-Review.jpg';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  title?: string;
  /** Preenche o tile (útil no Stripe, que já é arte de marca). */
  fill?: boolean;
};

function BrandImage({
  src,
  alt,
  className,
  fill,
  sizes,
  priority
}: {
  src: StaticImageData;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes || '180px'}
        priority={priority}
        className={cn('object-cover object-center', className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      sizes={sizes || '160px'}
      priority={priority}
      className={cn('h-9 w-auto max-w-[9.5rem] object-contain', className)}
    />
  );
}

/** Marca Mercado Pago (asset do projeto). */
export function MercadoPagoLogo({ className, title = 'Mercado Pago', fill }: LogoProps) {
  return (
    <BrandImage
      src={mercadoPagoMark}
      alt={title}
      fill={fill}
      className={className}
    />
  );
}

/** Marca Stripe (asset do projeto). */
export function StripeLogo({ className, title = 'Stripe', fill }: LogoProps) {
  return (
    <BrandImage
      src={stripeMark}
      alt={title}
      fill={fill}
      className={cn(fill ? undefined : 'h-10 max-w-[10rem]', className)}
    />
  );
}

/** Marca NuPay / Nubank (asset do projeto). */
export function NuPayLogo({ className, title = 'NuPay', fill }: LogoProps) {
  return (
    <BrandImage
      src={nupayMark}
      alt={title}
      fill={fill}
      className={cn(fill ? undefined : 'h-8 max-w-[8.5rem]', className)}
    />
  );
}

/** Marca Pix (asset do projeto). */
export function PixLogo({ className, title = 'Pix', fill }: LogoProps) {
  return (
    <BrandImage
      src={pixMark}
      alt={title}
      fill={fill}
      className={cn(fill ? undefined : 'h-10 max-w-[9.5rem]', className)}
    />
  );
}

/** Marca Zoop (wordmark, sem asset de imagem no projeto). */
export function ZoopLogo({ className, title = 'Zoop' }: LogoProps) {
  return (
    <span
      role="img"
      aria-label={title}
      className={cn(
        'select-none text-2xl font-extrabold leading-none tracking-tight text-[#ff3b30]',
        className
      )}
    >
      zoop
    </span>
  );
}

/** Marca Asaas (wordmark). */
export function AsaasLogo({ className, title = 'Asaas' }: LogoProps) {
  return (
    <span
      role="img"
      aria-label={title}
      className={cn(
        'select-none text-xl font-extrabold leading-none tracking-tight text-[#0042ff]',
        className
      )}
    >
      asaas
    </span>
  );
}

export type PaymentMethodId = 'mercadopago' | 'stripe' | 'nupay' | 'pix' | 'asaas';

export const PAYMENT_METHODS: Array<{
  id: PaymentMethodId;
  label: string;
  href: string;
  description: string;
  /** Stripe já vem como arte completa: preenche o botão. */
  cover?: boolean;
  surface: 'white' | 'brand';
}> = [
  {
    id: 'asaas',
    label: 'Asaas',
    href: '/checkout?method=asaas',
    description: 'Pix e cartão (crédito ou débito)',
    surface: 'white'
  }
];
