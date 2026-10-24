# Deploy manual direto em produção

Abra DeployMaster.bat com duplo clique na raiz do projeto ou execute no CMD:

    "C:\desenvolvimento\MeusProjetos\precisoutapronto\DeployMaster.bat"

Pré-requisitos: Git, Windows PowerShell e GitHub CLI (https://cli.github.com/) no PATH; autenticação com gh auth login e acesso de escrita ao repositório e execução de workflows. Configurar os segredos VULTR_HOST, VULTR_SSH_USER e VULTR_SSH_PRIVATE_KEY no GitHub conforme o ambiente existente.

O launcher aguarda uma tecla ao terminar, inclusive quando falta uma ferramenta. -NoPause remove essa espera para uso em terminal ou automação.

O script cria commit dos arquivos elegíveis, sincroniza a branch atual com origin e dispara deploy-vultr.yml com target=production e expected_sha do commit remoto. Não usa staging nem status e2e/staging. Se informar -Branch, ela deve ser a branch atual. Não há troca implícita de branch. Arquivos de output/, dependências e segredos continuam fora da seleção de arquivos para o commit automático.

O workflow valida o SHA, instala dependências, roda auditoria SEO, compila e testa regras de indicação/documentos antes de copiar os arquivos para o servidor de produção. A compilação do servidor é preservada. Após publicar, confere a resposta HTTP do site. Essas verificações não substituem toda a suíte E2E e o HTTP não confirma isoladamente qual versão está no ar. O script espera a conclusão do workflow e apresenta o link dos logs.

Simulação sem commit, push, fetch ou deploy:

    DeployMaster.bat -DryRun

-SkipCommit publica o commit remoto sem incluir alterações locais. -SkipPush não envia commits locais. -StagingOnly foi removido, pois o ambiente não existe mais.

Validação local da correção: parser do Windows PowerShell 5.1 aprovado; YAML e dependências preflight → deploy → verify aprovados; DryRun concluído; erros de ausência de PowerShell e Git testados com pausa confirmada. Nenhum workflow ou deploy foi disparado durante esses testes. O workflow E2E Staging Gate legado é somente manual e não faz parte do deploy atual.
