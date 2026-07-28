'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, Lock, XCircle } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import type { InternationalLocale } from '@/lib/i18n';

const copy = {
  en: {
    language: 'Language', back: 'Back to plans', title: 'Premium checkout',
    intro: 'Pay securely with Stripe. Your Premium access is activated as soon as payment is confirmed.',
    price: 'US$1.00', period: 'One-time payment · 30 days of Premium',
    features: ['Documents without Resolva Jato branding', 'Secure international card payment', 'No automatic renewal'],
    pay: 'Continue securely with Stripe', starting: 'Opening secure checkout...',
    secure: 'Payment processed securely by Stripe', failed: 'We could not start the checkout. Please try again.',
    cancelled: 'Payment was cancelled. Nothing was charged.', confirming: 'Confirming your payment...',
    success: 'Payment confirmed. Premium is active.',
    pending: 'Stripe has not confirmed the payment yet. Please check again shortly.',
    account: 'Go to my account', retry: 'Try again', free: 'Continue with free tools'
  },
  es: {
    language: 'Idioma', back: 'Volver a planes', title: 'Checkout Premium',
    intro: 'Paga de forma segura con Stripe. Tu acceso Premium se activa cuando se confirma el pago.',
    price: 'US$1,00', period: 'Pago único · 30 días de Premium',
    features: ['Documentos sin la marca Resolva Jato', 'Pago internacional seguro con tarjeta', 'Sin renovación automática'],
    pay: 'Continuar de forma segura con Stripe', starting: 'Abriendo el checkout seguro...',
    secure: 'Pago procesado de forma segura por Stripe', failed: 'No pudimos iniciar el checkout. Inténtalo de nuevo.',
    cancelled: 'El pago fue cancelado. No se realizó ningún cobro.', confirming: 'Confirmando tu pago...',
    success: 'Pago confirmado. Premium está activo.',
    pending: 'Stripe aún no confirmó el pago. Vuelve a comprobarlo en unos instantes.',
    account: 'Ir a mi cuenta', retry: 'Intentar de nuevo', free: 'Continuar con herramientas gratis'
  }
} as const;

type Status = 'idle' | 'starting' | 'confirming' | 'success' | 'pending' | 'cancelled' | 'error';

export function InternationalCheckoutPage({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [status, setStatus] = useState<Status>(
    searchParams.get('billing') === 'stripe-cancel' ? 'cancelled' : 'idle'
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('billing') !== 'stripe-success') return;
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      return;
    }
    let active = true;
    setStatus('confirming');
    void fetch(`/api/billing/confirm-stripe?session_id=${encodeURIComponent(sessionId)}`, {
      credentials: 'include', cache: 'no-store'
    }).then(async (response) => {
      const result = (await response.json()) as { approved?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || t.failed);
      if (!active) return;
      setStatus(result.approved ? 'success' : 'pending');
      if (result.approved) await refresh();
    }).catch((reason) => {
      if (!active) return;
      setError(reason instanceof Error ? reason.message : t.failed);
      setStatus('error');
    });
    return () => { active = false; };
  }, [refresh, searchParams, t.failed]);

  async function startCheckout() {
    setStatus('starting');
    setError('');
    try {
      const response = await fetch('/api/billing/checkout-stripe', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ product: 'premium', locale })
      });
      const result = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || t.failed);
      window.location.assign(result.checkoutUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.failed);
      setStatus('error');
    }
  }

  const message = status === 'success' ? t.success : status === 'pending' ? t.pending :
    status === 'cancelled' ? t.cancelled : status === 'error' ? error || t.failed : '';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6"><Link href={`/${locale}`}><Logo variant="marketing" className="h-12 sm:h-14" /></Link><LocaleSwitcher locale={locale} label={t.language} paths={{ 'pt-BR': '/checkout?method=asaas', en: '/en/checkout', es: '/es/checkout' }} /></div></header>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <Link href={`/${locale}/plans`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
        <AuthGate title={t.title} description={t.intro} requireEmailVerified>
          <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-700"><CreditCard className="h-6 w-6" /></span>
            <h1 className="rj-display mt-5 text-3xl font-extrabold">{t.title}</h1>
            <p className="mt-3 leading-7 text-slate-600">{t.intro}</p>
            <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white"><p className="text-3xl font-extrabold">{t.price}</p><p className="mt-1 text-sm text-slate-300">{t.period}</p></div>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">{t.features.map((feature) => <li key={feature} className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />{feature}</li>)}</ul>
            {message ? <div className={`mt-6 flex gap-3 rounded-2xl p-4 text-sm font-semibold ${status === 'success' ? 'bg-emerald-50 text-emerald-900' : status === 'pending' ? 'bg-amber-50 text-amber-950' : 'bg-rose-50 text-rose-900'}`}>{status === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}{message}</div> : null}
            <div className="mt-7 grid gap-3">
              {status === 'success' ? <Button asChild><Link href={`/${locale}/account`}>{t.account}</Link></Button> : <Button onClick={startCheckout} disabled={status === 'starting' || status === 'confirming'}>{status === 'starting' || status === 'confirming' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{status === 'starting' ? t.starting : status === 'confirming' ? t.confirming : status === 'error' || status === 'cancelled' ? t.retry : t.pay}</Button>}
              <Button asChild variant="outline"><Link href={`/${locale}/tools`}>{t.free}</Link></Button>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-slate-500"><Lock className="h-3.5 w-3.5" />{t.secure}</p>
          </section>
        </AuthGate>
      </main>
    </div>
  );
}
