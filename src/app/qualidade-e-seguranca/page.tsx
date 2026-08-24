import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Qualidade e segurança: testes, privacidade e limites',
  description: 'Conheça os critérios usados pelo Precisou, Tá Pronto para testar ferramentas, proteger arquivos, documentar limites e publicar resultados confiáveis.',
  alternates: { canonical: '/qualidade-e-seguranca' },
  openGraph: { title: 'Qualidade e segurança | Precisou, Tá Pronto', description: 'Como testamos ferramentas e protegemos seus arquivos.', url: '/qualidade-e-seguranca' }
};

export default function QualidadeESegurancaPage() {
  return <LegalPage title="Qualidade e segurança" subtitle="Testes reais, limites claros e privacidade por projeto">
    <p><strong>Qualidade e segurança</strong> é o compromisso público usado antes de uma ferramenta ser liberada. Ela precisa cumprir sua finalidade, informar limites e produzir resultados verificáveis.</p>
    <h2>Testes antes da publicação</h2>
    <p>Validamos build de produção, funcionamento em navegador real, fluxos principais, arquivos gerados, responsividade e sinais técnicos de SEO. Ferramentas de PDF e imagem também são testadas quanto a páginas, dimensões, transparência, formato e redução efetiva de tamanho.</p>
    <h2>Processamento local</h2>
    <p>Quando indicamos “processamento local”, o arquivo é manipulado no próprio navegador e não é enviado ao servidor do Precisou, Tá Pronto. Essa característica aparece explicitamente na interface da ferramenta.</p>
    <h2>Resultados honestos</h2>
    <p>Não prometemos uma redução ou precisão impossível para todo arquivo. Modos que alteram características (como rasterizar texto para comprimir mais) exibem o impacto antes do processamento.</p>
    <h2>Segurança e limites</h2>
    <p>Aplicamos validação de tipo e tamanho, conexões HTTPS, políticas de segurança e dependências mantidas. Nenhuma ferramenta online elimina todos os riscos; por isso documentamos restrições e recomendamos não usar arquivos corrompidos, protegidos por senha ou de origem desconhecida.</p>
    <h2>Correções contínuas</h2>
    <p>Falhas reproduzíveis são investigadas e corrigidas. Mudanças materiais passam novamente pelos testes proporcionais ao risco antes da publicação.</p>
    <p><Link href="/criterios-editoriais" className="font-semibold text-sky-700 hover:underline">Critérios editoriais</Link>{' · '}<Link href="/politica-de-correcoes" className="font-semibold text-sky-700 hover:underline">Política de correções</Link>{' · '}<Link href="/privacidade" className="font-semibold text-sky-700 hover:underline">Privacidade</Link>{' · '}<Link href="/precisou-ta-pronto" className="font-semibold text-sky-700 hover:underline">Marca oficial</Link></p>
  </LegalPage>;
}
