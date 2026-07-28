'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';
import { resolveToolsAuthNext, useAuthRequired } from '@/components/auth/auth-required-provider';
import { useAuth } from '@/hooks/use-auth';
import { hasGuestTrialAvailable } from '@/lib/guest-trial';

type AuthAwareLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
  /** Destino quando o visitante não está logado (padrão: modal + login com next). */
  guestHref?: string;
  /**
   * Se true, bloqueia e abre modal. Padrão false: tools abertas (degustação).
   * Use true só em CTAs que exigem conta de imediato.
   */
  promptModal?: boolean;
};

/** Link para ferramentas. Por padrão navega sem pedir conta (1ª geração livre). */
export function AuthAwareLink({
  href,
  guestHref,
  promptModal = false,
  onClick,
  ...props
}: AuthAwareLinkProps) {
  const { ready, isAuthenticated } = useAuth();
  const { requireAuth } = useAuthRequired();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (!ready) return;

    if (promptModal && !isAuthenticated) {
      event.preventDefault();
      const next = resolveToolsAuthNext(href);
      requireAuth(next);
      return;
    }

    // Sem trial restante: ainda deixa abrir a tool; o gate é na geração.
    void hasGuestTrialAvailable;
  }

  return <Link href={isAuthenticated ? href : guestHref || href} onClick={handleClick} {...props} />;
}
