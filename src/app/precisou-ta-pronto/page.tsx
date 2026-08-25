import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/marketing/legal-page';
import {
  BRAND_DESCRIPTION,
  BRAND_DISPLAY_NAME,
  BRAND_NAME,
  BRAND_SITE,
  BRAND_TAGLINE
} from '@/lib/brand';

export const metadata: Metadata = {
  title: `${BRAND_DISPLAY_NAME} Site oficial de ferramentas online`,
  description: `${BRAND_NAME} é o site oficial de ferramentas para PDFs, imagens, documentos e cálculos. Conheça a marca, o domínio e nossos compromissos.`,
  alternates: { canonical: '/precisou-ta-pronto' },
  openGraph: {
    title: `${BRAND_DISPLAY_NAME} Site oficial`,
    description: BRAND_DESCRIPTION,
    url: '/precisou-ta-pronto',
    type: 'website'
  }
};

export default function OfficialBrandPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `${BRAND_DISPLAY_NAME} Site oficial`,
    url: `${BRAND_SITE}/precisou-ta-pronto`,
    description: BRAND_DESCRIPTION,
    about: { '@id': `${BRAND_SITE}/#organization` },
    isPartOf: { '@id': `${BRAND_SITE}/#website` },
    inLanguage: 'pt-BR'
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <LegalPage title={`${BRAND_DISPLAY_NAME} Site oficial`} subtitle={BRAND_TAGLINE}>
      <p><strong>{BRAND_DISPLAY_NAME}</strong> é uma plataforma brasileira de ferramentas online operada pela Aerosuite. Nosso único domínio oficial é <strong>precisoutapronto.com.br</strong>.</p>
      <p>Reunimos soluções para PDFs, imagens, documentos profissionais, cálculos, estudos e organização. Não somos uma empresa de cobrança de dívidas, construtora, desentupidora, escritório contábil ou marketplace de prestadores.</p>
      <section className="rounded-3xl border border-sky-100 bg-sky-50 p-6">
        <h2 className="text-xl font-bold text-slate-950">O que torna a experiência pronta</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><strong>Fluxos diretos:</strong> só as etapas necessárias para chegar ao resultado.</li>
          <li><strong>Qualidade verificável:</strong> ferramentas testadas com arquivos e cenários reais.</li>
          <li><strong>Privacidade:</strong> processamento local sempre que a tecnologia permitir.</li>
          <li><strong>Resultado útil:</strong> arquivos claros e prontos para baixar ou compartilhar.</li>
        </ul>
      </section>
      <h2>Como reconhecer a marca oficial</h2>
      <p>Confira o nome completo <strong>{BRAND_DISPLAY_NAME}</strong>, o domínio <strong>precisoutapronto.com.br</strong>, o símbolo de documento concluído e nossos links institucionais.</p>
      <h2>Ferramentas em destaque</h2>
      <p><Link href="/recursos" className="font-semibold text-sky-700 hover:underline">Catálogo público</Link>{' · '}<Link href="/editor-de-pdf-online" className="font-semibold text-sky-700 hover:underline">Ferramentas de PDF</Link>{' · '}<Link href="/comprimir-redimensionar-imagem" className="font-semibold text-sky-700 hover:underline">Ferramentas de imagem</Link>{' · '}<Link href="/orcamento-com-pix" className="font-semibold text-sky-700 hover:underline">Orçamento com Pix</Link></p>
      <h2>Transparência e responsabilidade</h2>
      <p>A plataforma identifica sua equipe responsável, documenta metodologias, publica limites de uso e mantém um canal de correções. Ferramentas não substituem aconselhamento jurídico, contábil, médico ou financeiro individualizado.</p>
      <p><Link href="/qualidade-e-seguranca" className="font-semibold text-sky-700 hover:underline">Qualidade e segurança</Link>{' · '}<Link href="/sobre" className="font-semibold text-sky-700 hover:underline">Sobre e equipe</Link>{' · '}<Link href="/contato" className="font-semibold text-sky-700 hover:underline">Contato oficial</Link></p>
    </LegalPage>
  </>;
}
