import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SeoPageContent } from '@/lib/seo-pages/types';

export function ToolLandingHero({
  content,
  preview
}: {
  content: SeoPageContent;
  preview: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-blue-100 bg-[#f8faff] text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(21,94,239,.13),transparent_28%),radial-gradient(circle_at_12%_90%,rgba(131,214,0,.12),transparent_25%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(21,94,239,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(21,94,239,.045)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <nav aria-label="Breadcrumb" className="relative mx-auto flex max-w-6xl items-center gap-1.5 px-4 pt-5 text-sm text-slate-500 sm:px-6">
        <Link href="/" className="rounded px-1 py-1 hover:text-[#155eef]">Início</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href="/recursos" className="rounded px-1 py-1 hover:text-[#155eef]">Ferramentas</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span aria-current="page" className="truncate font-semibold text-slate-800">{content.seo.breadcrumbLabel}</span>
      </nav>
      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-8 sm:px-6 sm:pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:pb-24">
        <div>
          <p className="precisoutapronto-display text-xs font-bold uppercase tracking-[0.25em] text-[#155eef]">
            Precisou, Tá Pronto · {content.toolName}
          </p>
          <h1 className="precisoutapronto-display mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {content.h1}
          </h1>
          <p className="mt-4 max-w-xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
            {content.subtitle}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-13 bg-[#155eef] px-6 text-base font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-[#004eeb]"
            >
              <Link href={content.ctaHref}>
                {content.ctaPrimary}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-13 border border-slate-300 bg-white px-6 text-base font-semibold text-slate-800 shadow-sm hover:border-blue-300 hover:bg-white"
            >
              <a href="#ferramenta">{content.ctaSecondary}</a>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2.5">
            {content.quickBadges.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                <Icon className="h-4 w-4 text-emerald-600" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Mockup pesado só no desktop: no celular o foco é CTA + formulário estável. */}
        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 rounded-[32px] bg-blue-200/40 blur-2xl" aria-hidden />
          <div className="relative rounded-[28px] border border-blue-100 bg-white/80 p-3 shadow-2xl shadow-blue-950/10 backdrop-blur-sm sm:p-4">
            {preview}
          </div>
        </div>
      </div>

      <div className="relative border-t border-blue-100 bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-xs text-slate-500 sm:px-6">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          {content.openWithoutAccount
            ? 'Sem cadastro para emitir. Sem cartão. Funciona no celular ou no computador.'
            : 'Conta opcional após 2 gerações. Sem cartão. Funciona no celular ou no computador.'}
        </div>
      </div>
    </section>
  );
}
