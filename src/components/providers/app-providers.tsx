'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AuthRequiredProvider } from '@/components/auth/auth-required-provider';
import { PostSignupPremiumModal } from '@/components/billing/post-signup-premium-modal';
import { ToastProvider } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import { consumePostSignupPremiumOffer } from '@/lib/guest-trial';

function PostSignupPremiumOffer() {
  const { ready, isAuthenticated, usage } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready || !isAuthenticated || usage.unlimited) return;
    const pending = consumePostSignupPremiumOffer();
    if (pending) setOpen(true);
  }, [isAuthenticated, ready, usage.unlimited]);

  return <PostSignupPremiumModal open={open} onClose={() => setOpen(false)} />;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthRequiredProvider>
        {children}
        <PostSignupPremiumOffer />
      </AuthRequiredProvider>
    </ToastProvider>
  );
}
