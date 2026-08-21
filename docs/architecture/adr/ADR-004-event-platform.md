# ADR-004 — Plataforma canônica de eventos

Status: aceito
Data: 2026-08-21

## Contexto

O produto já envia eventos client-side para GA4 e Clarity após consentimento. Os eventos atuais são úteis, mas heterogêneos, não versionados e sem IDs canônicos. Outcomes não podem depender de analytics.

## Decisão

Introduzir uma façade interna `event-platform` no monólito, com contrato `ProductEventDTO` v1 e múltiplos sinks.

### Contrato

Todo evento canônico contém `eventId`, `eventName`, `occurredAt`, `schemaVersion`, `anonymousId`, `sessionId` e `properties`; IDs de usuário, ferramenta, task e artifact são opcionais conforme contexto.

### Fluxo

- O frontend cria IDs e envia batches limitados para `/api/v1/events/batch` somente quando permitido pela política de consentimento.
- O servidor valida schema, tamanho, allowlist de propriedades e duplicidade por `eventId`.
- Persistência em `product_event` é o sink canônico inicial.
- GA4/Clarity continuam recebendo eventos necessários pelo caminho legado durante a transição.
- A façade oferece dual-write controlado por flag; não renomeia todos os eventos existentes no primeiro release.
- Falha, timeout ou indisponibilidade do endpoint é silenciosa para a tarefa principal.

### Privacidade

Schemas rejeitam CPF/CNPJ, texto integral de documentos, endereço, dados bancários, prompts, e-mail e nomes de clientes. Propriedades livres não são aceitas sem allowlist explícita.

## Operação

- Batch possui limite de itens e bytes.
- `eventId` torna a ingestão idempotente.
- Retenção e export serão definidos antes de 100% de rollout.
- Métricas iniciais: aceitos, rejeitados por schema, duplicados, latência e falhas por sink.

## Consequências

Eventos passam a ter semântica versionada e testável, mantendo GA4/Clarity e os nomes legados enquanto dashboards dependam deles. Nenhuma fila externa é introduzida na primeira versão.
