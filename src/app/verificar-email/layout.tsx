import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Verificar e-mail',
  robots: { index: false, follow: false }
};

export default function VerificarEmailLayout({ children }: { children: ReactNode }) {
  return children;
}
