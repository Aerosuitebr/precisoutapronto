import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/marketing/seo-landing-page';
import type { SeoLandingContent } from '@/lib/seo/landing-content';

const content: SeoLandingContent = {
  id: 'proposta-comercial-mei', path: '/proposta-comercial-mei', toolHref: '/gerador-de-proposta-comercial',
  eyebrow: 'Proposta comercial para MEI', title: 'Apresente seu serviço com uma proposta comercial profissional',
  description: 'Organize solução, escopo, prazo, investimento e próximo passo em um PDF fácil de aprovar.',
  heroBullets: ['Escopo e investimento claros', 'Identidade visual', 'PDF pronto para o WhatsApp'],
  primaryCta: 'Criar proposta comercial',
  secondaryCta: { label: 'Ler o guia completo', href: '/guias/proposta-comercial-para-mei' },
  sections: [
    { title: 'Resposta direta', body: 'Uma proposta comercial para MEI deve mostrar o problema entendido, a solução, as entregas, o prazo, o investimento, a validade e como o cliente pode aprovar.' },
    { title: 'Ajude o cliente a decidir', body: 'Use títulos claros, poucos blocos e um próximo passo único. A proposta deve reduzir dúvidas, não criar novas.', bullets: ['Contexto do cliente', 'Entregas verificáveis', 'Preço e condições', 'Validade e aceite'] }
  ],
  faqs: [
    { q: 'Proposta substitui contrato?', a: 'Ela registra a oferta, mas um contrato pode ser necessário para detalhar responsabilidades e riscos.' },
    { q: 'Posso colocar minha marca?', a: 'Sim. A ferramenta permite organizar uma apresentação com identidade profissional.' }
  ],
  related: [
    { href: '/gerador-de-proposta-comercial', label: 'Gerador de proposta', blurb: 'Veja modelos e exemplos' },
    { href: '/gerador-de-contrato', label: 'Contrato de serviços', blurb: 'Formalize depois do aceite' }
  ]
};
export const metadata: Metadata = {
  title: 'Proposta comercial para MEI: modelo em PDF',
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
