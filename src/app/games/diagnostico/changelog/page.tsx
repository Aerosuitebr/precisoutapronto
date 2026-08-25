import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: { absolute: 'Versões · Precisou, Tá Pronto Games Diagnostic' },
  description: 'Histórico público de versões e mudanças do Precisou, Tá Pronto Games Diagnostic.',
  alternates: { canonical: '/games/diagnostico/changelog' }
};

export default function Page() {
  return (
    <LegalPage title="Versões do Precisou, Tá Pronto Games Diagnostic" subtitle="Histórico público e verificável">
      <h2 className="text-lg font-bold text-slate-900">0.9.0 · candidata para testes</h2>
      <p>Atualização para .NET 10 LTS, relatório sem nome da máquina, cancelamento seguro, logs sanitizados, seleção de GPU em notebooks híbridos, validação rígida do catálogo, fontes versionadas e pacote MSIX x64.</p>
      <h2 className="text-lg font-bold text-slate-900">0.2.0 · MVP interno</h2>
      <p>Inventário WMI, benchmark local de CPU, memória e disco, comparação com jogos, relatório visual e atualização do Top 10 com cache offline.</p>
      <p>As versões públicas terão SHA-256 publicado junto ao download. Última atualização editorial: 30 de julho de 2026.</p>
    </LegalPage>
  );
}
