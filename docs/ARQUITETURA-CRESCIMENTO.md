# Arquitetura incremental de crescimento

## Objetivo

Esta evolução organiza o Resolva Jato por problemas e perfis sem substituir os editores, rotas públicas ou documentos existentes.

## Novas camadas

- `src/lib/growth/segments.ts`: catálogo central de segmentos, ferramentas e intenções.
- `src/lib/growth/intents.ts`: registro editorial das páginas de intenção. Cada entrada possui resposta direta, passos, FAQs e uma ação.
- `src/lib/growth/validation.ts`: auditoria automática de slugs, referências entre segmentos, quantidade mínima de passos/FAQs e destinos de CTA.
- `/para/[segmento]`: centrais por perfil. As rotas antigas de MEI, freelancers e estudantes continuam válidas e têm precedência.
- `/biblioteca` e `/modelos/[slug]`: base da Central do Conhecimento, com FAQPage estruturado.
- `/assistente/documentos`: fluxo guiado que organiza o briefing e encaminha ao editor atual. A primeira versão funciona sem provedor externo.
- `UserProfile`: preferência de segmento e dados opcionais de ocupação/empresa.
- `SharedDocument`: token público revogável ligado a um `ToolDocument`. `/api/share` cria o link e `/documento/[token]` o exibe sem indexação.

## Experiência de perfil e compartilhamento

A página `/conta` permite editar segmento, profissão e empresa. A homepage usa primeiro a preferência local para responder sem atraso e, quando o usuário está autenticado, sincroniza o segmento salvo no perfil. Assim, a personalização acompanha o usuário entre dispositivos sem prejudicar visitantes anônimos.

### Memória segura nos documentos

Os campos não sensíveis já existentes no perfil agora reduzem preenchimento repetitivo em novos rascunhos:

- empresa: nome da parte principal do contrato, recebedor do recibo e empresa/assinatura da proposta;
- profissão: profissão da parte principal do contrato e título profissional do currículo.

A aplicação é conservadora: só ocorre em campos vazios, não altera documentos salvos e não é executada sobre um briefing vindo do assistente de IA. Falhas ou ausência de autenticação mantêm o fluxo anterior, com um documento vazio. O evento `profile_memory_applied` registra somente a ferramenta e a quantidade de campos aplicados, sem enviar os valores do perfil.

### Histórico transversal

A conta reúne até 50 documentos autenticados recentes de currículos, recibos, propostas e contratos. A rota agregadora `/api/documents` retorna apenas identificador, tipo, título resumido e data de atualização; o conteúdo completo continua restrito às rotas de cada ferramenta.

Cada item abre o editor com `?document=<id>`, e o editor seleciona o rascunho solicitado depois de carregar o armazenamento atual. Identificadores inexistentes usam o documento mais recente como fallback, preservando links antigos e o comportamento anterior. A retomada registra `account_document_resumed` apenas com o identificador da ferramenta.

Documentos importantes podem ser marcados como favoritos na própria conta. Favoritos são exibidos antes dos demais, mantendo a ordem de atualização dentro de cada grupo. A mutation usa `PATCH /api/documents/[toolId]/[artifactId]` e atualiza apenas o booleano `isFavorite`; o conteúdo do documento não é reenviado.

O histórico também funciona como biblioteca pessoal: permite buscar pelos metadados de título/tipo, filtrar favoritos ou uma ferramenta específica e limpar a seleção sem recarregar a página. A busca é local sobre os metadados já retornados, tolera acentos e nunca consulta o conteúdo do documento. A telemetria registra filtro e quantidade de resultados, mas não o termo digitado.

Cada item pode ser duplicado pela conta. O `POST /api/documents/[toolId]/[artifactId]` busca a origem pelo usuário autenticado, cria um novo `artifactId`, ajusta título/data dentro da cópia e retorna somente seus metadados. O conteúdo original não é alterado nem trafega pela biblioteca; a cópia começa sem favorito e pode ser aberta imediatamente pelo link de retomada.

A biblioteca também aciona o compartilhamento público sem abrir o editor. O fluxo usa a mesma `POST /api/share`, com validade de 30 dias: um link ativo do mesmo documento é reutilizado, e somente na ausência dele um novo token é criado. Em navegadores compatíveis abre o compartilhamento nativo; nos demais copia o link. Os eventos existentes agora distinguem `source: account` de `source: editor`.

Após a API confirmar a criação ou reutilização, o cliente emite o sinal interno tipado `resolva-jato:document-share-updated`. O painel “Links compartilhados” escuta esse sinal e recarrega sua lista imediatamente. A sincronização é local à aba, não usa polling e não inclui título, URL, token ou conteúdo do documento no evento.

O painel apresenta um resumo de desempenho calculado no cliente: visualizações acumuladas, quantidade de links ativos e documento mais visto. As métricas usam somente `viewCount`, validade e revogação já retornados pela API; não existem identificação de visitante, endereço IP ou eventos individuais nessa visão.

Migration correspondente: `20260729234500_add_tool_document_favorites`. Ela adiciona `tool_documents.isFavorite BOOLEAN NOT NULL DEFAULT false` e um índice por usuário, favorito e atualização. O valor padrão mantém todos os registros existentes compatíveis e não exige backfill.

Contratos, documentos jurídicos e documentos contábeis oferecem a ação **Compartilhar** no histórico. Currículos, recibos e propostas também oferecem a ação diretamente na barra do documento ativo. Todas as telas usam a mesma infraestrutura de compartilhamento. O link:

- é criado somente para um documento pertencente ao usuário autenticado;
- é reutilizado enquanto estiver ativo, evitando links duplicados;
- expira em 30 dias quando criado pela interface;
- pode ser copiado, aberto e revogado na área **Links compartilhados** da conta;
- deixa de funcionar imediatamente após revogação ou expiração;
- nunca é incluído no índice de mecanismos de busca.

Em navegadores compatíveis, **Compartilhar** abre o seletor nativo do dispositivo, permitindo escolher WhatsApp, Telegram, e-mail e outros aplicativos instalados. Quando a API nativa não está disponível ou falha, o link é copiado automaticamente. O cancelamento voluntário do seletor não é tratado como erro.

Os eventos `document_share_link_copied`, `document_share_link_failed` e `growth_segment_selected` são enviados para as integrações de analytics já configuradas, sempre sem conteúdo do documento ou outros dados pessoais.

Cada acesso válido ao link incrementa `viewCount` e atualiza `lastViewedAt`. Essas métricas são agregadas: o sistema não grava IP, cookie, user-agent ou qualquer identificador do visitante. O proprietário vê o total e a data da última visualização na área da conta.

A página pública apresenta uma ação contextual para a ferramenta que originou o documento. Por exemplo, quem recebe um contrato é encaminhado ao editor de contratos, enquanto uma proposta leva ao editor de propostas. A origem é atribuída por parâmetros UTM e pelos eventos `shared_document_landing_viewed` e `shared_document_cta_clicked`, usando apenas o tipo da ferramenta — nunca o token ou o conteúdo compartilhado.

## Ponte entre assistente e editores

Ao concluir o assistente, o briefing fica temporariamente na sessão do navegador e é consumido uma única vez pelo editor correspondente. Contratos, currículos, recibos e propostas recebem um novo rascunho, sem sobrescrever documentos existentes. O payload expira em 30 minutos e é removido após leitura.

## Análise do briefing

`POST /api/assistant/review` valida tamanho e tipo do payload, limita chamadas por IP e devolve sugestões e alertas. Sem configuração externa, usa regras locais específicas para cada documento.

Para conectar um serviço privado de IA:

```env
DOCUMENT_AI_ENDPOINT="https://seu-servico.example/review"
DOCUMENT_AI_API_KEY="segredo-do-servidor"
```

O endpoint recebe `task`, `locale`, `documentType`, `answers` e `responseSchema`. Deve devolver JSON com `summary`, `suggestions[]` e `alerts[]`. A chave permanece exclusivamente no servidor. Falhas, timeouts ou respostas inválidas retornam automaticamente ao fallback local.

## Telemetria do assistente

O funil registra início, escolha de tipo, conclusão de etapa, briefing concluído, análise iniciada ou concluída, abertura do editor e abandono. Os parâmetros permitidos são somente o tipo do documento, a etapa, o total de etapas e o provedor local ou remoto da revisão.

Respostas, títulos e demais conteúdos do documento nunca são encaminhados ao analytics. O abandono é observado no encerramento da página apenas quando houve progresso e o editor ainda não foi aberto.

## Compatibilidade

Nada foi removido. A navegação anterior, `/guias`, `/recursos`, `/ferramentas/*`, landings e APIs de documentos permanecem. A personalização usa `localStorage` para visitantes e tenta sincronizar com `/api/profile` apenas quando há sessão.

## Banco de dados

A alteração PostgreSQL está versionada em:

`prisma/migrations/20260729210000_add_growth_profiles_and_document_sharing/migration.sql`

Ela é estritamente aditiva: cria `user_profiles` e `shared_documents`, seus índices e as relações com `users` e `tool_documents`. Não reescreve nem remove registros existentes.

As métricas agregadas de compartilhamento são adicionadas por:

`prisma/migrations/20260729233000_add_shared_document_metrics/migration.sql`

Essa segunda migration apenas acrescenta `viewCount` com padrão zero e `lastViewedAt` opcional, preservando todos os links existentes.

Para aplicar em produção pelo Prisma:

```bash
npm run db:migrate:status
npm run db:migrate:deploy
npm run db:migrate:status
```

Antes do deploy, faça backup e confirme que `DATABASE_URL` aponta para a instância correta. Não use `prisma db push` em produção.

Se a base já existia antes da adoção de `prisma/migrations` (criada via `db push`), o primeiro `migrate deploy` pode retornar **P3005**. O entrypoint trata isso marcando `20260729000000_baseline_existing_schema` como aplicada e em seguida executa as migrations aditivas. Em staging isso já foi validado: as tabelas `user_profiles` e `shared_documents` existem e o app responde em `https://staging.resolvajato.com.br`.

A migration aditiva pressupõe que as tabelas `users` e `tool_documents` já existem com os nomes definidos no schema.

Nos containers, `PRISMA_SCHEMA_MODE=migrate` é forçado pelo overlay Vultr de produção e pelo compose de staging. O entrypoint não usa mais `--accept-data-loss`. O compose base usa `push` para permitir o bootstrap do desenvolvimento local, e o modo `skip` inicia um container sem tocar no schema.

Rollback manual, apenas se ainda não houver dados que precisem ser preservados:

```sql
BEGIN;
DROP TABLE IF EXISTS "shared_documents";
DROP TABLE IF EXISTS "user_profiles";
COMMIT;
```

## Como adicionar conteúdo

1. Cadastre ou ajuste o segmento em `segments.ts`.
2. Adicione uma intenção revisada em `intents.ts`.
3. Relacione a intenção aos segmentos adequados.
4. Revise resposta, FAQs, riscos e CTA manualmente.
5. O sitemap, a biblioteca e as centrais de segmento passam a incluir o conteúdo automaticamente.

O catálogo inicial contém 20 intenções revisadas e cobre todas as referências exibidas nas dez centrais de segmento. O teste `growth-content-validation.spec.ts` impede que uma central publique um link para conteúdo inexistente.

Cada página de intenção publica `WebPage`, `BreadcrumbList` e `FAQPage` em JSON-LD, exibe breadcrumbs visíveis e recomenda até três conteúdos relacionados por afinidade de segmento e ferramenta. O clique do conteúdo para a ferramenta gera `intent_tool_cta_clicked` com apenas o slug editorial e o caminho da ferramenta.

A `/biblioteca` oferece busca instantânea tolerante a acentos e filtros para os dez segmentos. A busca acontece no navegador, sem chamadas à API. A telemetria registra apenas o tamanho da consulta, quantidade de resultados e segmento escolhido; o texto pesquisado não é enviado.

As centrais `/para/[segmento]` encaminham para a biblioteca com `?segment=` validado. Sem parâmetro, a biblioteca pode aplicar a preferência já escolhida na homepage. A seleção atualiza a URL sem recarregar a página, permitindo compartilhar a visualização filtrada. O evento `segment_journey_clicked` mede apenas segmento e tipo de destino (`tool`, `intent` ou `library`).

## Indicações

O parâmetro `?ref=` é capturado globalmente e preservado no navegador até a conclusão do cadastro, mesmo quando o convite entra por uma landing diferente da homepage. O painel da conta permite compartilhar o convite pelo seletor nativo, WhatsApp, cópia do link ou cópia do código.

O evento `referral_invite_shared` registra somente o canal (`native`, `whatsapp`, `link_copy` ou `code_copy`). Código, URL e identidade do usuário não são enviados ao analytics. A ativação e recompensa continuam protegidas pelas regras existentes de e-mail confirmado, primeiro uso e bloqueio de mesmo dispositivo.

## Próximos passos seguros

- Adicionar testes de integração para criação, expiração e revogação de links.
- Expandir intenções somente após medir indexação, cliques para ferramenta e conclusão do documento.
