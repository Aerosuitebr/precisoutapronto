# Sprint 3 — Next Best Action

Data: 2026-08-21

Estado: piloto implementado; rollout desativado.

## Slice P0

- Ranking determinístico sobre o Intent Graph, sem LLM.
- Máximo de três ações, com filtros de outcome, risco e disponibilidade.
- Endpoint público de leitura protegido por `nba_v1`.
- Tracking token HMAC com validade de 24 horas.
- Painel pós-outcome aditivo no orçamento; CTAs existentes permanecem intactos.
- Eventos idempotentes `recommendation.shown`, `clicked` e `completed`.
- Primeira atribuição de completion no fluxo orçamento → recibo → PDF.
- Query interna agregada de CTR e completion.

## Gate de rollout

O endpoint interno retorna `rollout.ready` e `rollout.blockers`. Readiness exige simultaneamente:

- `NBA_TRACKING_SECRET` com pelo menos 32 caracteres;
- `nba_v1` habilitada para o subject/coorte;
- `event_platform_v1` habilitada;
- nenhum kill switch aplicável;
- ao menos um edge `next_action` ativo.

Mesmo com `ready=true`, rollout começa apenas com subjects internos. Avanços para 5%, 25%, 50% e 100% exigem task completion estável, erro sem regressão, p95 aceitável e SEO Tier 0/1 verde.

## Rollback

Desligar `nba_v1` ou adicionar a flag a `FEATURE_KILL_SWITCHES`. O painel volta a `null`, o endpoint retorna ações vazias e orçamento/recibo continuam funcionando sem depender do grafo ou analytics.

## Riscos residuais

- `recommendation.completed` ainda não referencia `target_task_id`; isso depende da V004 Task/Artifact.
- O piloto cobre apenas Orçamento → Recibos.
- Nenhum rollout deve ocorrer antes de configurar o segredo nos dois ambientes e executar smoke autenticado interno.
