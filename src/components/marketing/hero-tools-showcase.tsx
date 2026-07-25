'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardList,
  FileStack,
  FileText,
  GraduationCap,
  MessageCircle,
  MousePointerClick,
  PenLine,
  QrCode,
  Scissors,
  Scale,
  Signature,
  Sparkles,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';

type ShowcaseItem = {
  id: string;
  href: string;
  tabLabel: string;
  icon: typeof ClipboardList;
  eyebrow: string;
  headline: string;
  subtext: string;
  ctaLabel: string;
  mockup: ReactNode;
};

function BrowserChrome({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200/30 bg-white text-slate-800 shadow-2xl shadow-emerald-950/30">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 truncate rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-400 ring-1 ring-slate-200">
          resolvajato.com.br{path}
        </span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function OrcamentoMockup() {
  return (
    <BrowserChrome path="/ferramentas/orcamentos">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-100">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
            Orçamento · aprovação
          </p>
          <p className="mt-0.5 text-sm font-bold text-slate-900">Ana Lima Design</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          <MessageCircle className="h-3 w-3" />
          No WhatsApp
        </span>
      </div>
      <div className="mt-4 space-y-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-800">Identidade visual + kit redes</p>
              <p className="mt-1 text-xs text-slate-500">Mercado Central Ltda</p>
            </div>
            <p className="shrink-0 text-sm font-bold text-slate-900">R$ 2.450,00</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-xs font-bold text-white" tabIndex={-1}>
            <Check className="h-3.5 w-3.5" />
            Aprovar
          </button>
          <button type="button" className="flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700" tabIndex={-1}>
            Ajustar
          </button>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/70 p-2.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-emerald-700 shadow-sm">
            <QrCode className="h-5 w-5" aria-hidden />
          </div>
          <p className="text-xs leading-5 text-emerald-800/80">
            Cliente aprovou. Pix com QR Code pronto pra colar no WhatsApp.
          </p>
        </div>
      </div>
    </BrowserChrome>
  );
}

function RedacaoMockup() {
  const competencias = [
    { label: 'Competência 1 · Norma culta', score: 180 },
    { label: 'Competência 3 · Argumentação', score: 160 },
    { label: 'Competência 5 · Proposta de intervenção', score: 160 }
  ];
  return (
    <BrowserChrome path="/ferramentas/redacao-enem">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">
          Corretor de Redação ENEM
        </p>
        <span className="rounded-full bg-sky-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Nota estimada
        </span>
      </div>
      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
        <p className="text-xs leading-5 text-slate-500">
          “Nos últimos anos, o desafio da educação digital no Brasil tem se tornado cada vez mais
          evidente diante das desigualdades de acesso...”
        </p>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nota geral</p>
        <p className="text-3xl font-black tracking-tight text-slate-950">860</p>
      </div>
      <div className="mt-3 space-y-2">
        {competencias.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-sky-500" style={{ width: `${(item.score / 200) * 100}%` }} />
            </div>
            <span className="w-9 shrink-0 text-right text-[11px] font-bold text-slate-700">{item.score}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        Pontos fortes e alertas por competência, em segundos.
      </p>
    </BrowserChrome>
  );
}

function EditorPdfMockup() {
  return (
    <BrowserChrome path="/ferramentas/editor-pdf">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
          Editor de PDF
        </p>
        <span className="rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Página 2 de 5
        </span>
      </div>
      <div className="mt-3 flex gap-3">
        <div className="flex shrink-0 flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-2">
          {[Wand2, Scissors, Signature].map((Icon, i) => (
            <span
              key={i}
              className={cn(
                'grid h-8 w-8 place-items-center rounded-lg',
                i === 0 ? 'bg-violet-600 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </div>
        <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white p-3">
          <div className="space-y-1.5">
            <div className="h-2 w-2/3 rounded bg-slate-200" />
            <div className="h-2 w-full rounded bg-slate-100" />
            <div className="h-2 w-5/6 rounded bg-slate-100" />
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border-2 border-dashed border-violet-400 bg-violet-50 px-2.5 py-2">
            <MousePointerClick className="h-4 w-4 text-violet-600" />
            <p className="text-[11px] font-semibold text-violet-700">Editando texto — clique para digitar</p>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-2 w-full rounded bg-slate-100" />
            <div className="h-2 w-4/5 rounded bg-slate-100" />
          </div>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        Junta, gira, redimensiona e extrai páginas — direto no navegador.
      </p>
    </BrowserChrome>
  );
}

function CurriculoMockup() {
  return (
    <BrowserChrome path="/ferramentas/curriculo">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">Currículo</p>
        <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Pronto em minutos
        </span>
      </div>
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">
            BS
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Bruna Santos</p>
            <p className="text-xs text-slate-500">Analista de Marketing</p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Experiência</p>
          <div className="space-y-1.5">
            <div className="h-2 w-full rounded bg-slate-100" />
            <div className="h-2 w-4/5 rounded bg-slate-100" />
          </div>
          <p className="pt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Formação</p>
          <div className="h-2 w-2/3 rounded bg-slate-100" />
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        Layout universitário ou profissional, com PDF em um clique.
      </p>
    </BrowserChrome>
  );
}

function CapaAbntMockup() {
  return (
    <BrowserChrome path="/ferramentas/trabalhos">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700">Capa de Trabalho</p>
        <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Padrão ABNT
        </span>
      </div>
      <div className="mt-3 flex flex-col items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Universidade Federal do Brasil
        </p>
        <div className="h-1 w-16 rounded bg-slate-200" />
        <p className="mt-4 max-w-[220px] text-sm font-bold leading-5 text-slate-900">
          Impactos da Inteligência Artificial na Educação Básica
        </p>
        <div className="mt-4 h-1 w-16 rounded bg-slate-200" />
        <p className="text-[10px] text-slate-500">Curitiba · 2026</p>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
        <BookOpen className="h-3.5 w-3.5 text-rose-600" />
        Margens, fonte e espaçamento certos, sem consultar manual.
      </p>
    </BrowserChrome>
  );
}

function ContratoMockup() {
  return (
    <BrowserChrome path="/ferramentas/contratos">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">
          Contratos e Petições
        </p>
        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Pronto para assinar
        </span>
      </div>
      <div className="mt-3 space-y-2.5 rounded-xl border border-slate-200 bg-white p-3.5">
        <p className="text-xs font-bold text-slate-900">Contrato de Prestação de Serviços</p>
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-slate-600">Cláusula 1ª — Do objeto</p>
          <div className="h-2 w-full rounded bg-slate-100" />
          <div className="h-2 w-5/6 rounded bg-slate-100" />
        </div>
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-slate-600">Cláusula 2ª — Do valor e forma de pagamento</p>
          <div className="h-2 w-full rounded bg-slate-100" />
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Signature className="h-3.5 w-3.5 text-slate-500" />
            Assinatura das partes
          </div>
          <span className="text-[11px] font-semibold text-slate-400">PDF · A4</span>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Scale className="h-3.5 w-3.5 text-slate-600" />
        Contrato, procuração ou petição — sem juridiquês, sem retrabalho.
      </p>
    </BrowserChrome>
  );
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'orcamentos',
    href: '/ferramentas/orcamentos',
    tabLabel: 'Orçamentos',
    icon: ClipboardList,
    eyebrow: 'Cobrança no WhatsApp',
    headline: 'Mande o orçamento. Cliente aprova. Pix na hora.',
    subtext: 'O cliente abre o link no celular, aprova ou pede ajuste, e você já manda o Pix.',
    ctaLabel: 'Montar orçamento',
    mockup: <OrcamentoMockup />
  },
  {
    id: 'redacao-enem',
    href: '/ferramentas/redacao-enem',
    tabLabel: 'Redação ENEM',
    icon: PenLine,
    eyebrow: 'Corretor de redação',
    headline: 'Sua nota do ENEM, estimada em segundos.',
    subtext: 'Nota por competência, pontos fortes e alertas antes de entregar a redação.',
    ctaLabel: 'Corrigir redação',
    mockup: <RedacaoMockup />
  },
  {
    id: 'editor-pdf',
    href: '/ferramentas/editor-pdf',
    tabLabel: 'Editor de PDF',
    icon: FileStack,
    eyebrow: 'Editor completo',
    headline: 'Edite qualquer PDF sem instalar nada.',
    subtext: 'Texto, imagem, juntar, girar e extrair páginas, tudo no navegador.',
    ctaLabel: 'Editar PDF',
    mockup: <EditorPdfMockup />
  },
  {
    id: 'curriculo',
    href: '/ferramentas/curriculo',
    tabLabel: 'Currículo',
    icon: GraduationCap,
    eyebrow: 'Carreira',
    headline: 'Currículo profissional pronto em minutos.',
    subtext: 'Layout universitário ou de mercado, com PDF elegante para enviar agora.',
    ctaLabel: 'Montar currículo',
    mockup: <CurriculoMockup />
  },
  {
    id: 'trabalhos',
    href: '/ferramentas/trabalhos',
    tabLabel: 'Capa ABNT',
    icon: BookOpen,
    eyebrow: 'Trabalhos acadêmicos',
    headline: 'Capa no padrão ABNT, sem consultar manual.',
    subtext: 'Escolar ou universitária, com margens e fonte já certas para imprimir.',
    ctaLabel: 'Gerar capa',
    mockup: <CapaAbntMockup />
  },
  {
    id: 'contratos',
    href: '/ferramentas/contratos',
    tabLabel: 'Contratos e Petições',
    icon: Scale,
    eyebrow: 'Documentos jurídicos',
    headline: 'Contrato e petição sem juridiquês.',
    subtext: 'Modelos editáveis para aluguel, serviços, procuração e mais, prontos em PDF.',
    ctaLabel: 'Criar documento',
    mockup: <ContratoMockup />
  }
];

const ROTATE_MS = 5000;

export function HeroToolsShowcase({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % SHOWCASE_ITEMS.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused]);

  const active = useMemo(() => SHOWCASE_ITEMS[activeIndex], [activeIndex]);

  return (
    <div
      className={cn('flex flex-col gap-4', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex flex-wrap gap-2">
        {SHOWCASE_ITEMS.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-pressed={isActive}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition',
                isActive
                  ? 'border-amber-300/80 bg-amber-300/20 text-amber-100 shadow-sm'
                  : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.tabLabel}
            </button>
          );
        })}
      </div>

      <div key={active.id} className="rj-animate-fade-up">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">{active.eyebrow}</p>
        <p className="mt-1.5 text-lg font-extrabold leading-snug text-white sm:text-xl">{active.headline}</p>
        <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-300">{active.subtext}</p>
      </div>

      <div aria-hidden className="hidden flex-1 lg:block" />

      <div className="flex flex-col gap-4">
        {active.mockup}

        <AuthAwareLink
          href={active.href}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:border-amber-300/70 hover:bg-amber-300/20 hover:text-amber-100"
        >
          {active.ctaLabel} →
        </AuthAwareLink>

        <div className="flex items-center gap-1.5">
          {SHOWCASE_ITEMS.map((item, index) => (
            <span
              key={item.id}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                index === activeIndex ? 'bg-amber-300' : 'bg-white/15'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
