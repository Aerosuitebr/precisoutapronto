import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Privacidade · Jato Games Diagnostic',
  description: 'Política de privacidade específica do diagnóstico local de hardware do Jato Games.',
  alternates: { canonical: '/games/diagnostico/privacidade' }
};

export default function Page() {
  return (
    <LegalPage title="Privacidade do Jato Games Diagnostic" subtitle="Diagnóstico local e consentimento explícito">
      <p><strong>O diagnóstico não exige conta e não envia automaticamente inventário, benchmark ou relatório.</strong></p>
      <p>Após sua autorização, o aplicativo consulta localmente sistema operacional, CPU, quantidade de memória, adaptadores gráficos, versão do driver e espaço livre na unidade do sistema. Ele não lê seus documentos, histórico, senhas, mensagens ou conteúdo de arquivos.</p>
      <p>Para medir o armazenamento, cria um arquivo temporário de até 192 MB e tenta removê-lo ao final, inclusive após cancelamento ou falha. O catálogo de jogos é obtido por HTTPS sem incluir dados do computador.</p>
      <p>O relatório exportável contém dados técnicos, mas não inclui nome do computador, nome do usuário ou identificador de conta. A exportação acontece somente quando você escolhe o destino.</p>
      <p>Logs locais registram tipo de falha e contexto técnico, com nomes de usuário, máquina e pasta pessoal removidos. Eles permanecem por até 14 dias e só são compartilhados se você decidir anexá-los ao suporte.</p>
      <p>Qualquer integração futura com o site exigirá um segundo consentimento específico antes do envio. Contato de privacidade: <a href="mailto:contato@resolvajato.com.br">contato@resolvajato.com.br</a>.</p>
      <p>Última atualização: 30 de julho de 2026.</p>
    </LegalPage>
  );
}
