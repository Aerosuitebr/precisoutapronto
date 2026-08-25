import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';

export const metadata: Metadata = {
  title: 'Página não encontrada | Precisou, Tá Pronto',
  description: 'A página solicitada não existe. Encontre ferramentas, modelos e guias no Precisou, Tá Pronto.',
  robots: { index: false, follow: true }
};

const destinations = [
  { href: '/recursos', label: 'Ver todas as ferramentas' },
  { href: '/biblioteca', label: 'Explorar modelos e respostas' },
  { href: '/guias', label: 'Ler guias práticos' }
] as const;

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="grid min-h-[65vh] place-items-center bg-slate-50 px-4 py-16">
        <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-sky-700">
            <Search className="h-7 w-7" aria-hidden />
          </span>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-sky-700">Erro 404</p>
          <h1 className="precisoutapronto-display mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Esta página não foi encontrada
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            O endereço pode ter mudado ou sido digitado incorretamente. Continue por uma das áreas públicas abaixo.
          </p>
          <nav aria-label="Alternativas para continuar" className="mt-8 grid gap-3 sm:grid-cols-3">
            {destinations.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-800 transition hover:border-sky-300 hover:bg-sky-50"
              >
                {item.label}<ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ))}
          </nav>
          <Link href="/" className="mt-7 inline-flex text-sm font-bold text-sky-700 hover:text-sky-600">
            Voltar para a página inicial
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
