import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: { absolute: 'Termos e limitações · Jato Games Diagnostic' },
  description: 'Entenda o escopo, as limitações e o uso responsável das estimativas do Jato Games Diagnostic.',
  alternates: { canonical: '/games/diagnostico/termos' }
};

export default function Page() {
  return (
    <LegalPage title="Termos e limitações do diagnóstico" subtitle="Estimativas técnicas, não promessa de FPS">
      <p>O aplicativo compara medições locais e hardware identificado com perfis editoriais versionados. O resultado é orientativo e não garante FPS, estabilidade, compatibilidade com mods ou desempenho em uma configuração gráfica específica.</p>
      <p>O desempenho real varia com resolução, preset, temperatura, energia, drivers, processos em segundo plano, atualizações do jogo e limitações do fabricante. Jogos sem versão nativa para Windows são sinalizados e emuladores não são avaliados.</p>
      <p>Requisitos mínimos e recomendados exibem fonte e data de verificação. Perfis desatualizados ou incompatíveis são rejeitados pelo aplicativo, que mantém uma lista offline validada.</p>
      <p>Interrompa o teste se o computador apresentar temperatura ou comportamento anormal. O benchmark tem duração controlada, não executa overclock e não modifica configurações de segurança.</p>
      <p>Versão candidata atual: 0.9.0. Última atualização: 30 de julho de 2026.</p>
    </LegalPage>
  );
}
