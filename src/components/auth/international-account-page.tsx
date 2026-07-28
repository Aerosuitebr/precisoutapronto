'use client';

import Link from 'next/link';
import { Crown, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { formatDateTime } from '@/lib/billing';
import type { InternationalLocale } from '@/lib/i18n';

const copy = {
  en: {
    language: 'Language', title: 'My account', subtitle: 'Manage your access and Premium plan.',
    connected: 'Connected account', current: 'Current plan', free: 'Free', premium: 'Premium',
    verified: 'Email confirmed', pending: 'Email confirmation pending', tools: 'Open tools',
    plans: 'View plans', premiumUntil: 'Premium access until', clean: 'Documents without the Resolva Jato brand.',
    freeText: 'Your documents include a discreet Resolva Jato footer. Premium removes it for 30 days.',
    payment: 'International Premium checkout is securely processed by Stripe.',
    checkout: 'Continue securely with Stripe · US$1.00'
  },
  es: {
    language: 'Idioma', title: 'Mi cuenta', subtitle: 'Administra tu acceso y el plan Premium.',
    connected: 'Cuenta conectada', current: 'Plan actual', free: 'Gratis', premium: 'Premium',
    verified: 'Correo confirmado', pending: 'Confirmación de correo pendiente', tools: 'Abrir herramientas',
    plans: 'Ver planes', premiumUntil: 'Acceso Premium hasta', clean: 'Documentos sin la marca Resolva Jato.',
    freeText: 'Tus documentos incluyen un pie discreto de Resolva Jato. Premium lo elimina durante 30 días.',
    payment: 'El checkout Premium internacional se procesa de forma segura con Stripe.',
    checkout: 'Continuar de forma segura con Stripe · US$1,00'
  }
} as const;

export function InternationalAccountPage({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const { session, plan, usage } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6"><Link href={`/${locale}`}><Logo variant="marketing" className="h-12 sm:h-14" /></Link><LocaleSwitcher locale={locale} label={t.language} paths={{ 'pt-BR': '/conta', en: '/en/account', es: '/es/account' }} /></div></header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <AuthGate title={t.title} description={t.subtitle} requireEmailVerified={false}>
          <h1 className="rj-display text-3xl font-extrabold sm:text-4xl">{t.title}</h1><p className="mt-2 text-slate-600">{t.subtitle}</p>
          <div className="mt-7 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="bg-slate-950 p-6 text-white"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><UserRound className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-wide text-sky-300">{t.connected}</p><h2 className="mt-1 text-xl font-bold">{session?.user.name}</h2><p className="mt-1 flex items-center gap-2 text-sm text-slate-300"><Mail className="h-4 w-4" />{session?.user.email}</p></div></div></div>
              <div className="p-6"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.current}</p><p className="mt-1 text-2xl font-extrabold">{usage.unlimited ? t.premium : t.free}</p><p className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${session?.user.emailVerified ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}><ShieldCheck className="h-4 w-4" />{session?.user.emailVerified ? t.verified : t.pending}</p>{usage.unlimited && usage.premiumExpiresAt ? <p className="mt-4 text-sm font-semibold text-emerald-700">{t.premiumUntil} {formatDateTime(usage.premiumExpiresAt)}</p> : null}<div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link href={`/${locale}/tools`}>{t.tools}</Link></Button><Button asChild variant="outline"><Link href={`/${locale}/plans`}>{t.plans}</Link></Button></div></div>
            </section>
            <aside className="rounded-[28px] bg-gradient-to-br from-slate-950 to-emerald-950 p-6 text-white shadow-sm"><Crown className="h-7 w-7 text-amber-300" /><h2 className="mt-4 text-2xl font-extrabold">{usage.unlimited ? t.clean : 'Premium'}</h2><p className="mt-3 text-sm leading-7 text-slate-300">{usage.unlimited ? t.clean : t.freeText}</p>{!usage.unlimited ? <><p className="mt-5 rounded-xl bg-emerald-300/10 p-3 text-xs leading-5 text-emerald-100">{t.payment}</p><Button asChild className="mt-5 w-full bg-white text-slate-950 hover:bg-slate-100"><Link href={`/${locale}/checkout`}>{t.checkout}</Link></Button></> : null}</aside>
          </div>
        </AuthGate>
      </main>
    </div>
  );
}
