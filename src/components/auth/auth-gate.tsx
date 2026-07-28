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
  publicAccess?: boolean;
}

export function AuthGate({
  children,
  requireEmailVerified = true,
  publicAccess = false
}: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, isAuthenticated, emailVerified, session } = useAuth();
  const needsEmail = requireEmailVerified && isAuthenticated && !emailVerified;
  const locale = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'pt-BR';
  const copy = {
    'pt-BR': {
      loading: 'Carregando sua conta...', almost: 'Falta pouco para acessar esta ferramenta.',
      redirect: 'Abrindo a tela de login. Depois você entra na área de ferramentas.',
      confirm: 'Confirme seu e-mail para continuar', sent: 'Enviamos um link para',
      release: 'As ferramentas só são liberadas após a confirmação.', resend: 'Reenviar confirmação no login'
    },
    en: {
      loading: 'Loading your account...', almost: 'You’re almost ready to use this tool.',
      redirect: 'Opening the sign-in page. You’ll return to the tool afterward.',
      confirm: 'Confirm your email to continue', sent: 'We sent a link to',
      release: 'The tools are available after email confirmation.', resend: 'Resend confirmation from sign in'
    },
    es: {
      loading: 'Cargando tu cuenta...', almost: 'Ya casi puedes utilizar esta herramienta.',
      redirect: 'Abriendo la página de acceso. Después volverás a la herramienta.',
      confirm: 'Confirma tu correo para continuar', sent: 'Enviamos un enlace a',
      release: 'Las herramientas estarán disponibles después de confirmar el correo.', resend: 'Reenviar confirmación desde el acceso'
    }
  }[locale];
  const loginPath = locale === 'pt-BR' ? '/login' : `/${locale}/login`;

  useEffect(() => {
    if (publicAccess || !ready || isAuthenticated) return;
    const fallback = locale === 'pt-BR' ? '/ferramentas' : `/${locale}/tools`;
    router.replace(`${loginPath}?next=${encodeURIComponent(pathname || fallback)}`);
  }, [isAuthenticated, locale, loginPath, pathname, publicAccess, ready, router]);

  if (publicAccess) return <>{children}</>;
  if (!ready) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{copy.loading}</div>;
  if (!isAuthenticated) {
    return <div className="rounded-2xl border border-sky-100 bg-sky-50 p-8 text-sm leading-6 text-slate-700"><p className="font-semibold text-slate-900">{copy.almost}</p><p className="mt-2">{copy.redirect}</p></div>;
  }
  if (needsEmail) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-sm leading-6 text-slate-700">
        <p className="font-semibold text-slate-900">{copy.confirm}</p>
        <p className="mt-2">{copy.sent} <strong>{session?.user.email}</strong>. {copy.release}</p>
        <Button asChild className="mt-5"><Link href={`${loginPath}?email=${encodeURIComponent(session?.user.email || '')}`}>{copy.resend}</Link></Button>
      </div>
    );
  }
  return <>{children}</>;
}
