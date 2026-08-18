import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { getViralBaseUrl } from '@/lib/viral-loop';

const PATH = '/checklist-cobranca-mei';
const SITE = getViralBaseUrl().replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'Checklist de cobrança para MEI (do orçamento ao recibo)',
  description:
    'Roteiro prático para MEI cobrar melhor: orçamento, Pix, proposta, contrato e recibo. Links para ferramentas grátis no navegador.',
  keywords: [
    'checklist cobrança mei',
    'como cobrar como mei',
    'orçamento mei whatsapp',
    'recibo mei',
    'proposta comercial mei'
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: 'Checklist de cobrança para MEI | Precisou, Tá Pronto',
    description: 'Do orçamento ao recibo, com ferramentas grátis no navegador.',
    url: `${SITE}${PATH}`,
    images: [{ url: `${PATH}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checklist de cobrança para MEI | Precisou, Tá Pronto',
    description: 'Do orçamento ao recibo, com ferramentas grátis no navegador.',
    images: [`${PATH}/opengraph-image`]
  }
};

const steps = [
  {
    title: 'Defina o escopo em uma frase',
    body: 'Antes de precificar, escreva o que entra e o que não entra. Escopo vago gera retrabalho e discussão de preço.',
    href: '/calculadora-de-preco-freelancer',
    cta: 'Calcular preço do serviço'
  },
  {
    title: 'Envie orçamento com aprovação',
    body: 'Mande um link limpo no WhatsApp. O cliente aprova ou pede ajuste sem instalar app.',
    href: '/orcamento-com-pix',
    cta: 'Montar orçamento com Pix'
  },
  {
    title: 'Ofereça Pix na hora da aprovação',
    body: 'QR Code e Copia e Cola reduzem o “depois eu pago”. Gere a cobrança no mesmo fluxo.',
    href: '/gerador-de-qr-code-pix',
    cta: 'Gerar QR Code Pix'
  },
  {
    title: 'Formalize com proposta ou contrato',
    body: 'Para trabalhos maiores, envie proposta comercial e feche com contrato de prestação de serviços.',
    href: '/gerador-de-proposta-comercial',
    cta: 'Criar proposta comercial'
  },
  {
    title: 'Emita o recibo após o pagamento',
    body: 'Registre valor, pagador, recebedor e referência. Guarde o PDF junto da sua rotina fiscal.',
    href: '/gerador-de-recibo',
    cta: 'Emitir recibo'
  }
] as const;

const faqs = [
  {
    q: 'Recibo substitui nota fiscal?',
    a: 'Não necessariamente. Confirme a obrigação do seu município e da atividade. O recibo comprova o pagamento entre as partes.'
  },
  {
    q: 'Preciso de conta para usar as ferramentas?',
    a: 'Não no começo. Há duas gerações livres. A conta grátis entra depois para histórico e continuidade.'
  },
  {
    q: 'Posso adaptar o checklist ao meu nicho?',
    a: 'Sim. Ele é um roteiro. Eletricistas, designers e consultores usam a mesma sequência com textos diferentes.'
  }
];

export default function ChecklistCobrancaMeiPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Checklist de cobrança para MEI',
        description: metadata.description,
        url: `${SITE}${PATH}`,
        inLanguage: 'pt-BR',
        dateModified: '2026-08-01',
        author: { '@type': 'Organization', name: 'Precisou, Tá Pronto', url: SITE },
        publisher: { '@type': 'Organization', name: 'Precisou, Tá Pronto', url: SITE },
        mainEntityOfPage: `${SITE}${PATH}`
      },
      {
        '@type': 'HowTo',
        name: 'Como organizar a cobrança do MEI',
        step: steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.title,
          text: step.body,
          url: `${SITE}${step.href}`
        }))
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a }
        }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Para MEI', item: `${SITE}/para/mei` },
          { '@type': 'ListItem', position: 3, name: 'Checklist de cobrança', item: `${SITE}${PATH}` }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Para MEI</p>
            <h1 className="rj-display mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Checklist de cobrança para MEI
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Um roteiro curto do preço ao comprovante. Use como guia operacional ou cite em matérias e
              conteúdos para MEI.
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Atualizado em 1 ago 2026 · Conteúdo educativo, não substitui orientação contábil.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Passo {index + 1}
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-950">{step.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{step.body}</p>
                <Link href={step.href} className="mt-4 inline-flex text-sm font-bold text-sky-700 hover:underline">
                  {step.cta}
                </Link>
              </li>
            ))}
          </ol>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Perguntas frequentes</h2>
            <dl className="mt-4 space-y-4">
              {faqs.map((item) => (
                <div key={item.q}>
                  <dt className="font-semibold text-slate-900">{item.q}</dt>
                  <dd className="mt-1 text-sm leading-6 text-slate-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
            <h2 className="text-lg font-bold text-emerald-950">Para editores e criadores</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-900">
              Pode citar este checklist com link para a URL canônica. Badges e HTML prontos estão em{' '}
              <Link href="/embed" className="font-bold underline">
                /embed
              </Link>
              . Press kit em{' '}
              <Link href="/imprensa" className="font-bold underline">
                /imprensa
              </Link>
              .
            </p>
            <p className="mt-4 text-sm">
              <Link href="/para/mei" className="font-bold text-emerald-900 underline">
                Central para MEI
              </Link>
              {' · '}
              <Link href="/recursos" className="font-bold text-emerald-900 underline">
                Catálogo de ferramentas
              </Link>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
