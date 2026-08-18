import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Política de correções',
  description: 'Como comunicar erros e como o Precisou, Tá Pronto avalia, corrige e registra atualizações de conteúdo e ferramentas.',
  alternates: { canonical: '/politica-de-correcoes' }
};

export default function PoliticaDeCorrecoesPage() {
  return (
    <LegalPage title="Política de correções" subtitle="Transparência quando algo precisa mudar">
      <p>Queremos corrigir rapidamente erros factuais, links quebrados, fórmulas incorretas, exemplos ambíguos e informações desatualizadas.</p>
      <h2>Como enviar uma correção</h2>
      <p>Use a página de contato e informe a URL, o trecho ou comportamento observado, a correção sugerida e, quando possível, uma fonte verificável. Não envie documentos pessoais ou dados sensíveis.</p>
      <h2>Como avaliamos</h2>
      <p>A equipe reproduz o problema, confere a fonte primária e avalia o impacto. Erros que possam afetar decisão financeira, trabalhista, jurídica ou privacidade recebem prioridade.</p>
      <h2>Como publicamos</h2>
      <p>Correções materiais atualizam a data de revisão e o conteúdo relacionado. Ajustes apenas tipográficos não fazem a página parecer artificialmente nova. Quando uma fórmula muda, a metodologia e os avisos também são revisados.</p>
      <h2>Prazo de resposta</h2>
      <p>Confirmamos o recebimento quando houver endereço válido para retorno. O prazo depende da complexidade e da necessidade de validação externa.</p>
      <p><Link href="/contato" className="font-semibold text-sky-700 hover:underline">Enviar uma correção</Link>{' · '}<Link href="/criterios-editoriais" className="font-semibold text-sky-700 hover:underline">Ler os critérios editoriais</Link></p>
    </LegalPage>
  );
}
