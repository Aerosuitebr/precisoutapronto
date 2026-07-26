import type { Metadata } from 'next';
import Link from 'next/link';
import { RescisaoApp } from '@/components/rescisao/rescisao-app';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';

export const metadata: Metadata = {
  title: 'Calculadora de rescisão trabalhista grátis',
  description:
    'Calcule uma estimativa de saldo de salário, férias, 13º, aviso-prévio e FGTS sem cadastro.',
  alternates: { canonical: '/calculadora-de-rescisao' },
  openGraph: {
    title: 'Calculadora de rescisão grátis | Resolva Jato',
    description: 'Faça uma estimativa educativa das principais verbas rescisórias.',
    url: '/calculadora-de-rescisao'
  }
};

export default function CalculadoraDeRescisaoPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[image:var(--rj-page-bg)]">
        <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
          <RescisaoApp publicAccess />
          <section className="mx-auto mt-10 max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-950">Como interpretar a estimativa</h2>
            <p className="mt-4 leading-7 text-slate-600">
              O resultado organiza as verbas mais frequentes conforme os dados informados. A modalidade
              de desligamento, convenções coletivas, médias salariais e descontos podem alterar o valor final.
              Use a simulação como conferência inicial, não como homologação.
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              Consulte também o nosso{' '}
              <Link href="/guias/como-calcular-rescisao" className="font-semibold text-sky-700 hover:underline">
                guia de cálculo de rescisão
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
