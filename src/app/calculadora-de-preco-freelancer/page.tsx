import type { Metadata } from 'next';
import Link from 'next/link';
import { PrecificacaoApp } from '@/components/precificacao/precificacao-app';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { CalculatorJsonLd, PUBLIC_CALCULATORS } from '@/lib/seo/public-calculators';

const seo = PUBLIC_CALCULATORS.precificacao;

export const metadata: Metadata = {
  title: 'Calculadora de preço para freelancer grátis',
  description: seo.description,
  alternates: { canonical: seo.path },
  openGraph: {
    title: 'Calculadora de preço para freelancer | Resolva Jato',
    description: 'Descubra quanto cobrar considerando custos, tempo, impostos e margem.',
    url: seo.path,
    images: [{ url: `${seo.path}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de preço para freelancer | Resolva Jato',
    description: 'Descubra quanto cobrar considerando custos, tempo, impostos e margem.',
    images: [`${seo.path}/opengraph-image`]
  }
};

export default function CalculadoraDePrecoFreelancerPage() {
  return (
    <>
      <CalculatorJsonLd calculator={seo} />
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
          <section className="mx-auto mt-6 max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-950">Perguntas frequentes</h2>
            <div className="mt-5 divide-y divide-slate-200">
              {seo.faq.map((item) => (
                <div key={item.question} className="py-4">
                  <h3 className="font-bold text-slate-900">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
