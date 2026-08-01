import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/marketing/seo-landing-page';
import type { SeoLandingContent } from '@/lib/seo/landing-content';

const content: SeoLandingContent = {
  id: 'recibo-de-aluguel',
  path: '/recibo-de-aluguel',
  toolHref: '/gerador-de-recibo',
  eyebrow: 'Recibo de aluguel',
  title: 'Emita um recibo de aluguel claro em PDF',
  description:
    'Registre locador, locatário, imóvel, competência, valor e forma de pagamento. Gere um recibo organizado para guardar ou enviar.',
  heroBullets: [
    'Valor por extenso automático',
    'Pronto para WhatsApp ou impressão',
    'Modelo limpo para locação residencial ou comercial'
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
  title: 'Recibo de aluguel online grátis em PDF',
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
