import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Sobre | Resolva Jato',
  description: 'O que é o Resolva Jato e quem opera a plataforma.'
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
      <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-slate-950">Press kit</h2>
        <p className="mt-3">
          <strong>Descrição curta:</strong> Resolva Jato é uma plataforma brasileira de ferramentas
          online para criar documentos, organizar cobranças e resolver tarefas práticas de trabalho
          e estudos.
        </p>
        <p className="mt-3">
          <strong>Descrição editorial:</strong> O Resolva Jato ajuda MEIs, freelancers, estudantes e
          pequenos negócios a criar currículos, recibos, contratos, propostas, orçamentos com Pix e
          outros documentos em fluxos simples e acessíveis.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/favicon.svg" className="font-semibold text-sky-700 hover:text-sky-800">
            Baixar símbolo em SVG
          </Link>
          <Link href="/opengraph-image" className="font-semibold text-sky-700 hover:text-sky-800">
            Imagem institucional
          </Link>
          <Link href="/contato" className="font-semibold text-sky-700 hover:text-sky-800">
            Contato de imprensa
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
