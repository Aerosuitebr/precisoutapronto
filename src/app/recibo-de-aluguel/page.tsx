import type { Metadata } from 'next';
import Link from 'next/link';
import { SeoLandingPage } from '@/components/marketing/seo-landing-page';
import type { SeoLandingContent } from '@/lib/seo/landing-content';

const content: SeoLandingContent = {
  id: 'recibo-de-aluguel',
  path: '/recibo-de-aluguel',
  toolHref: '/gerador-de-recibo?modelo=aluguel-residencial',
  eyebrow: 'Recibo de aluguel',
  title: 'Recibo de Aluguel Online Grátis: Gere PDF e Imprima',
  description:
    'Crie um recibo de aluguel completo em poucos minutos. Preencha locador, inquilino, imóvel e valor; baixe o PDF pronto para imprimir ou enviar.',
  heroBullets: [
    'Valor por extenso automático',
    'Modelo em PDF pronto para imprimir',
    'Para aluguel residencial ou comercial'
  ],
  primaryCta: 'Gerar recibo de aluguel',
  secondaryCta: { label: 'Ver contrato de aluguel', href: '/contrato-de-aluguel' },
  sections: [
    {
      title: 'Resposta direta',
      body: 'Um recibo de aluguel comprova quem pagou, quem recebeu, qual imóvel, qual mês de referência, qual valor e qual forma de pagamento.'
    },
    {
      title: 'O que não pode faltar',
      body: 'Descreva o imóvel e a competência com precisão. Revise nomes, CPF/CNPJ, datas e valores antes de exportar.',
      bullets: [
        'Locador e locatário identificados',
        'Endereço ou identificação do imóvel',
        'Mês/competência e valor pago',
        'Forma de pagamento e data'
      ]
    },
    {
      title: 'Modelo de recibo de aluguel para imprimir',
      body: 'Preencha os dados online e gere um PDF organizado para imprimir, assinar ou enviar pelo WhatsApp. O mesmo modelo atende aluguel de casa, apartamento, sala comercial e outros imóveis.'
    }
  ],
  faqs: [
    {
      q: 'Recibo de aluguel substitui contrato?',
      a: 'Não. O recibo comprova o pagamento de uma competência. O contrato define regras da locação.'
    },
    {
      q: 'Recibo de aluguel precisa de assinatura?',
      a: 'A assinatura do locador ou recebedor reforça a identificação de quem declara o recebimento. Guarde também o comprovante da forma de pagamento.'
    },
    {
      q: 'Recibo de aluguel tem validade?',
      a: 'O recibo registra o pagamento descrito, desde que identifique partes, imóvel, competência, valor, data e recebedor. Casos específicos devem ser avaliados por profissional habilitado.'
    },
    {
      q: 'Posso emitir recibo de aluguel pago via Pix?',
      a: 'Sim. Informe Pix como forma de pagamento e descreva o mês quitado.'
    },
    {
      q: 'Posso incluir caução no recibo?',
      a: 'Sim. Use a referência para indicar claramente que o valor corresponde à caução, sem confundir com o aluguel mensal.'
    },
    {
      q: 'Serve para aluguel comercial?',
      a: 'Sim. Use razão social e CNPJ quando aplicável, identifique a sala ou imóvel comercial e descreva a competência paga.'
    },
    {
      q: 'Como fazer um recibo de aluguel simples para imprimir?',
      a: 'Informe locador, inquilino, imóvel, mês de referência, valor, data e forma de pagamento. Depois gere o PDF para imprimir e assinar.'
    },
    {
      q: 'O modelo serve para recibo de aluguel de casa?',
      a: 'Sim. Identifique o endereço da casa, o período pago e as partes envolvidas antes de baixar o recibo em PDF.'
    },
    {
      q: 'Preciso de cadastro?',
      a: 'Para gerar e baixar o PDF no gerador, use a conta gratuita do Resolva Jato.'
    }
  ],
  related: [
    { href: '/gerador-de-recibo', label: 'Gerador de recibo', blurb: 'Outros modelos de recibo' },
    { href: '/contrato-de-aluguel', label: 'Contrato de aluguel', blurb: 'Organize a locação antes de cobrar' },
    { href: '/recibo-de-pagamento', label: 'Recibo de pagamento', blurb: 'Recibo genérico de valores' }
  ]
};

export const metadata: Metadata = {
  title: { absolute: 'Recibo de Aluguel Online Grátis: Gere PDF e Imprima | Resolva Jato' },
  description: content.description,
  alternates: { canonical: content.path },
  openGraph: {
    title: content.title,
    description: content.description,
    url: content.path,
    images: [{ url: `${content.path}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: content.title,
    description: content.description,
    images: [`${content.path}/opengraph-image`]
  }
};

export default function Page() {
  return (
    <SeoLandingPage
      content={content}
      demo={
        <section className="border-b border-slate-200 bg-emerald-50/60">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Exemplo preenchido</p>
              <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-950">Veja o PDF antes de criar o seu</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">O modelo organiza locador, inquilino, imóvel, competência e pagamento em uma página pronta para imprimir, assinar ou enviar pelo WhatsApp.</p>
              <Link href="/gerador-de-recibo?modelo=aluguel-residencial" className="mt-6 inline-flex h-12 items-center rounded-xl bg-amber-400 px-6 font-bold text-slate-950 hover:bg-amber-300">Criar meu recibo agora</Link>
              <p className="mt-3 text-sm font-semibold text-emerald-900">Grátis para começar · sem cadastro · PDF pronto para imprimir</p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-200/70 p-4 shadow-xl shadow-slate-900/10 sm:p-7" aria-label="Imagem de exemplo do recibo de aluguel">
              <article className="mx-auto aspect-[1/1.414] max-w-[520px] bg-white p-7 text-slate-800 shadow-sm sm:p-10">
                <div className="border-b-4 border-emerald-700 pb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Recibo de aluguel</p>
                  <div className="mt-3 flex items-end justify-between gap-4"><h3 className="text-2xl font-black">RECIBO Nº 2026-008</h3><strong className="text-xl text-emerald-700">R$ 1.850,00</strong></div>
                </div>
                <p className="mt-7 text-sm leading-7">Recebi de <strong>Mariana Souza</strong> a quantia de <strong>mil oitocentos e cinquenta reais</strong>, referente ao aluguel residencial do imóvel situado na Rua das Palmeiras, 120, competência agosto de 2026.</p>
                <dl className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase text-slate-500">Locador</dt><dd className="mt-1 font-semibold">Carlos Almeida</dd></div><div><dt className="text-xs font-bold uppercase text-slate-500">Inquilina</dt><dd className="mt-1 font-semibold">Mariana Souza</dd></div><div><dt className="text-xs font-bold uppercase text-slate-500">Forma de pagamento</dt><dd className="mt-1 font-semibold">Pix</dd></div><div><dt className="text-xs font-bold uppercase text-slate-500">Data</dt><dd className="mt-1 font-semibold">10/08/2026</dd></div></dl>
                <div className="mt-12 border-t border-slate-400 pt-2 text-center text-xs">Carlos Almeida · Locador / recebedor</div>
                <p className="mt-8 text-center text-[10px] text-slate-400">Exemplo ilustrativo · Resolva Jato</p>
              </article>
            </div>
          </div>
        </section>
      }
    />
  );
}
