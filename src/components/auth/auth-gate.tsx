'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface AuthGateProps {
  children: ReactNode;
  title: string;
  description: string;
  enforceUsageLimit?: boolean;
  requireEmailVerified?: boolean;
  /** Quando false, redireciona visitante ao login. Padrão: aberto (degustação). */
  publicAccess?: boolean;
}

export function AuthGate({
  children,
  requireEmailVerified = false,
  publicAccess = true
}: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, isAuthenticated, emailVerified, session } = useAuth();
  const showVerifyBanner = isAuthenticated && !emailVerified;
  const hardBlockEmail = requireEmailVerified && showVerifyBanner;
  const locale =
    pathname === '/en' || pathname.startsWith('/en/')
      ? 'en'
      : pathname === '/es' || pathname.startsWith('/es/')
        ? 'es'
        : 'pt-BR';
  const copy = {
    'pt-BR': {
      loading: 'Carregando sua conta...',
      almost: 'Falta pouco para acessar esta ferramenta.',
      redirect: 'Abrindo a tela de login. Depois você entra na área de ferramentas.',
      confirm: 'Confirme seu e-mail quando puder',
      confirmHard: 'Confirme seu e-mail para continuar',
      sent: 'Enviamos um link para',
      release:
        'Você já pode usar as ferramentas. A confirmação ajuda a proteger sua conta e recuperar acesso.',
      releaseHard: 'As ferramentas só são liberadas após a confirmação.',
      resend: 'Reenviar confirmação no login',
      freeBrand:
        'Documentos grátis saem com a marca Precisou, Tá Pronto. No Premium você remove qualquer referência.'
    },
    en: {
      loading: 'Loading your account...',
      almost: 'You’re almost ready to use this tool.',
      redirect: 'Opening the sign-in page. You’ll return to the tool afterward.',
      confirm: 'Confirm your email when you can',
      confirmHard: 'Confirm your email to continue',
      sent: 'We sent a link to',
      release:
        'You can already use the tools. Confirmation helps protect your account and recover access.',
      releaseHard: 'The tools are available after email confirmation.',
      resend: 'Resend confirmation from sign in',
      freeBrand:
        'Free documents include the Precisou, Tá Pronto mark. Premium removes every reference.'
    },
    es: {
      loading: 'Cargando tu cuenta...',
      almost: 'Ya casi puedes utilizar esta herramienta.',
      redirect: 'Abriendo la página de acceso. Después volverás a la herramienta.',
      confirm: 'Confirma tu correo cuando puedas',
      confirmHard: 'Confirma tu correo para continuar',
      sent: 'Enviamos un enlace a',
      release:
        'Ya puedes usar las herramientas. La confirmación ayuda a proteger tu cuenta y recuperar el acceso.',
      releaseHard: 'Las herramientas estarán disponibles después de confirmar el correo.',
      resend: 'Reenviar confirmación desde el acceso',
      freeBrand:
        'Los documentos gratis llevan la marca Precisou, Tá Pronto. Con Premium quitas cualquier referencia.'
    }
  }[locale];
  const loginPath = locale === 'pt-BR' ? '/login' : `/${locale}/login`;

  useEffect(() => {
    if (publicAccess || !ready || isAuthenticated) return;
    const fallback = locale === 'pt-BR' ? '/ferramentas' : `/${locale}/tools`;
    router.replace(`${loginPath}?next=${encodeURIComponent(pathname || fallback)}`);
  }, [isAuthenticated, locale, loginPath, pathname, publicAccess, ready, router]);

  if (!publicAccess) {
    if (!ready) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
          {copy.loading}
        </div>
      );
    }
    if (!isAuthenticated) {
      return (
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-8 text-sm leading-6 text-slate-700">
          <p className="font-semibold text-slate-900">{copy.almost}</p>
          <p className="mt-2">{copy.redirect}</p>
        </div>
      );
    }
  }

  if (hardBlockEmail) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-sm leading-6 text-slate-700">
        <p className="font-semibold text-slate-900">{copy.confirmHard}</p>
        <p className="mt-2">
          {copy.sent} <strong>{session?.user.email}</strong>. {copy.releaseHard}
        </p>
        <Button asChild className="mt-5">
          <Link href={`${loginPath}?email=${encodeURIComponent(session?.user.email || '')}`}>
            {copy.resend}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {showVerifyBanner ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          <p className="font-bold">{copy.confirm}</p>
          <p className="mt-1">
            {copy.sent} <strong>{session?.user.email}</strong>. {copy.release}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href={`${loginPath}?email=${encodeURIComponent(session?.user.email || '')}`}>
              {copy.resend}
            </Link>
          </Button>
        </div>
      ) : null}
      {children}
    </>
  );
}
