import type { Metadata } from 'next';
import Link from 'next/link';
import { PrecificacaoApp } from '@/components/precificacao/precificacao-app';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';

export const metadata: Metadata = {
  title: 'Calculadora de preço para freelancer grátis',
  description:
    'Calcule custos, horas, taxas, impostos e margem para chegar a um preço de venda sustentável sem cadastro.',
  alternates: { canonical: '/calculadora-de-preco-freelancer' },
  openGraph: {
    title: 'Calculadora de preço para freelancer | Resolva Jato',
    description: 'Descubra quanto cobrar considerando custos, tempo, impostos e margem.',
    url: '/calculadora-de-preco-freelancer'
  }
};

export default function CalculadoraDePrecoFreelancerPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[image:var(--rj-page-bg)]">
        <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
          <PrecificacaoApp publicAccess />
          <section className="mx-auto mt-10 max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-950">Preço sustentável começa pelo custo real</h2>
            <p className="mt-4 leading-7 text-slate-600">
              A calculadora combina materiais, frete, tempo produtivo, custos fixos, taxas, impostos e
              margem. O valor sugerido é uma referência gerencial: demanda, posicionamento e complexidade
              do projeto também influenciam o preço final.
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              Veja o passo a passo no guia{' '}
              <Link
                href="/guias/como-precificar-servico-freelancer"
                className="font-semibold text-sky-700 hover:underline"
              >
                como precificar serviço freelancer
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
