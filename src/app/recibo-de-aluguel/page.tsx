import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/marketing/seo-landing-page';
import type { SeoLandingContent } from '@/lib/seo/landing-content';

const content: SeoLandingContent = {
  id: 'recibo-de-aluguel',
  path: '/recibo-de-aluguel',
  toolHref: '/gerador-de-recibo',
  eyebrow: 'Recibo de aluguel',
  title: 'Recibo de aluguel grátis: faça online e baixe em PDF',
  description:
    'Crie seu recibo de aluguel online grátis. Preencha locador, inquilino, imóvel e valor, depois baixe o modelo em PDF para imprimir ou enviar.',
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
      q: 'Posso emitir recibo de aluguel pago via Pix?',
      a: 'Sim. Informe Pix como forma de pagamento e descreva o mês quitado.'
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
  title: { absolute: 'Recibo de Aluguel Grátis Online em PDF | Resolva Jato' },
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
  return <SeoLandingPage content={content} />;
}
