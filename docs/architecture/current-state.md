# Estado atual da arquitetura

Data do inventário: 2026-08-21

Escopo: discovery anterior às Sprints 0 e 1 do blueprint técnico do Precisou, Tá Pronto.

Regra deste documento: descrever o código existente sem alterar comportamento, contratos públicos, dados ou SEO.

## 1. Resumo executivo

O produto é um monólito modular em Next.js, com páginas públicas orientadas a SEO, ferramentas executadas majoritariamente no navegador e APIs internas no mesmo deploy. PostgreSQL e Prisma sustentam autenticação, cobrança, preferências, documentos persistidos, compartilhamento e alguns artefatos públicos.

A arquitetura alvo deve ser introduzida como evolução dessa base, não como reconstrução. Já existem equivalentes parciais de `context`, `task-artifact`, `distribution`, `event-platform` e recipient loop. Eles devem receber adapters e contratos canônicos gradualmente, mantendo os formatos e endpoints atuais até que consumidores tenham migrado.

As lacunas estruturais para o blueprint são: plataforma canônica de eventos persistidos, feature flags e experimentos, Intent Graph, entidades genéricas de Task/Artifact, Next Best Action, transferência allowlisted e AI Gateway com safety/observabilidade. A suíte SEO existe, mas ainda contém asserts históricos codificados diretamente nos scripts e não cobre uma lista formal Tier 0/1 por fixture.

## 2. Stack e runtime

| Área | Estado atual | Evidência principal |
| --- | --- | --- |
| Web/runtime | Next.js 15 App Router, React 18, TypeScript 5.7 | `package.json`, `src/app/` |
| UI | Tailwind CSS 3.4, componentes React internos, Lucide | `tailwind.config.ts`, `src/components/` |
| Banco | PostgreSQL | `prisma/schema.prisma` |
| ORM/migrations | Prisma 5.22; migrations SQL versionadas e `prisma migrate deploy` | `prisma/migrations/`, scripts `db:*` |
| Renderização | SSR/static por App Router; ferramentas interativas em Client Components | `src/app/`, `src/components/` |
| Testes | Playwright E2E; alguns testes TypeScript colocados junto ao código; sem runner unitário dedicado no `package.json` | `e2e/`, `playwright.config.ts`, arquivos `*.test.ts` |
| Deploy | Docker/Vultr, Caddy/Cloudflare; workflows GitHub para deploy e E2E staging | `Dockerfile`, `docker-compose*.yml`, `.github/workflows/` |
| Pagamentos | Stripe, Asaas, NuPay, Zoop e Mercado Pago em rotas internas | `src/app/api/billing/`, `src/app/api/webhooks/` |
| Observabilidade de produto | GA4 e Microsoft Clarity, carregados somente após consentimento | `src/components/analytics/analytics-scripts.tsx` |

Não há microservices de aplicação. Essa topologia é compatível com a diretriz Modular Monolith First.

## 3. Organização modular real

O projeto se organiza hoje por feature, sem uma camada formal de domínios compartilhados:

- `src/app/`: rotas públicas, rotas privadas, páginas de ferramentas e Route Handlers.
- `src/components/<domínio>/`: UI e fluxo de cada ferramenta.
- `src/lib/<domínio>/`: cálculos, modelos, persistência client-side e utilitários específicos.
- `src/app/api/`: autenticação, documentos, perfil, compartilhamento, orçamento, cobrança e integrações.
- `prisma/`: schema único e migrations do monólito.
- `src/lib/seo/` e `src/lib/seo-pages/`: catálogo indexável, sitemap, robots, landings e conteúdo.
- `src/components/analytics/` e `src/lib/analytics.ts`: carregamento consent-aware e emissão client-side.
- `e2e/`: regressão de jornadas, SEO, documentos, compartilhamento e growth.

Existem 158 arquivos `page.tsx`, 45 Route Handlers e 22 specs Playwright no momento deste inventário. Esses números são indicadores de superfície, não contratos estáveis.

## 4. Banco e migrations

### Mecanismo existente

- Prisma usa `DATABASE_URL` e um singleton por processo em `src/lib/db.ts`.
- Produção possui `db:migrate:deploy`; desenvolvimento também expõe `db:push`.
- As migrations existentes são diretórios timestampados com `migration.sql`.
- O histórico recente usa alterações aditivas (`CREATE TABLE`, `ADD COLUMN`, índices e FKs).
- O baseline foi criado em `20260729000000_baseline_existing_schema`.

### Identificadores existentes

O schema mistura duas estratégias:

- `cuid()` para User, UserSession, ToolDocument, SharedDocument e entidades de conta.
- UUID nativo do PostgreSQL para Orcamento, PushSubscription e outras entidades operacionais.

Portanto, o blueprint não deve impor UUID global antes do ADR-002. A primeira migration deve seguir a decisão formal de IDs e considerar adapters para IDs legados.

### Persistência existente relevante

- `UserProfile`: segmento, ocupação, empresa, logo e preferências.
- `ToolsPreference`: favoritos, recentes, contadores, categoria e estado do wizard.
- `ToolDocument`: documento por usuário/ferramenta/artefato, JSON e favorito.
- `SharedDocument`: link compartilhado, expiração, revogação e métricas de visualização.
- `Orcamento`: artefato público vertical com status, Pix, cliente e origem de growth.
- `AuditLog` e `RateLimitBucket`: segurança e antifraude.

### Restrições para as próximas migrations

1. Somente expansão aditiva nas Sprints 0/1.
2. Nenhum `DROP`, `RENAME` ou backfill obrigatório no deploy.
3. Novos writers atrás de flag; falha de eventos nunca pode falhar o outcome.
4. Migrações devem ser testadas em banco limpo e como upgrade do schema atual.
5. `db:push` não deve ser usado como mecanismo de release.

## 5. Autenticação, autorização e privacidade

A autenticação é própria, sem NextAuth. O cookie `rj_session` é HttpOnly, SameSite Lax e assinado com HMAC-SHA256. O token carrega um identificador opaco, mas o banco persiste somente seu hash. `UserSession` limita a uma sessão ativa por usuário e permite revogação server-side.

Os Route Handlers protegidos chamam `getValidSessionFromCookies()` e filtram registros pelo `session.sub`. Esse é o padrão que novos endpoints `/api/v1` devem reutilizar.

Pontos positivos existentes:

- senha hasheada e tokens opacos com hash no banco;
- sessão revogável e expiração;
- ownership aplicado em documentos e compartilhamentos;
- rate limit e blacklist persistidos;
- analytics opcional após consentimento;
- `trackEvent()` documenta a proibição de PII e aceita apenas valores escalares.

Lacunas para o blueprint:

- política central de autorização/ownership por domínio;
- criptografia de campos PII em repouso para contexto e clientes;
- schema validation canônica para eventos;
- redaction/allowlist central antes de analytics;
- audit trail específico para alterações de contexto e transferências.

## 6. Analytics e eventos

### Estado atual

`trackEvent(name, params)` envia eventos para GA4 e Clarity somente no navegador. A carga dos scripts depende de consentimento salvo em `rj_analytics_consent`. Falhas ou ausência dos providers não bloqueiam o fluxo.

Há eventos em jornadas de orçamento, Pix, documentos, compartilhamento, referral, busca, conta, checkout e ferramentas. Alguns equivalentes semânticos já existem, por exemplo:

- `tool_started`;
- `document_completed`;
- `share_result` e `document_shared`;
- `account_document_duplicated`;
- `quote_recipient_view` e `quote_approved`;
- eventos de CTA e abertura de documento compartilhado.

### Divergência para a taxonomia v1

Os nomes e propriedades são heterogêneos e não possuem `eventId`, `schemaVersion`, `anonymousId`, `sessionId`, `taskId` ou validação de schema. Não existe persistência genérica, batch endpoint, retry ou sink adapter.

A Sprint 1 deve criar uma façade compatível que possa emitir a taxonomia canônica e, durante a transição, espelhar os eventos legados necessários. Não se deve renomear eventos existentes de uma vez.

## 7. SSR, SEO e superfície pública

### Controles existentes

- Metadata API do Next com `metadataBase`, canonical por rota e Open Graph.
- Root layout deliberadamente estático, sem `headers()`/`cookies()`, para manter metadata no `<head>` inicial.
- Sitemap principal e seis segmentos.
- Robots dedicado e `noindex` para áreas privadas, staging e resultados específicos.
- Middleware para locale, cookie de dispositivo e migração de domínio com redirect por caminho.
- Redirecionamentos permanentes explícitos em `next.config.mjs`.
- Scripts `seo:audit` e `seo:smoke`.
- Specs E2E de hidratação, conteúdo, documentos e growth.

### Risco encontrado

Os scripts SEO contêm expectativas codificadas para nomes e domínios históricos. Exemplos incluem canonical fixo em `resolvajato.com.br` e title template antigo. Como o código já usa constantes de marca e origem configurável, parte dessas verificações pode divergir do estado real mesmo sem regressão funcional.

Antes de tornar a regressão SEO um gate, a Sprint 0 deve gerar fixtures Tier 0/1 versionadas com origem configurável e expectativas explícitas por ambiente. A correção do teste não autoriza mudar URLs, canonicals, titles ou H1 de produção.

## 8. Mapeamento para a arquitetura alvo

| Módulo alvo | Base existente reutilizável | Situação |
| --- | --- | --- |
| `public-web` | App Router, metadata, landings, sitemap, robots, middleware | Maduro; preservar contratos |
| `tool-runtime` | módulos em `src/lib/<domínio>` e UIs por ferramenta | Maduro, porém interfaces variam |
| `context` | UserProfile, ToolsPreference, profile memory | Parcial; falta modelo canônico e PII cifrada |
| `task-artifact` | ToolDocument, Orcamento, históricos locais/servidor | Parcial e vertical; precisa adapter incremental |
| `distribution` | SharedDocument, `/documento/[token]`, CTA e métricas | Parcial; token atual não atende o contrato final |
| `event-platform` | `trackEvent`, GA4 e Clarity | Parcial; falta schema, IDs, persistência e batch |
| `experimentation` | Nenhum provider canônico encontrado | Ausente |
| `intent-graph` | catálogos e journeys estáticos de growth | Conceitos parciais; modelo persistido ausente |
| `recommendation` | CTAs estáticos e jornadas segmentadas | Regras verticais; NBA ausente |
| `ai-gateway` | endpoint vertical de review do assistente | Não é gateway canônico; safety/custo/fallback incompletos |

## 9. Compatibilidade do compartilhamento atual

O fluxo atual não deve ser removido nas primeiras sprints. Ele já oferece criação, reutilização, expiração, revogação, recipient page e CTA contextual.

Há diferenças de segurança em relação ao blueprint:

- o token atual usa 12 bytes aleatórios (96 bits), abaixo dos 128 bits exigidos;
- o token é armazenado em claro, enquanto o alvo exige somente hash;
- a rota atual é `/documento/{token}`, não `/s/{token}`;
- não existe schema formal de sanitização para “usar este modelo”.

A migração futura deve introduzir um formato v2 ao lado do legado. Links existentes continuam válidos durante a janela de compatibilidade; novos links migram por flag. Não se deve reescrever tokens existentes nem alterar a rota pública sem plano explícito.

## 10. Baseline disponível e dados ainda necessários

O repositório oferece telemetria de frontend e um dashboard interno K100 para orçamento, mas não contém export reproduzível que determine as top 20 entradas, outcomes e jornadas cruzadas atuais. Essas métricas dependem de GA4/Clarity e do banco de produção.

Assim, o baseline da Sprint 0 deve separar:

1. inventário estático reproduzível do repositório;
2. query interna sem PII para outcomes persistidos;
3. export agregado do provider de analytics;
4. definição versionada de `outcome` por ferramenta P0;
5. data de coleta, ambiente e janela de análise.

Não se deve inventar ranking de top entradas sem esses dados.

## 11. ADRs exigidos antes de implementação pesada

| ADR | Decisão a preparar com base no estado atual |
| --- | --- |
| ADR-001 | Prisma Migrate/PostgreSQL como mecanismo oficial; política para `db:push` apenas local |
| ADR-002 | UUID, CUID ou estratégia híbrida compatível com IDs existentes |
| ADR-003 | envelope encryption/column encryption para PII e política de snapshots |
| ADR-004 | façade de eventos com sink GA4/Clarity e persistência canônica assíncrona |
| ADR-005 | flags persistidas no PostgreSQL com cache local ou provider externo futuro |
| ADR-006 | links v2 com hash, 128+ bits, TTL, revogação, noindex e compatibilidade legado |
| ADR-007 | adapter de AI provider, minimização de dados, safety, custo e fallback |

## 12. Plano seguro para Sprint 0/1

### Slice 0A — fixtures e inventário

- versionar catálogo Tier 0/1 e outcomes P0;
- tornar scripts de baseline reproduzíveis;
- corrigir expectativas de testes, sem mudar produção;
- registrar métricas disponíveis e lacunas.

### Slice 1A — fundação de eventos

- adicionar `product_event` de forma aditiva;
- criar DTO/schema v1 e sanitização central;
- criar façade non-blocking com dual-write controlado;
- instrumentar uma ferramenta P0 como piloto;
- adicionar testes de schema, PII e emissão única.

### Slice 1B — feature flags

- adicionar `feature_flag` e `experiment_assignment` de forma aditiva;
- bucketing determinístico e fallback seguro para `off`;
- endpoint interno/consulta server-side conforme ADR-005;
- registrar exposição sem bloquear UI.

### Slice 1C — regressão SEO Tier 0/1

- fixtures por URL com status, robots, canonical, title, H1 e conteúdo essencial;
- validação SSR/HTML e sitemap;
- origem parametrizada por ambiente;
- gate no pipeline antes de rollout.

Cada slice deve possuir flag, testes, documentação, rollout e rollback independentes.

## 13. Guardrails imediatos

- Não substituir `ToolDocument`, `SharedDocument` ou `Orcamento` na Sprint 1.
- Não alterar `/documento/{token}`, `/orcamento/{id}` ou páginas indexáveis.
- Não acoplar conclusão de ferramenta à disponibilidade de analytics.
- Não armazenar payload integral de documentos em `product_event`.
- Não usar LLM em cálculo, routing P0 ou NBA v1.
- Não habilitar novas tabelas para usuários até migrations, rollback e ownership passarem nos testes.
- Não considerar a suíte SEO aprovada enquanto fixtures antigas e domínio configurável não estiverem reconciliados.

## 14. Resultado do discovery

O repositório já está alinhado ao formato de monólito modular e possui componentes valiosos para continuidade, distribuição e SEO. A implementação deve consolidar contratos transversais ao redor desses componentes, evitando duplicação de infraestrutura e mantendo adapters para os formatos atuais.

Próximo passo autorizado pelo blueprint: concluir o baseline reproduzível da Sprint 0 e preparar ADR-001, ADR-002, ADR-004 e ADR-005 antes das migrations V001/V002.
