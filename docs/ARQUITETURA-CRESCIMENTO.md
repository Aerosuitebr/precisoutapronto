# Arquitetura incremental de crescimento

## Objetivo

Esta evolução organiza o Resolva Jato por problemas e perfis sem substituir os editores, rotas públicas ou documentos existentes.

## Novas camadas

- `src/lib/growth/segments.ts`: catálogo central de segmentos, ferramentas e intenções.
- `src/lib/growth/intents.ts`: registro editorial das páginas de intenção. Cada entrada possui resposta direta, passos, FAQs e uma ação.
- `/para/[segmento]`: centrais por perfil. As rotas antigas de MEI, freelancers e estudantes continuam válidas e têm precedência.
- `/biblioteca` e `/modelos/[slug]`: base da Central do Conhecimento, com FAQPage estruturado.
- `/assistente/documentos`: fluxo guiado que organiza o briefing e encaminha ao editor atual. A primeira versão funciona sem provedor externo.
- `UserProfile`: preferência de segmento e dados opcionais de ocupação/empresa.
- `SharedDocument`: token público revogável ligado a um `ToolDocument`. `/api/share` cria o link e `/documento/[token]` o exibe sem indexação.

## Experiência de perfil e compartilhamento

A página `/conta` permite editar segmento, profissão e empresa. A homepage usa primeiro a preferência local para responder sem atraso e, quando o usuário está autenticado, sincroniza o segmento salvo no perfil. Assim, a personalização acompanha o usuário entre dispositivos sem prejudicar visitantes anônimos.

Contratos, documentos jurídicos e documentos contábeis oferecem a ação **Compartilhar** no histórico. Currículos, recibos e propostas também oferecem a ação diretamente na barra do documento ativo. Todas as telas usam a mesma infraestrutura de compartilhamento. O link:

- é criado somente para um documento pertencente ao usuário autenticado;
- é reutilizado enquanto estiver ativo, evitando links duplicados;
- expira em 30 dias quando criado pela interface;
- pode ser copiado, aberto e revogado na área **Links compartilhados** da conta;
- deixa de funcionar imediatamente após revogação ou expiração;
- nunca é incluído no índice de mecanismos de busca.

Os eventos `document_share_link_copied`, `document_share_link_failed` e `growth_segment_selected` são enviados para as integrações de analytics já configuradas, sempre sem conteúdo do documento ou outros dados pessoais.

Cada acesso válido ao link incrementa `viewCount` e atualiza `lastViewedAt`. Essas métricas são agregadas: o sistema não grava IP, cookie, user-agent ou qualquer identificador do visitante. O proprietário vê o total e a data da última visualização na área da conta.

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

## Próximos passos seguros

- Adicionar testes de integração para criação, expiração e revogação de links.
- Medir início e conclusão do assistente para localizar abandono entre etapas.
- Expandir intenções somente após medir indexação, cliques para ferramenta e conclusão do documento.
