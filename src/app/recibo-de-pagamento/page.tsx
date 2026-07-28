import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/marketing/seo-landing-page';
import type { SeoLandingContent } from '@/lib/seo/landing-content';

const content: SeoLandingContent = {
  id: 'recibo-de-pagamento', path: '/recibo-de-pagamento', toolHref: '/gerador-de-recibo',
  eyebrow: 'Recibo de pagamento', title: 'Emita um recibo de pagamento profissional em PDF',
  description: 'Informe pagador, recebedor, valor e motivo. Gere um recibo organizado com valor por extenso.',
  heroBullets: ['Valor por extenso automático', 'Modelos limpos', 'PDF para enviar ou imprimir'],
  primaryCta: 'Gerar recibo de pagamento',
  secondaryCta: { label: 'Ver guia para MEI', href: '/guias/modelo-de-recibo-mei' },
  sections: [
    { title: 'Resposta direta', body: 'Um recibo registra quem recebeu, quem pagou, qual valor, por qual motivo, em que data e por qual forma de pagamento.' },
    { title: 'Evite recibos genéricos', body: 'Descreva a operação quitada com precisão e revise nomes, datas e valores antes de exportar.', bullets: ['Pagador e recebedor', 'Valor e finalidade', 'Data e forma de pagamento', 'Assinatura quando aplicável'] }
  ],
  faqs: [
    { q: 'Posso emitir recibo de Pix?', a: 'Sim. Registre Pix como forma de pagamento e descreva a obrigação quitada.' },
    { q: 'Recibo substitui nota fiscal?', a: 'Não necessariamente. Confirme as obrigações fiscais da sua atividade.' }
  ],
  related: [
    { href: '/gerador-de-recibo', label: 'Gerador de recibo', blurb: 'Conheça todos os modelos' },
    { href: '/orcamento-com-pix', label: 'Orçamento com Pix', blurb: 'Organize antes de cobrar' }
  ]
};
export const metadata: Metadata = {
  title: 'Recibo de pagamento online grátis em PDF',
  description: content.description,
  alternates: {
    canonical: '/gerador-de-recibo',
    languages: {
      'pt-BR': '/gerador-de-recibo',
      en: '/en/tools/receipt',
      es: '/es/tools/receipt',
      'x-default': '/gerador-de-recibo'
    }
  },
  openGraph: { title: content.title, description: content.description, url: '/gerador-de-recibo' },
  twitter: { card: 'summary_large_image', title: content.title, description: content.description }
};
export default function Page() { return <SeoLandingPage content={content} />; }
