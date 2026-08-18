import type { Metadata } from 'next';
import { RentalReceiptLanding } from '@/components/marketing/rental-receipt-landing';
import type { SeoLandingContent } from '@/lib/seo/landing-content';

const content: SeoLandingContent = {
  id: 'recibo-de-aluguel',
  path: '/recibo-de-aluguel',
  toolHref: '/gerador-de-recibo?modelo=aluguel-residencial',
  eyebrow: 'Recibo de aluguel',
  title: 'Recibo de Aluguel Grátis para Imprimir e Baixar em PDF',
  description: 'Faça seu recibo de aluguel online grátis para casa, apartamento ou imóvel comercial. Preencha os dados, baixe em PDF e imprima.',
  heroBullets: ['Valor por extenso automático', 'Modelo em PDF pronto para imprimir', 'Para aluguel residencial ou comercial'],
  primaryCta: 'Gerar recibo de aluguel',
  secondaryCta: { label: 'Ver contrato de aluguel', href: '/contrato-de-aluguel' },
  sections: [
    { title: 'Resposta direta', body: 'Um recibo de aluguel comprova quem pagou, quem recebeu, qual imóvel, qual mês de referência, qual valor e qual forma de pagamento.' },
    { title: 'O que não pode faltar', body: 'Descreva o imóvel e a competência com precisão. Revise nomes, CPF/CNPJ, datas e valores antes de exportar.', bullets: ['Locador e locatário identificados', 'Endereço ou identificação do imóvel', 'Mês/competência e valor pago', 'Forma de pagamento e data'] },
    { title: 'Modelo de recibo de aluguel para imprimir', body: 'Preencha os dados online e gere um PDF organizado para imprimir, assinar ou enviar pelo WhatsApp.' },
    { title: 'Recibo de aluguel de casa ou apartamento', body: 'Use o endereço para identificar o imóvel e informe o mês de referência, o valor e quem recebeu.' },
    { title: 'Recibo de aluguel pago via Pix', body: 'Marque Pix como forma de pagamento e descreva a competência quitada. O comprovante bancário registra a transferência; o recibo relaciona o valor ao aluguel.' }
  ],
  faqs: [
    { q: 'Recibo de aluguel substitui contrato?', a: 'Não. O recibo comprova o pagamento de uma competência. O contrato define regras da locação.' },
    { q: 'Recibo de aluguel precisa de assinatura?', a: 'A assinatura do locador ou recebedor reforça a identificação de quem declara o recebimento. Guarde também o comprovante da forma de pagamento.' },
    { q: 'Recibo de aluguel tem validade?', a: 'O recibo registra o pagamento descrito, desde que identifique partes, imóvel, competência, valor, data e recebedor. Casos específicos devem ser avaliados por profissional habilitado.' },
    { q: 'Posso emitir recibo de aluguel pago via Pix?', a: 'Sim. Informe Pix como forma de pagamento e descreva o mês quitado.' },
    { q: 'Posso incluir caução no recibo?', a: 'Sim. Use a referência para indicar claramente que o valor corresponde à caução, sem confundir com o aluguel mensal.' },
    { q: 'Serve para aluguel comercial?', a: 'Sim. Use razão social e CNPJ quando aplicável, identifique a sala ou imóvel comercial e descreva a competência paga.' },
    { q: 'Como fazer um recibo de aluguel simples para imprimir?', a: 'Informe locador, inquilino, imóvel, mês de referência, valor, data e forma de pagamento. Depois gere o PDF para imprimir e assinar.' },
    { q: 'O modelo serve para recibo de aluguel de casa?', a: 'Sim. Identifique o endereço da casa, o período pago e as partes envolvidas antes de baixar o recibo em PDF.' },
    { q: 'Preciso de cadastro?', a: 'Para gerar e baixar o PDF no gerador, use a conta gratuita do Resolva Jato.' }
  ],
  related: [
    { href: '/gerador-de-recibo', label: 'Gerador de recibo', blurb: 'Outros modelos de recibo' },
    { href: '/contrato-de-aluguel', label: 'Contrato de aluguel', blurb: 'Organize a locação antes de cobrar' },
    { href: '/recibo-de-pagamento', label: 'Recibo de pagamento', blurb: 'Recibo genérico de valores' },
    { href: '/recibos/recibo-pagamento-pix', label: 'Recibo de pagamento Pix', blurb: 'Explique a finalidade do Pix recebido' },
    { href: '/recibos/modelo-de-recibo-simples', label: 'Modelo de recibo simples', blurb: 'Preencha e baixe um modelo em PDF' }
  ]
};

export const metadata: Metadata = {
  title: { absolute: 'Recibo de Aluguel Grátis para Imprimir e Baixar PDF | Resolva Jato' },
  description: content.description,
  alternates: { canonical: content.path },
  openGraph: { title: content.title, description: content.description, url: content.path, images: [{ url: `${content.path}/opengraph-image` }] },
  twitter: { card: 'summary_large_image', title: content.title, description: content.description, images: [`${content.path}/opengraph-image`] }
};

export default function Page() {
  return <RentalReceiptLanding content={content} />;
}
