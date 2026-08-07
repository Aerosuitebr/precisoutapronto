import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Equipe editorial Resolva Jato',
  description: 'Conheça a equipe responsável pela pesquisa, redação, testes e manutenção dos guias do Resolva Jato.',
  alternates: { canonical: '/autores/equipe-resolva-jato' }
};

export default function EquipeResolvaJatoPage() {
  return (
    <LegalPage title="Equipe editorial Resolva Jato" subtitle="Pesquisa, exemplos e ferramentas testadas na prática">
      <p>A Equipe editorial Resolva Jato é o responsável coletivo pelos guias publicados na plataforma. O trabalho inclui pesquisar fontes oficiais, escrever respostas diretas, criar exemplos fictícios, testar as ferramentas relacionadas e revisar links e datas.</p>
      <h2>O que a revisão interna cobre</h2>
      <p>Conferimos clareza, coerência, funcionamento dos fluxos e correspondência entre o texto e as fontes indicadas. A revisão interna não deve ser interpretada como parecer jurídico, contábil ou trabalhista.</p>
      <h2>Como tratamos temas sensíveis</h2>
      <p>Em assuntos que dependem do caso concreto, mostramos limites, direcionamos para fontes oficiais e recomendamos a consulta a profissional habilitado. Só identificaremos um revisor especializado quando uma pessoa real realizar e autorizar essa revisão.</p>
      <h2>Responsabilidade e contato</h2>
      <p>A plataforma é desenvolvida e operada pela Aerosuite. Correções podem ser solicitadas com a URL, o trecho e uma fonte verificável, sem envio de dados pessoais.</p>
      <p><Link href="/criterios-editoriais" className="font-semibold text-sky-700 hover:underline">Critérios editoriais</Link>{' · '}<Link href="/politica-de-correcoes" className="font-semibold text-sky-700 hover:underline">Política de correções</Link>{' · '}<Link href="/contato" className="font-semibold text-sky-700 hover:underline">Contato</Link></p>
    </LegalPage>
  );
}
