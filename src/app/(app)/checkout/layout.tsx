import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { MpSecurityScript } from '@/components/billing/mp-security-script';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false }
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MpSecurityScript view="checkout" />
      {children}
    </>
  );
}
