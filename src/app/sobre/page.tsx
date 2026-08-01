import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Conheça o Resolva Jato, nossa proposta, a equipe responsável e como criamos ferramentas práticas para documentos e negócios.',
  alternates: { canonical: '/sobre' },
  openGraph: {
    title: 'Sobre | Resolva Jato',
    description: 'Conheça o Resolva Jato, nossa proposta, a equipe responsável e como criamos ferramentas práticas para documentos e negócios.',
    url: '/sobre'
  }
};

export default function SobrePage() {
  return (
    <LegalPage title="Sobre o Resolva Jato" subtitle="Ferramentas práticas, sem burocracia">
      <p>
        O <strong>Resolva Jato</strong> (resolvajato.com.br) reúne ferramentas para autônomos,
        estudantes e pequenos negócios: currículos, recibos, contratos, propostas e mais, com uso
        gratuito e confirmação de e-mail.
      </p>
      <p>
        A plataforma é desenvolvida e operada pela <strong>Aerosuite</strong>. Não pedimos cartão
        para começar.
      </p>
      <section className="mt-10 rounded-3xl border border-sky-100 bg-sky-50 p-6">
        <h2 className="text-xl font-bold text-slate-950">Como produzimos nossos conteúdos</h2>
        <p className="mt-3">
          Os guias são escritos para responder primeiro à dúvida prática do leitor e revisados pela
          equipe Resolva Jato antes da publicação. Em temas jurídicos, trabalhistas, tributários ou
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
          <strong>Descrição curta:</strong> Resolva Jato é uma plataforma brasileira de ferramentas
          online para criar documentos, organizar cobranças e resolver tarefas práticas de trabalho
          e estudos.
        </p>
        <p className="mt-3">
          <strong>Descrição editorial:</strong> O Resolva Jato ajuda MEIs, freelancers, estudantes e
          pequenos negócios a criar currículos, recibos, contratos, propostas, orçamentos com Pix,
          corrigir redação ENEM, editar PDF e montar referências ABNT em fluxos simples no navegador.
        </p>
        <p className="mt-3">
          <strong>Como citar:</strong> Resolva Jato. Ferramentas online grátis.
          Disponível em: https://resolvajato.com.br. Acesso em: data da consulta.
        </p>
        <p className="mt-3">
          <strong>Fatos citáveis:</strong> operação pela Aerosuite; domínio canônico
          resolvajato.com.br; ferramentas usáveis no navegador; duas gerações livres antes do
          cadastro; contato de imprensa em contato@resolvajato.com.br.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
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
