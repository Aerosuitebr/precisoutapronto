# Posicionamento e confiança — 08/11/2026

## Implementação

- Primeira tela dedicada ao prestador: orçamento profissional, aprovação pelo WhatsApp e organização de entrada, saldo e recibo. Dois caminhos: criar orçamento ou ver a demonstração interativa existente. As demais ferramentas permanecem no catálogo e na busca.
- Checklists para eletricistas, pintores e manutenção residencial, com acesso aos modelos existentes e aviso de exemplos ilustrativos. Sem alegação de validação técnica por profissionais.
- Planos na navegação da home, no cabeçalho interno e no rodapé. Página de preços distingue uso sem cadastro, histórico com conta e Premium opcional, preservando preço e pagamento atuais.
- Texto de proveniência corrigido nas páginas de recibo e profissão. Características do produto ficam separadas de estatísticas de uso; contagens disponíveis apresentam fonte, atualização, período e arredondamento. Ausência de contagem publicável não significa ausência de utilização.
- Quando ainda não há relatos elegíveis, a home convida a enviar experiência pelo fluxo de autorização existente. Relatos aprovados continuam sendo exibidos; nenhum depoimento ou resultado foi inventado.
- Conversão de orçamento aprovado em recibo e duplicação já existiam e foram preservadas. Datas editoriais atualizadas somente na página de recibo Pix e na home, onde houve revisão material identificada.

## Validação

Build local aprovado: 310 páginas geradas. Dois avisos preexistentes de imagens permanecem. Auditoria SEO estática: 167 rotas aprovadas. Vinte e um testes aprovados na prévia de produção: demonstração, busca, navegação por profissão, link WhatsApp, planos no celular, estatísticas com e sem contagens disponíveis, recibo real em PDF, próximo recibo e cobertura SEO. Capturas desktop e celular inspecionadas em `output/reference-home-*-2026-11-08.png`.

## Publicação

Publicação concluída em 08/11/2026. Script confirmou serviço saudável, nova chamada principal e comparação de planos. Backup disponível em `/opt/precisoutapronto-backups/reference-20261108`. Build do servidor aprovado com 310 páginas; consulta de relatos no build isolado não alcançou o banco e usou o tratamento existente. Verificações adicionais contra o domínio público concluídas: 21 testes aprovados, incluindo os cenários com dados de estatísticas simulados apenas no navegador de teste, sem gravar métricas fictícias no servidor.

Pacote limitado aos 13 arquivos relacionados em `files.txt`. Os 12 arquivos anteriores foram comparados por SHA-256 com a base conhecida; componente de checklists é novo. Script `publish.sh` inclui backup de código e imagem, verificação da identidade do serviço, teste de saúde e reversão automática. Sem alterações de ambiente, preço, banco, contratos ou serviços WhatsApp.

## Dependências externas

Casos reais, nomes e credenciais da equipe, revisões especializadas, gravação dos vídeos e acordos com parceiros dependem de pessoas e evidências reais. Material de execução em `docs/divulgacao/VALIDACAO-PROFISSIONAIS-2026-11-08.md`; piloto de Instagram e candidatos permanecem no pacote de 04/11. Nenhuma mensagem, anúncio ou postagem externa enviada nesta execução. Métricas atuais de Search Console/GA4 não foram obtidas; não atribuir tráfego ou aumento de retenção à publicação.
