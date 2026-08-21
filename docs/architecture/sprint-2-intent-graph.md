# Sprint 2 — Intent Graph V003

Data: 2026-08-21

Estado: primeiro slice implementado no código; sem consumidor público.

## Escopo deste slice

- Migration aditiva `20260821140000_add_intent_graph`.
- Tabelas `intent_nodes` e `intent_edges` com FKs restritivas e índices de leitura.
- Seed idempotente das sete ferramentas P0 confirmadas no catálogo existente.
- Sete relações iniciais `next_action`, ainda sem transferência de campos.
- Metadata `seedVersion=1` para evolução controlada.
- Repository read-only que retorna apenas nodes/edges ativos e descarta configurações inválidas.
- Endpoint interno `GET /api/analytics/intent-graph?toolKey=` protegido pela allowlist administrativa.
- Contratos V1 estritos para `ruleJson` e `transferSchema`; campos desconhecidos falham fechados.
- PATCH interno de edges existentes por `fromKey/toKey`, limitado a estado, peso, regra e allowlist.
- Alteração de edge e `AuditLog` são gravados na mesma transação; não há delete nem criação arbitrária.

## Compatibilidade e segurança

Nenhuma rota, canonical, H1, title, ferramenta ou fluxo existente foi modificado. `nba_v1` continua desligada e nenhum componente consulta o grafo. Os `transferSchema` nascem com allowlist vazia para impedir cópia acidental antes do slice específico de transferência.

## Próximos slices

1. Administração auditada de nodes.
2. Somente depois: ranking NBA por regras atrás de `nba_v1`.

## Rollback

Não remover as tabelas no rollback operacional. Como não há reader ativo, basta manter `nba_v1=false`; os fluxos atuais continuam independentes do V003.
