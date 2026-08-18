'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Check, Crown, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/plans';

interface PostSignupPremiumModalProps {
  open: boolean;
  onClose: () => void;
}

export function PostSignupPremiumModal({ open, onClose }: PostSignupPremiumModalProps) {
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
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[210] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-signup-premium-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-[30px] border border-white/10 bg-slate-950 text-white shadow-[0_32px_100px_rgba(2,8,23,0.5)] sm:rounded-[30px]">
        <div className="relative overflow-hidden px-6 py-7 sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-amber-300/15 blur-3xl" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-slate-200 transition hover:bg-white/20 hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>

          <span className="relative inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-amber-200">
            <Crown className="h-3.5 w-3.5" />
            Sua conta grátis está pronta
          </span>
          <h2 id="post-signup-premium-title" className="rj-display relative mt-5 pr-8 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Continue grátis ou deixe seus documentos totalmente limpos.
          </h2>
          <p className="relative mt-3 text-sm leading-6 text-slate-300">
            Sua conta gratuita já permite continuar criando. Se quiser PDFs e links sem a marca
            Precisou, Tá Pronto, o Premium é opcional.
          </p>

          <ul className="relative mt-6 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
            <li className="flex items-center gap-2.5">
              <Check className="h-4 w-4 shrink-0 text-emerald-300" />
              PDF sem rodapé ou logo
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="h-4 w-4 shrink-0 text-emerald-300" />
              Links e mensagens sem referência
            </li>
          </ul>

          <div className="relative mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 flex-1 bg-gradient-to-r from-amber-300 to-sky-200 font-black text-slate-950 hover:from-amber-200 hover:to-sky-100"
            >
              <Link href="/checkout?method=asaas" onClick={onClose}>
                <Sparkles className="h-4 w-4" />
                Premium {PLANS.premium.priceLabel}
                {PLANS.premium.period}
              </Link>
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={onClose}
              className="h-12 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              Continuar grátis
            </Button>
          </div>
          <p className="relative mt-4 text-center text-[11px] leading-5 text-slate-500">
            Oferta opcional, sem bloquear nenhuma ferramenta gratuita.
          </p>
        </div>
      </div>
    </div>
  );
}
