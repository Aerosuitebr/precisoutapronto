import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { RequireAuth } from '@/components/auth/require-auth';
import { ToolsHomeButton } from '@/components/layout/tools-home-button';

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export default function FerramentasLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <ToolsHomeButton />
      {children}
    </RequireAuth>
  );
}
