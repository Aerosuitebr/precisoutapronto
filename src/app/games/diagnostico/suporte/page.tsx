import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: { absolute: 'Suporte e desinstalação · Jato Games Diagnostic' },
  description: 'Ajuda, desinstalação, logs locais e contato de segurança do Jato Games Diagnostic.',
  alternates: { canonical: '/games/diagnostico/suporte' }
};

export default function Page() {
  return (
    <LegalPage title="Suporte e desinstalação" subtitle="Ajuda para o Jato Games Diagnostic">
      <p><strong>Desinstalação:</strong> abra Configurações do Windows → Aplicativos → Aplicativos instalados, procure “Jato Games Diagnostic”, abra o menu e selecione Desinstalar.</p>
      <p>O cache e os logs opcionais ficam em <code>%LOCALAPPDATA%\JatoGamesDiagnostic</code>. Após desinstalar, você pode apagar essa pasta para remover os dados locais restantes.</p>
      <p>Em caso de falha, informe versão do Windows, versão do aplicativo, jogo selecionado e mensagem exibida. Não envie documentos pessoais. O log sanitizado pode ser anexado voluntariamente.</p>
      <p>Suporte, privacidade, segurança ou falso positivo: <a href="mailto:contato@resolvajato.com.br">contato@resolvajato.com.br</a>. Relatos de segurança também podem seguir o <a href="/.well-known/security.txt">security.txt</a>.</p>
      <p>Baixe o aplicativo apenas da Microsoft Store ou de uma página oficial em resolvajato.com.br e confira a assinatura e o SHA-256 publicados.</p>
    </LegalPage>
  );
}
