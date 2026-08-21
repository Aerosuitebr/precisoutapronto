# Sprint 1 — fundação V001/V002

Data: 2026-08-21

Estado: implementada no código; rollout desativado.

## Escopo entregue

- V001 `product_events`, aditiva e sem writer ativo por padrão.
- V002 `feature_flags` e `experiment_assignments`, aditiva.
- Seeds idempotentes das flags mínimas do blueprint, todas em `false` e `0%`.
- Contrato canônico de eventos v1 com validação de IDs, tempo, nomes e propriedades.
- Rejeição de identidade client-managed e propriedades sensíveis.
- Endpoint `POST /api/v1/events/batch`, limitado a 20 eventos e 64 KiB.
- Rate limit por hash do IP; o IP não entra no evento.
- Bucketing determinístico para rollout percentual.
- Kill switch por `FEATURE_KILL_SWITCHES`.

## Comportamento de compatibilidade

Nenhuma ferramenta chama o endpoint novo nesta etapa. GA4, Clarity e os eventos legados continuam inalterados. `event_platform_v1` desativada faz o endpoint responder 404, sem persistência.

## Contrato do batch

```json
{
  "events": [
    {
      "eventId": "UUID",
      "eventName": "task.completed",
      "occurredAt": "ISO-8601",
      "schemaVersion": 1,
      "anonymousId": "identificador-pseudonimo",
      "sessionId": "sessao-pseudonima",
      "toolKey": "orcamentos",
      "properties": { "duration_ms": 1200 }
    }
  ]
}
```

`userId` nunca é aceito do cliente; quando há sessão válida, o servidor o associa. Eventos duplicados são ignorados pela PK `eventId`.

## Rollout

1. Aplicar migrations com `prisma migrate deploy`.
2. Confirmar que todas as flags permanecem desativadas.
3. Fazer smoke do endpoint e confirmar 404 com a flag desligada.
4. Habilitar `event_platform_v1` somente para equipe interna após definir subject keys.
5. Instrumentar uma ferramenta P0 em slice separado e medir rejeição, latência e duplicidade.
6. Avançar `5% -> 25% -> 50% -> 100%` apenas sem queda de conclusão.

## Rollback

- Preferencial: adicionar `event_platform_v1` a `FEATURE_KILL_SWITCHES` ou desligar a flag no banco.
- O endpoint volta ao estado inativo sem remover tabelas.
- Não reverter V001/V002 durante rollback operacional.
- Eventos legados permanecem disponíveis durante toda a transição.

## Riscos residuais

- Migrations ainda precisam ser exercitadas em banco PostgreSQL limpo e em clone de upgrade antes do deploy.
- Retenção de `product_events` precisa ser definida antes do rollout amplo.
- A primeira instrumentação deve criar subject/session IDs pseudônimos consent-aware.
- Não há painel administrativo; mudanças de flag exigem operação interna auditável.
