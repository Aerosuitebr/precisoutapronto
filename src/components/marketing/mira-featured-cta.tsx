import Link from 'next/link';
import { ArrowRight, Building2, MapPin, Radar, Search } from 'lucide-react';
import { getAppEnv } from '@/lib/app-env';
import { getToolById } from '@/lib/tools-catalog';
import { cn } from '@/lib/utils';

/** Escondido em produção até ajustes finais; código permanece para staging/dev. */
export function MiraFeaturedCta({ compact = false }: { compact?: boolean }) {
  if (getAppEnv() === 'production') return null;

  const href = getToolById('mira')?.href || 'https://search.aerosuite.com.br/escolher-busca?origem=precisoutapronto';
  return (
    <section className={cn('relative overflow-hidden bg-slate-950 text-white', compact ? 'rounded-[2rem]' : 'border-b border-slate-800')}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(34,211,238,.2),transparent_34%),radial-gradient(circle_at_88%_90%,rgba(139,92,246,.2),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(56,189,248,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.05)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
      <div className={cn('relative mx-auto grid max-w-6xl items-center gap-8 px-5 sm:px-7 lg:grid-cols-[1fr_.82fr]', compact ? 'py-9 lg:px-10' : 'py-14 sm:py-16')}>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.16em] text-cyan-200">
            <Radar className="h-3.5 w-3.5" /> Novo no Precisou, Tá Pronto
          </div>
          <h2 className="precisoutapronto-display mt-5 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Sua próxima oportunidade pode estar mais perto do que você imagina.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Conheça o MIRA: inteligência para encontrar empresas para prospectar ou profissionais próximos do local do serviço.
          </p>
          <Link href={href} className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:from-cyan-300 hover:to-sky-400 hover:shadow-xl">
            Abrir o MIRA <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs text-slate-500">Escolha sua busca na próxima tela · 1 contato gratuito</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="group rounded-2xl border border-white/10 bg-white/[.06] p-5 backdrop-blur transition hover:border-cyan-300/35 hover:bg-white/[.09]">
            <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200"><Building2 className="h-5 w-5" /></span><div><b className="text-base">Quero encontrar empresas</b><p className="mt-1 text-sm leading-6 text-slate-400">Busque negócios por atividade, região e potencial comercial.</p></div></div>
          </div>
          <div className="group rounded-2xl border border-white/10 bg-white/[.06] p-5 backdrop-blur transition hover:border-violet-300/35 hover:bg-white/[.09]">
            <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-300/10 text-violet-200"><MapPin className="h-5 w-5" /></span><div><b className="text-base">Preciso de um profissional</b><p className="mt-1 text-sm leading-6 text-slate-400">Veja os profissionais mais próximos e a distância até o serviço.</p></div></div>
          </div>
          <div className="hidden items-center gap-2 px-2 text-xs font-semibold text-slate-500 lg:flex"><Search className="h-3.5 w-3.5" /> Busca rápida, objetiva e orientada por localização</div>
        </div>
      </div>
    </section>
  );
}
