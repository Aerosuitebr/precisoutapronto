'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, PenLine, QrCode, Wallet } from 'lucide-react';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { Button } from '@/components/ui/button';
import { REDACAO_HOME_DEMO } from '@/lib/redacao-enem/demo-showcase';
import { cn } from '@/lib/utils';

const laneCtaClass =
  'h-11 w-full bg-amber-400 px-5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 ring-1 ring-amber-300/50 transition hover:bg-amber-300 sm:w-auto';

function EnemPreview() {
  const demo = REDACAO_HOME_DEMO;
  const highlight = demo.competencias.filter((c) => [1, 3, 5].includes(c.id));

  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-white text-slate-900 shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-3.5 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">Redação ENEM</p>
        <span className="rounded-full bg-sky-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Nota estimada
        </span>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Tema</p>
        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-800">{demo.tema}</p>
        <p className="mt-3 text-xs leading-5 text-slate-600">“{demo.trecho}”</p>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nota geral</p>
          <p className="text-3xl font-black tracking-tight text-slate-950">{demo.notaTotal}</p>
        </div>
        <div className="mt-3 space-y-2">
          {highlight.map((item) => (
            <div key={item.id} className="flex items-center gap-2.5">
              <span className="w-[7.5rem] shrink-0 truncate text-[11px] font-medium text-slate-600">
                {item.label}
              </span>
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-500"
                  style={{ width: `${(item.nota / 200) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-[11px] font-bold text-slate-700">
                {item.nota}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-4 text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          {demo.pontosFortes[1]}
        </p>
      </div>
    </div>
  );
}

function PixPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-white text-slate-900 shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-3.5 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Cobrança Pix</p>
        <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Pronto
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-slate-900 text-emerald-300">
            <QrCode className="h-10 w-10" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Valor</p>
            <p className="rj-display text-2xl font-extrabold tracking-tight text-slate-950">R$ 180,00</p>
            <p className="mt-1 truncate text-xs text-slate-500">Ana Lima Design · Pix Copia e Cola</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
          <p className="truncate font-mono text-[11px] text-emerald-900">
            00020126580014BR.GOV.BCB.PIX...
          </p>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          QR Code e Copia e Cola no mesmo fluxo.
        </p>
      </div>
    </div>
  );
}

export function HeroDualNiche({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-4 sm:gap-5', className)}>
      <article className="rj-animate-fade-up-delay grid gap-4 rounded-[28px] border border-white/15 bg-white/5 p-4 backdrop-blur-sm sm:grid-cols-[1fr_1.05fr] sm:p-5">
        <div className="flex min-w-0 flex-col justify-center">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">
            <PenLine className="h-3.5 w-3.5" />
            Estudantes
          </p>
          <h2 className="rj-display mt-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            Preocupado com a redação?
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Destaque-se no ENEM com feedback por competência. Cole o texto e veja nota estimada,
            pontos fortes e alertas antes da prova.
          </p>
          <div className="mt-4">
            <Button asChild className={laneCtaClass}>
              <AuthAwareLink href="/ferramentas/redacao-enem">
                Analisar redação
                <ArrowRight className="h-4 w-4" />
              </AuthAwareLink>
            </Button>
          </div>
        </div>
        <EnemPreview />
      </article>

      <article className="rj-animate-fade-up-delay-2 grid gap-4 rounded-[28px] border border-white/15 bg-white/5 p-4 backdrop-blur-sm sm:grid-cols-[1fr_1.05fr] sm:p-5">
        <div className="flex min-w-0 flex-col justify-center">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
            <Wallet className="h-3.5 w-3.5" />
            MEI e freelancers
          </p>
          <h2 className="rj-display mt-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            Precisa cobrar agora?
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Gere a cobrança Pix em segundos. QR Code e Copia e Cola prontos para mandar no WhatsApp,
            sem API bancária.
          </p>
          <div className="mt-4">
            <Button asChild className={laneCtaClass}>
              <Link href="/gerador-de-qr-code-pix">
                Gerar cobrança Pix
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <PixPreview />
      </article>
    </div>
  );
}
