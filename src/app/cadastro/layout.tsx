import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Criar conta',
  robots: { index: false, follow: false }
};

export default function CadastroLayout({ children }: { children: ReactNode }) {
  return children;
}
