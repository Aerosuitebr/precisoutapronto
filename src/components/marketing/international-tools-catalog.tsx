import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Button } from '@/components/ui/button';
import { internationalCopy, type InternationalLocale } from '@/lib/i18n';
import { listInternationalToolsByCategory } from '@/lib/international-tools-catalog';

const pageCopy = {
  en: {
    eyebrow: 'Public tool catalog',
    title: 'Find the right tool and get it done.',
    description:
      'Every tool below opens in English. Editing, saving and exporting may require a free account.',
    notice: 'All editors in this catalog are available in English. Brazil-specific tools keep Brazilian rules with an English interface.',
    back: 'Back to home',
    open: 'Open tool',
    account: 'Create free account',
    brazilBadge: 'Brazil-specific'
  },
  es: {
    eyebrow: 'Catálogo público de herramientas',
    title: 'Encuentra la herramienta correcta y resuélvelo.',
    description:
      'Todas las herramientas de abajo se abren en español. Para editar, guardar o exportar puede ser necesaria una cuenta gratuita.',
    notice:
      'Todos los editores de este catálogo están disponibles en español. Las herramientas específicas de Brasil mantienen las reglas brasileñas con interfaz en español.',
    back: 'Volver al inicio',
    open: 'Abrir herramienta',
    account: 'Crear cuenta gratis',
    brazilBadge: 'Específica de Brasil'
  }
} as const;

export function InternationalToolsCatalog({ locale }: { locale: InternationalLocale }) {
  const copy = pageCopy[locale];
  const nav = internationalCopy[locale].navigation;
  const categories = listInternationalToolsByCategory(locale);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href={`/${locale}`} aria-label="Resolva Jato">
            <Logo variant="marketing" className="h-12 sm:h-14" />
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher
              locale={locale}
              label={nav.language}
              paths={{ 'pt-BR': '/recursos', en: '/en/tools', es: '/es/tools' }}
            />
            <Button asChild className="hidden sm:inline-flex">
              <Link href={`/${locale}/cadastro`}>{copy.account}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700">
              <ArrowLeft className="h-4 w-4" />
              {copy.back}
            </Link>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">{copy.eyebrow}</p>
            <h1 className="rj-display mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">{copy.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{copy.description}</p>
            <div className="mt-7 flex max-w-3xl items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              {copy.notice}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-14 px-4 py-14 sm:px-6 sm:py-20">
          {categories.map((category) => (
            <section key={category.category}>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sky-800">
                  <category.icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold">{category.title}</h2>
                  <p className="text-sm text-slate-500">{category.description}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.tools.map((tool) => (
                  <article key={tool.slug} className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                    <tool.icon className="h-6 w-6 text-sky-700" />
                    <h3 className="mt-4 text-lg font-extrabold">{tool.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{tool.description}</p>
                    {tool.brazilOnly ? (
                      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-amber-700">{copy.brazilBadge}</p>
                    ) : (
                      <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <Sparkles className="h-3.5 w-3.5" />
                        {locale === 'en' ? 'Available in English' : 'Disponible en español'}
                      </p>
                    )}
                    <Link
                      href={tool.href}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-900"
                    >
                      {copy.open}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
