'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Gift, LockKeyhole, Sparkles, X } from 'lucide-react';
import type { AuthRequiredVariant } from '@/components/auth/auth-required-provider';
import { Button } from '@/components/ui/button';
import { toolsCatalog } from '@/lib/tools-catalog';
import { cn } from '@/lib/utils';

export function describeAuthDestination(nextHref: string) {
  const path = nextHref.split('?')[0] || '/ferramentas';
  const tool = toolsCatalog.find((item) => path === item.href || path.startsWith(`${item.href}/`));
  if (tool) return tool.name;
  if (path.startsWith('/ferramentas')) return 'as ferramentas do Resolva Jato';
  if (path.startsWith('/conta')) return 'sua conta';
  return 'o recurso que você escolheu';
}

interface AuthRequiredModalProps {
  open: boolean;
  nextHref: string;
  variant?: AuthRequiredVariant;
  onClose: () => void;
}

export function AuthRequiredModal({
  open,
  nextHref,
  variant = 'default',
  onClose
}: AuthRequiredModalProps) {
  const destination = describeAuthDestination(nextHref);
  const loginHref = `/login?next=${encodeURIComponent(nextHref)}`;
  const signupHref = `/cadastro?next=${encodeURIComponent(nextHref)}`;
  const trialDone = variant === 'guest_trial_done';

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-required-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        aria-label="Fechar"
        onClick={onClose}
      />

      <div
        className={cn(
          'relative z-10 w-full max-w-md overflow-hidden rounded-t-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]',
          'sm:rounded-[28px]'
        )}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 pb-5 pt-6 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 70% 60% at 15% 0%, rgba(56,189,248,0.35), transparent 55%)'
            }}
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>

          <span className="relative inline-flex items-center gap-2 rounded-lg bg-sky-400/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-200">
            {trialDone ? <Gift className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
            {trialDone ? 'Continue grátis' : 'Acesso com conta'}
          </span>
          <h2 id="auth-required-title" className="rj-display relative mt-4 text-2xl font-extrabold tracking-tight">
            {trialDone
              ? 'Gostou? A geração continua gratuita.'
              : 'Falta pouco para continuar'}
          </h2>
          <p className="relative mt-2 text-sm leading-6 text-slate-300">
            {trialDone ? (
              <>
                Você acabou de gerar um documento sem marca, como no Premium. Crie uma conta grátis
                para seguir usando <strong className="font-semibold text-white">{destination}</strong>.
              </>
            ) : (
              <>
                Crie uma conta gratuita ou faça login para continuar usando{' '}
                <strong className="font-semibold text-white">{destination}</strong>.
              </>
            )}
          </p>
        </div>

        <div className="space-y-3 px-6 py-6">
          <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm leading-6 text-slate-700">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <p>
              {trialDone ? (
                <>
                  Com a conta, PDFs e WhatsApp seguem <strong>gratuitos</strong>, com a marca Resolva
                  Jato. Para tirar qualquer referência, assine o Premium.
                </>
              ) : (
                <>Depois do cadastro ou login, você volta para a ferramenta e continua de onde parou.</>
              )}
            </p>
          </div>

          <Button asChild size="lg" className="h-12 w-full text-base">
            <Link href={signupHref} onClick={onClose}>
              Criar conta grátis
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="h-12 w-full text-base">
            <Link href={loginHref} onClick={onClose}>
              Já tenho conta. Fazer login
            </Link>
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-center text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
          >
            {trialDone ? 'Fechar por agora' : 'Continuar navegando'}
          </button>
        </div>
      </div>
    </div>
  );
}
