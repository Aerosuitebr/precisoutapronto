'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { shouldBrandDocuments } from '@/lib/billing';
import { GUEST_TRIAL_CONSUMED_EVENT, hasGuestTrialAvailable } from '@/lib/guest-trial';

/** Reativo: rodapé da marca em guest e grátis. Premium sai limpo. */
export function useDocumentBranding() {
  const { usage, isAuthenticated, ready } = useAuth();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((value) => value + 1);
    window.addEventListener(GUEST_TRIAL_CONSUMED_EVENT, bump);
    window.addEventListener('resolva-jato-auth-change', bump);
    return () => {
      window.removeEventListener(GUEST_TRIAL_CONSUMED_EVENT, bump);
      window.removeEventListener('resolva-jato-auth-change', bump);
    };
  }, []);

  void tick;
  void ready;
  void usage.unlimited;
  void isAuthenticated;
  void hasGuestTrialAvailable;

  return shouldBrandDocuments();
}
