import Image from 'next/image';
import pixAndCard from '@/assets/Pix_and_creditcard.png';
import { cn } from '@/lib/utils';

type PremiumHireArtProps = {
  className?: string;
  priority?: boolean;
};

/** Arte de contratação Premium: Pix ou cartão (crédito/débito). */
export function PremiumHireArt({ className, priority = false }: PremiumHireArtProps) {
  return (
    <Image
      src={pixAndCard}
      alt="Pague com Pix (aprovação instantânea) ou cartão (crédito ou débito)"
      className={cn('h-auto w-full rounded-2xl object-cover', className)}
      sizes="(max-width: 768px) 100vw, 480px"
      priority={priority}
    />
  );
}
