import Link from 'next/link';
import {
  ArrowRight,
  Check,
  FileCheck2,
  FileText,
  MessageCircleMore,
  QrCode,
  Quote
} from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Button } from '@/components/ui/button';
import { internationalCopy, type InternationalLocale } from '@/lib/i18n';

export function InternationalLandingPage({ locale }: { locale: InternationalLocale }) {
  const copy = internationalCopy[locale];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href={`/${locale}`} aria-label="Resolva Jato">
            <Logo variant="marketing" className="h-12 sm:h-14" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link href={`/${locale}#workflow`} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              {copy.navigation.howItWorks}
            </Link>
            <Link href={`/${locale}#tools`} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              {copy.navigation.tools}
            </Link>
            <Link href={`/${locale}#testimonials`} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              {copy.navigation.testimonials}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <LocaleSwitcher locale={locale} label={copy.navigation.language} />
            <Link
              href={`/${locale}/login`}
              className="hidden text-sm font-semibold text-slate-600 hover:text-slate-950 lg:inline"
            >
              {copy.navigation.signIn}
            </Link>
            <Button asChild className="hidden sm:inline-flex">
              <Link href={`/${locale}/cadastro`}>{copy.navigation.createAccount}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[linear-gradient(145deg,#020617_0%,#0f172a_46%,#064e3b_100%)] text-white">
          <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                {copy.hero.eyebrow}
              </p>
              <h1 className="rj-display mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                {copy.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                {copy.hero.description}
              </p>
              <ul className="mt-7 space-y-3">
                {copy.hero.checks.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-100">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 bg-amber-400 px-6 font-bold text-slate-950 hover:bg-amber-300">
                  <Link href={`/${locale}/tools`}>
                    {copy.hero.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <Link href={`/${locale}/tools`}>{copy.hero.secondaryCta}</Link>
                </Button>
              </div>
            </div>

            <div className="relative rounded-[30px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur sm:p-7">
              <div className="rounded-[22px] bg-white p-6 text-slate-900 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                      Resolva Jato
                    </p>
                    <p className="mt-1 text-lg font-extrabold">{copy.tools.items[0][0]}</p>
                  </div>
                  <FileCheck2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Website + visual identity</p>
                    <p className="mt-1 text-2xl font-extrabold">R$ 2.450,00</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-900">
                      <Check className="h-5 w-5" />
                      <p className="mt-2 text-sm font-bold">Mobile approval</p>
                    </div>
                    <div className="rounded-2xl bg-sky-50 p-4 text-sky-900">
                      <QrCode className="h-5 w-5" />
                      <p className="mt-2 text-sm font-bold">Pix ready</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-700">{copy.workflow.eyebrow}</p>
          <h2 className="rj-display mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            {copy.workflow.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{copy.workflow.description}</p>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {copy.workflow.steps.map(([number, title, description]) => (
              <li key={number} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-sky-100 text-sm font-extrabold text-sky-800">{number}</span>
                <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="tools" className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">{copy.tools.eyebrow}</p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{copy.tools.title}</h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {copy.tools.items.map(([title, description], index) => (
                <li key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  {index % 2 === 0 ? <FileText className="h-5 w-5 text-sky-700" /> : <QrCode className="h-5 w-5 text-emerald-700" />}
                  <h3 className="mt-3 font-extrabold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-8">
              <Link href={`/${locale}/tools`}>
                {copy.tools.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section id="testimonials" className="bg-sky-50">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-700">{copy.socialProof.eyebrow}</p>
            <h2 className="rj-display mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">{copy.socialProof.title}</h2>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {[
                ['Caleb', 'C', copy.socialProof.caleb, copy.socialProof.translated],
                ['Sharmistha Hoagland', 'SH', copy.socialProof.sharmistha, 'Product Hunt']
              ].map(([name, initials, quote, note]) => (
                <article key={name} className="flex flex-col rounded-[26px] border border-sky-200 bg-white p-7 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <Quote className="h-5 w-5 text-sky-500" />
                    <span className="inline-flex items-center gap-1.5"><MessageCircleMore className="h-3.5 w-3.5" /> Product Hunt</span>
                  </div>
                  <blockquote className="mt-5 flex-1 text-base font-medium leading-7 text-slate-800">&ldquo;{quote}&rdquo;</blockquote>
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-sky-100 text-sm font-extrabold text-sky-800">{initials}</span>
                    <div>
                      <p className="text-sm font-bold">{name}</p>
                      <p className="text-xs text-slate-500">{note || copy.socialProof.source}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-24">
            <h2 className="rj-display text-3xl font-extrabold tracking-tight sm:text-4xl">{copy.finalCta.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">{copy.finalCta.description}</p>
            <Button asChild size="lg" className="mt-8 bg-amber-400 font-bold text-slate-950 hover:bg-amber-300">
              <Link href={`/${locale}/cadastro`}>
                {copy.finalCta.button}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Resolva Jato</p>
          <p>{copy.footer}</p>
        </div>
      </footer>
    </div>
  );
}
