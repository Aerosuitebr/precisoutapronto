import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/marketing/legal-page';
import { BRAND_DESCRIPTION, BRAND_NAME, BRAND_SITE, BRAND_TAGLINE } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Resolva Jato: site oficial de ferramentas online',
  description: `${BRAND_NAME} é o site oficial de ferramentas para PDFs, imagens, documentos e cálculos. Conheça a marca, o domínio e nossos compromissos.`,
  alternates: { canonical: '/resolva-jato' },
  openGraph: {
    title: 'Resolva Jato — site oficial',
    description: BRAND_DESCRIPTION,
    url: '/resolva-jato',
    type: 'website'
  }
};

export default function ResolvaJatoOficialPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Resolva Jato — site oficial',
    url: `${BRAND_SITE}/resolva-jato`,
    description: BRAND_DESCRIPTION,
    about: { '@id': `${BRAND_SITE}/#organization` },
    isPartOf: { '@id': `${BRAND_SITE}/#website` },
    inLanguage: 'pt-BR'
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <LegalPage title="Resolva Jato: site oficial" subtitle={BRAND_TAGLINE}>
      <p><strong>Resolva Jato</strong> é uma plataforma brasileira de ferramentas online operada pela Aerosuite. Nosso domínio oficial é <strong>resolvajato.com.br</strong>.</p>
      <p>Reunimos soluções para PDFs, imagens, documentos profissionais, cálculos, estudos e organização. Não somos uma empresa de cobrança de dívidas, construtora, desentupidora, escritório contábil ou marketplace de prestadores.</p>
      <section className="rounded-3xl border border-sky-100 bg-sky-50 p-6">
        <h2 className="text-xl font-bold text-slate-950">O que torna a experiência Jato</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><strong>Modo Jato:</strong> fluxos diretos, sem etapas artificiais.</li>
          <li><strong>Qualidade Jato:</strong> ferramentas testadas com arquivos e cenários reais.</li>
          <li><strong>Privacidade Jato:</strong> processamento local sempre que a tecnologia permitir.</li>
          <li><strong>Resultado Jato:</strong> arquivos úteis, claros e prontos para baixar ou compartilhar.</li>
        </ul>
      </section>
      <h2>Como reconhecer a marca oficial</h2>
      <p>Confira o nome completo <strong>Resolva Jato</strong>, o domínio <strong>resolvajato.com.br</strong>, o símbolo azul da marca e os links institucionais de autoria, privacidade, critérios editoriais e qualidade.</p>
      <h2>Ferramentas em destaque</h2>
      <p><Link href="/recursos" className="font-semibold text-sky-700 hover:underline">Catálogo público</Link>{' · '}<Link href="/editor-de-pdf-online" className="font-semibold text-sky-700 hover:underline">Jato PDF</Link>{' · '}<Link href="/comprimir-redimensionar-imagem" className="font-semibold text-sky-700 hover:underline">Jato Imagem</Link>{' · '}<Link href="/orcamento-com-pix" className="font-semibold text-sky-700 hover:underline">Jato Negócios</Link></p>
      <h2>Transparência e responsabilidade</h2>
      <p>A plataforma identifica sua equipe responsável, documenta metodologias, publica limites de uso e mantém um canal de correções. Ferramentas não substituem aconselhamento jurídico, contábil, médico ou financeiro individualizado.</p>
      <p><Link href="/qualidade-e-seguranca" className="font-semibold text-sky-700 hover:underline">Conheça a Qualidade Jato</Link>{' · '}<Link href="/sobre" className="font-semibold text-sky-700 hover:underline">Sobre e equipe</Link>{' · '}<Link href="/contato" className="font-semibold text-sky-700 hover:underline">Contato oficial</Link></p>
    </LegalPage>
  </>;
}
