import type { Metadata } from 'next';
import Link from 'next/link';
import { MeiVsCltApp } from '@/components/mei-vs-clt/mei-vs-clt-app';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';

export const metadata: Metadata = {
  title: 'MEI ou CLT: simulador gratuito',
  description:
    'Compare uma estimativa de renda líquida como CLT e MEI considerando descontos, DAS e custos mensais.',
  alternates: { canonical: '/mei-ou-clt' },
  openGraph: {
    title: 'MEI ou CLT: compare os cenários | Resolva Jato',
    description: 'Simule os dois cenários gratuitamente antes de tomar uma decisão.',
    url: '/mei-ou-clt'
  }
};

export default function MeiOuCltPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[image:var(--rj-page-bg)]">
        <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
          <MeiVsCltApp publicAccess />
          <section className="mx-auto mt-10 max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-950">A comparação não termina no valor líquido</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Benefícios, estabilidade, férias, FGTS, risco comercial e custos de operação também fazem
              parte da decisão. A simulação é educativa e não substitui orientação contábil, tributária ou
              trabalhista.
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              Entenda os critérios no guia{' '}
              <Link href="/guias/mei-ou-clt-como-comparar" className="font-semibold text-sky-700 hover:underline">
                MEI ou CLT: como comparar
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
