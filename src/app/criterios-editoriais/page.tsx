import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Critérios editoriais',
  description: 'Como o Resolva Jato pesquisa, escreve, revisa, atualiza e referencia seus guias e ferramentas.',
  alternates: { canonical: '/criterios-editoriais' }
};

export default function CriteriosEditoriaisPage() {
  return (
    <LegalPage title="Critérios editoriais" subtitle="Como produzimos conteúdo útil e verificável">
      <p>Os conteúdos do Resolva Jato são produzidos para responder uma dúvida prática antes de apresentar uma ferramenta. Não publicamos textos apenas para atingir uma quantidade de palavras ou variações artificiais de uma mesma busca.</p>
      <h2>Pesquisa e fontes</h2>
      <p>Priorizamos fontes oficiais, normas, legislação e materiais de órgãos responsáveis. Quando uma afirmação depende de contexto, deixamos o limite explícito e indicamos validação com profissional habilitado.</p>
      <h2>Autoria e revisão</h2>
      <p>Cada guia informa responsável editorial, tipo de revisão e data real da última atualização. “Revisão editorial interna” significa conferência de clareza, coerência, links e funcionamento da ferramenta; não significa revisão jurídica, contábil ou trabalhista especializada.</p>
      <h2>Exemplos e ferramentas</h2>
      <p>Exemplos são fictícios e criados pela equipe para demonstrar preenchimento. Calculadoras apresentam estimativas baseadas nos dados informados e documentam hipóteses na página de metodologia.</p>
      <h2>Atualizações</h2>
      <p>Datas só mudam quando há revisão material. Alterações relevantes em regra, fonte, fórmula ou funcionalidade são incorporadas assim que identificadas e podem ser reportadas por qualquer leitor.</p>
      <p><Link href="/politica-de-correcoes" className="font-semibold text-sky-700 hover:underline">Consulte a política de correções</Link>{' · '}<Link href="/metodologia-calculadoras" className="font-semibold text-sky-700 hover:underline">Veja a metodologia das calculadoras</Link></p>
    </LegalPage>
  );
}
