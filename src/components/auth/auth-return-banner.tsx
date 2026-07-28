'use client';

import { describeAuthDestination } from '@/components/auth/auth-required-modal';
import { localeFromPathname } from '@/lib/i18n-locale';

interface AuthReturnBannerProps {
  nextHref: string | null | undefined;
}

const bannerCopy = {
  'pt-BR': {
    before: 'Faça login para acessar',
    after: 'Depois do acesso, você entra na área de ferramentas.'
  },
  en: {
    before: 'Sign in to access',
    after: 'After signing in, you return to the tools area.'
  },
  es: {
    before: 'Inicia sesion para acceder a',
    after: 'Despues del acceso, entras al area de herramientas.'
  }
} as const;

/** Banner discreto em login/cadastro quando o usuário veio de uma ferramenta. */
export function AuthReturnBanner({ nextHref }: AuthReturnBannerProps) {
  if (!nextHref || nextHref === '/' || nextHref === '/busca') return null;

  const locale = localeFromPathname(
    typeof window !== 'undefined' ? window.location.pathname : nextHref
  );
  const t = bannerCopy[locale];
  const destination = describeAuthDestination(nextHref, locale);

  return (
    <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-center text-sm leading-6 text-slate-700">
      {t.before} <strong className="font-semibold text-slate-900">{destination}</strong>. {t.after}
    </div>
  );
}
