'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';
import { getSession } from '@/lib/auth';

/** Após login/cadastro por acesso a ferramentas, preserva deep link da tool. */
export function resolveToolsAuthNext(href?: string) {
  const path = (href || '/ferramentas').split('?')[0] || '/ferramentas';
  if (path.startsWith('/conta')) return path;
  if (path === '/ferramentas' || path.startsWith('/ferramentas/')) return path;
  if (path === '/en/tools' || path.startsWith('/en/tools/')) return path;
  if (path === '/es/tools' || path.startsWith('/es/tools/')) return path;
  return '/ferramentas';
}

export type AuthRequiredVariant = 'default' | 'guest_trial_done';

interface AuthRequiredContextValue {
  requireAuth: (nextHref?: string, variant?: AuthRequiredVariant) => void;
  closeAuthRequired: () => void;
}

const AuthRequiredContext = createContext<AuthRequiredContextValue | null>(null);

export function AuthRequiredProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [nextHref, setNextHref] = useState('/ferramentas');
  const [variant, setVariant] = useState<AuthRequiredVariant>('default');

  const requireAuth = useCallback((href = '/ferramentas', nextVariant: AuthRequiredVariant = 'default') => {
    if (getSession()) return;
    setNextHref(resolveToolsAuthNext(href));
    setVariant(nextVariant);
    setOpen(true);
  }, []);

  const closeAuthRequired = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onAccountRequired(event: Event) {
      if (getSession()) return;
      const detail = (event as CustomEvent<{ nextHref?: string; variant?: AuthRequiredVariant }>).detail;
      requireAuth(
        detail?.nextHref || window.location.pathname || '/ferramentas',
        detail?.variant || 'guest_trial_done'
      );
    }
    window.addEventListener('rj-account-required', onAccountRequired);
    return () => {
      window.removeEventListener('rj-account-required', onAccountRequired);
    };
  }, [requireAuth]);

  const value = useMemo(
    () => ({ requireAuth, closeAuthRequired }),
    [requireAuth, closeAuthRequired]
  );

  return (
    <AuthRequiredContext.Provider value={value}>
      {children}
      <AuthRequiredModal
        open={open}
        nextHref={nextHref}
        variant={variant}
        onClose={closeAuthRequired}
      />
    </AuthRequiredContext.Provider>
  );
}

export function useAuthRequired() {
  const context = useContext(AuthRequiredContext);
  if (!context) {
    throw new Error('useAuthRequired must be used within AuthRequiredProvider');
  }
  return context;
}
