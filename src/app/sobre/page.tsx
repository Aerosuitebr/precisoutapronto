import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/marketing/legal-page';
import { BRAND_DESCRIPTION, BRAND_EDITORIAL_DESCRIPTION } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Sobre',
  description: BRAND_DESCRIPTION,
  alternates: { canonical: '/sobre' },
  openGraph: {
    title: 'Sobre | Precisou, Tá Pronto',
    description: BRAND_DESCRIPTION,
    url: '/sobre'
  }
};

export default function SobrePage() {
  return (
    <LegalPage title="Sobre o Precisou, Tá Pronto" subtitle="Do orçamento no WhatsApp ao recibo do serviço">
      <p>
        {BRAND_DESCRIPTION}
      </p>
      <p>
        A plataforma é desenvolvida e operada pela <strong>Aerosuite</strong>. Não pedimos cartão
        para começar.
      </p>
      <section className="mt-10 rounded-3xl border border-sky-100 bg-sky-50 p-6">
        <h2 className="text-xl font-bold text-slate-950">Como produzimos nossos conteúdos</h2>
        <p className="mt-3">
          Os guias são escritos para responder primeiro à dúvida prática do leitor e revisados pela
          equipe Precisou, Tá Pronto antes da publicação. Em temas jurídicos, trabalhistas, tributários ou
          contábeis, indicamos os limites da ferramenta e recomendamos validação com um profissional
          habilitado quando a situação exigir análise individual.
        </p>
        <p className="mt-3">
          Corrigimos conteúdos quando regras, fontes ou funcionalidades mudam. Sugestões e pedidos de
          correção podem ser enviados pela página de contato.
        </p>
      </section>
      <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-slate-950">Press kit</h2>
        <p className="mt-3">
          <strong>Descrição curta:</strong> {BRAND_DESCRIPTION}
        </p>
        <p className="mt-3">
          <strong>Descrição editorial:</strong> {BRAND_EDITORIAL_DESCRIPTION}
        </p>
        <p className="mt-3">
          <strong>Como citar:</strong> Precisou, Tá Pronto. Ferramentas online grátis.
          Disponível em: https://precisoutapronto.com.br. Acesso em: data da consulta.
        </p>
        <p className="mt-3">
          <strong>Fatos citáveis:</strong> operação pela Aerosuite; domínio canônico
          precisoutapronto.com.br; ferramentas usáveis no navegador; orçamento e recibo sem cadastro;
          conta grátis para histórico; contato de imprensa em contato@precisoutapronto.com.br.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/criterios-editoriais" className="font-semibold text-sky-700 hover:text-sky-800">
            Critérios editoriais
          </Link>
          <Link href="/politica-de-correcoes" className="font-semibold text-sky-700 hover:text-sky-800">
            Política de correções
          </Link>
          <Link href="/metodologia-calculadoras" className="font-semibold text-sky-700 hover:text-sky-800">
            Metodologia das calculadoras
          </Link>
          <Link href="/favicon.svg" className="font-semibold text-sky-700 hover:text-sky-800">
            Baixar símbolo em SVG
          </Link>
          <Link href="/opengraph-image" className="font-semibold text-sky-700 hover:text-sky-800">
            Imagem institucional
          </Link>
          <Link href="/embed" className="font-semibold text-sky-700 hover:text-sky-800">
            Badges e embeds
          </Link>
          <Link href="/imprensa" className="font-semibold text-sky-700 hover:text-sky-800">
            Contato de imprensa
          </Link>
          <Link href="/recursos" className="font-semibold text-sky-700 hover:text-sky-800">
            Catálogo público
          </Link>
          <Link href="/checklist-cobranca-mei" className="font-semibold text-sky-700 hover:text-sky-800">
            Checklist MEI
          </Link>
        </div>
      </section>
      <p>
        <Link href="/contato" className="font-semibold text-sky-700 hover:text-sky-800">
          Fale conosco
        </Link>
        {' · '}
        <Link href="/privacidade" className="font-semibold text-sky-700 hover:text-sky-800">
          Privacidade
        </Link>
        {' · '}
        <Link href="/termos" className="font-semibold text-sky-700 hover:text-sky-800">
          Termos
        </Link>
      </p>
    </LegalPage>
  );
}
