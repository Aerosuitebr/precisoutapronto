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

## Piloto P0 — orçamento

O primeiro dual-write foi conectado ao sucesso de `POST /api/orcamentos`:

- o evento legado no navegador continua inalterado;
- o servidor tenta emitir `task.completed` somente depois de persistir o orçamento;
- `artifactId` referencia o UUID do orçamento, sem copiar cliente, Pix, itens ou valor;
- as únicas propriedades são duração agregada e tipo de outcome;
- device e sessão são convertidos em pseudônimos antes da decisão/persistência;
- flag desligada não grava evento;
- falha de analytics retorna `false` e nunca transforma o orçamento em erro.

## Observabilidade do piloto

`GET /api/analytics/product-events?days=1|7|30` fornece uma query operacional agregada para contas internas autorizadas. A resposta inclui:

- total da janela e da última hora;
- contagem por `eventName`;
- contagem por `toolKey`;
- estado e percentual de `event_platform_v1`;
- timestamp inicial da janela.

O endpoint não retorna `properties`, user IDs, anonymous IDs, session IDs, task IDs ou artifact IDs. A mesma allowlist central protege este endpoint e o dashboard K100.

Gate de rollout do piloto: confirmar flag, volume esperado, ausência de propriedades rejeitadas nos logs, estabilidade do outcome e nenhuma piora relevante de latência antes de avançar além do grupo interno.

## Operação de feature flags

`GET /api/analytics/feature-flags/{key}` retorna a configuração para um administrador autenticado, o estado do kill switch e o hash do subject atual. `PATCH` aceita somente:

- `enabled` booleano;
- `rolloutPercent` inteiro entre 0 e 100;
- `rules.includeSubjectHashes` e `rules.excludeSubjectHashes`, contendo apenas SHA-256.

O master switch `enabled=false` sempre prevalece. Com a flag habilitada, exclusão prevalece sobre inclusão, e inclusão prevalece sobre o bucket percentual. Um hash não pode existir simultaneamente nas duas listas.

Cada alteração cria `AuditLog` com autor, flag e estado anterior/posterior. E-mail pode existir no audit log administrativo existente, mas nunca é gravado em `rules`. `FEATURE_KILL_SWITCHES` continua prevalecendo sobre banco e endpoint.

Procedimento interno inicial para `event_platform_v1`:

1. consultar a flag e copiar `currentSubjectHash` da conta interna;
2. manter `rolloutPercent=0`, definir o hash na inclusão e então `enabled=true`;
3. gerar um orçamento de teste e confirmar `task.completed` na consulta agregada;
4. remover a inclusão ou desligar a flag se latência/logs divergirem;
5. somente depois considerar 5%, com aprovação explícita do gate.
