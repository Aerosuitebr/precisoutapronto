import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/marketing/seo-landing-page';
import type { SeoLandingContent } from '@/lib/seo/landing-content';

const content: SeoLandingContent = {
  id: 'contrato-de-aluguel', path: '/contrato-de-aluguel', toolHref: '/gerador-de-contrato',
  eyebrow: 'Contrato de aluguel', title: 'Crie um contrato de aluguel claro e pronto para revisar',
  description: 'Organize dados do imóvel, prazo, aluguel, garantia, reajuste e responsabilidades em uma estrutura fácil de entender.',
  heroBullets: ['Modelo editável', 'Cláusulas organizadas', 'PDF pronto para revisar e assinar'],
  primaryCta: 'Criar contrato de aluguel',
  secondaryCta: { label: 'Entender contratos', href: '/guias/contrato-de-prestacao-de-servicos-gratis' },
  sections: [
    { title: 'Resposta direta', body: 'Um contrato de aluguel deve identificar as partes e o imóvel, definir prazo, valor, vencimento, reajuste, garantia, encargos, vistoria e regras de encerramento.' },
    { title: 'Clareza antes da assinatura', body: 'Revise datas, responsabilidades de manutenção e condições de devolução. Para situações específicas, obtenha orientação jurídica.', bullets: ['Identificação completa do imóvel', 'Valor e vencimento', 'Garantia e reajuste', 'Vistoria e devolução'] }
  ],
  faqs: [
    { q: 'Precisa reconhecer firma?', a: 'A necessidade varia conforme o caso e o nível de segurança desejado. Verifique as exigências aplicáveis.' },
    { q: 'O modelo substitui advogado?', a: 'Não. Ele organiza informações e cláusulas usuais; casos complexos exigem revisão profissional.' }
  ],
  related: [
    { href: '/gerador-de-contrato', label: 'Gerador de contratos', blurb: 'Veja outros modelos' },
    { href: '/guias', label: 'Guias', blurb: 'Conteúdo para revisar com segurança' }
  ]
};

export const metadata: Metadata = {
  title: 'Contrato de aluguel online: modelo editável',
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
export default function Page() { return <SeoLandingPage content={content} />; }
