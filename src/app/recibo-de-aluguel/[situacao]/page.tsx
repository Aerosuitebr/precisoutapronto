import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';

const situations = {
  residencial: {
    name: 'residencial',
    title: 'Recibo de aluguel residencial online grátis',
    description: 'Gere um recibo de aluguel de casa ou apartamento com imóvel, competência, locador, inquilino e valor em PDF.',
    model: 'aluguel-residencial',
    fields: ['Endereço completo do imóvel', 'Mês ou competência paga', 'Locador e inquilino identificados', 'Valor, data e forma de pagamento']
  },
  comercial: {
    name: 'comercial',
    title: 'Recibo de aluguel comercial em PDF',
    description: 'Crie um recibo para sala, loja ou imóvel comercial com razão social, CNPJ, unidade, competência e forma de pagamento.',
    model: 'aluguel-comercial',
    fields: ['Razão social e CNPJ quando aplicável', 'Sala, loja ou unidade identificada', 'Competência e encargos descritos', 'PDF compacto para arquivo contábil']
  },
  pix: {
    name: 'pago por Pix',
    title: 'Recibo de aluguel pago por Pix',
    description: 'Registre o aluguel recebido por Pix em um recibo completo, pronto para baixar, assinar e enviar ao inquilino.',
    model: 'aluguel-pix',
    fields: ['Pix já selecionado como pagamento', 'Competência do aluguel', 'Identificação das partes e do imóvel', 'Observação para guardar o comprovante']
  }
} as const;

type SituationKey = keyof typeof situations;

export function generateStaticParams() {
  return Object.keys(situations).map((situacao) => ({ situacao }));
}

export async function generateMetadata({ params }: { params: Promise<{ situacao: string }> }): Promise<Metadata> {
  const { situacao } = await params;
  const page = situations[situacao as SituationKey];
  if (!page) return {};
  const path = `/recibo-de-aluguel/${situacao}`;
  return { title: `${page.title} | Resolva Jato`, description: page.description, alternates: { canonical: path }, openGraph: { title: page.title, description: page.description, url: path } };
}

export default async function RentalReceiptSituationPage({ params }: { params: Promise<{ situacao: string }> }) {
  const { situacao } = await params;
  const page = situations[situacao as SituationKey];
  if (!page) notFound();
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[linear-gradient(145deg,#020617,#0f172a_50%,#064e3b)] text-white">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Modelo adaptado</p>
            <h1 className="rj-display mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">{page.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">{page.description}</p>
            <Link href={`/gerador-de-recibo?modelo=${page.model}`} className="mt-7 inline-flex h-12 items-center rounded-xl bg-amber-400 px-6 font-bold text-slate-950 hover:bg-amber-300">Criar meu recibo agora</Link>
            <p className="mt-3 text-sm text-emerald-100">Grátis para começar · sem cadastro · PDF pronto para imprimir</p>
          </div>
        </section>
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
            <h2 className="rj-display text-3xl font-extrabold text-slate-950">O modelo {page.name} já prepara</h2>
            <ul className="mt-7 grid gap-4 sm:grid-cols-2">{page.fields.map((field) => <li key={field} className="flex gap-3 rounded-2xl border border-slate-200 p-5 text-sm font-semibold text-slate-700"><Check className="h-5 w-5 shrink-0 text-emerald-600" />{field}</li>)}</ul>
            <div className="mt-10 rounded-2xl bg-emerald-50 p-6"><h2 className="text-xl font-bold text-emerald-950">Não é só um texto diferente</h2><p className="mt-2 text-sm leading-7 text-emerald-900">Ao abrir o gerador, o título, a referência, o modelo visual, a forma de pagamento e as observações apropriadas já entram no documento. Você completa os dados reais e revisa antes de baixar.</p></div>
            <p className="mt-8 text-sm text-slate-600">Veja também o <Link href="/recibo-de-aluguel" className="font-bold text-emerald-700 hover:underline">guia completo de recibo de aluguel</Link>.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
