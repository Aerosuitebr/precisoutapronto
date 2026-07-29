import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ToolsHomeButton } from '@/components/layout/tools-home-button';

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

/** Hub de ferramentas aberto a visitantes (cadastro só na 2ª geração de documento). */
export default function FerramentasLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ToolsHomeButton />
      {children}
    </>
  );
}
