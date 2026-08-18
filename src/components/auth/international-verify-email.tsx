'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { CheckCircle2, MailWarning } from 'lucide-react';
import { AuthShell } from '@/components/brand/auth-shell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import type { InternationalLocale } from '@/lib/i18n';

const copy = {
  en: { subtitle: 'Email confirmation', success: 'Email confirmed', successText: 'Your account is active and the tools are now available.', tools: 'Open tools', failure: 'We couldn’t confirm your email', missing: 'The link is incomplete.', db: 'The service is temporarily unavailable.', invalid: 'The link is invalid or has expired.', login: 'Back to sign in', home: 'Precisou, Tá Pronto home' },
  es: { subtitle: 'Confirmación de correo', success: 'Correo confirmado', successText: 'Tu cuenta está activa y las herramientas ya están disponibles.', tools: 'Abrir herramientas', failure: 'No pudimos confirmar tu correo', missing: 'El enlace está incompleto.', db: 'El servicio no está disponible temporalmente.', invalid: 'El enlace no es válido o ha caducado.', login: 'Volver al acceso', home: 'Inicio de Precisou, Tá Pronto' }
} as const;

export function InternationalVerifyEmail({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const searchParams = useSearchParams();
  const ok = searchParams.get('ok') === '1';
  const error = searchParams.get('error');
  const { refresh } = useAuth();
  useEffect(() => { if (ok) void refresh(); }, [ok, refresh]);
  return (
    <AuthShell subtitle={t.subtitle} homeHref={`/${locale}`} homeLabel={t.home}>
      <div className="space-y-5 text-center">
        {ok ? <><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" /><h1 className="text-2xl font-bold">{t.success}</h1><p className="text-sm leading-6 text-slate-600">{t.successText}</p><Button asChild className="w-full"><Link href={`/${locale}/tools`}>{t.tools}</Link></Button></> : <><MailWarning className="mx-auto h-12 w-12 text-amber-500" /><h1 className="text-2xl font-bold">{t.failure}</h1><p className="text-sm leading-6 text-slate-600">{error === 'missing' ? t.missing : error === 'db' ? t.db : t.invalid}</p><Button asChild className="w-full" variant="outline"><Link href={`/${locale}/login`}>{t.login}</Link></Button></>}
      </div>
    </AuthShell>
  );
}
