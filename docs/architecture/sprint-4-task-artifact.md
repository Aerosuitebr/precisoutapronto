# Sprint 4 — Task e Artifact (V004)

## Escopo desta entrega

A V004 introduz apenas a fundação canônica e aditiva de `tasks`, `artifacts` e
`artifact_relations`. Nenhum fluxo existente grava ou lê essas tabelas nesta
etapa.

- `ToolDocument` e todos os modelos específicos das ferramentas permanecem
  inalterados e continuam sendo a fonte operacional atual.
- Identificadores novos usam UUID nativo; identificadores legados continuam no
  formato atual.
- As relações não usam exclusão em cascata.
- `templateId` é apenas uma referência futura e não possui FK antes da camada de
  templates existir.
- Não há backfill, dual-write ou troca de leitura nesta migration.

## Segurança do payload

`payloadJson` nasce vazio e não deve receber PII nesta fase. Antes de habilitar
qualquer writer, a política de criptografia seletiva, classificação de dados,
retenção e acesso deverá ser aprovada e implementada conforme a ADR de segurança
da camada de artefatos. `summaryJson` deve conter apenas dados mínimos e próprios
para listagem.

## Próxima expansão compatível

1. Definir o contrato de criação de Task e Artifact por versão.
2. Implementar writer atrás de feature flag, inicialmente em uma única ferramenta.
3. Ativar dual-write sem alterar a leitura legada.
4. Medir divergência e somente depois avaliar uma leitura canônica com fallback.

As flags `smart_history_v1` e `duplicate_v1` permanecem desativadas até essas
etapas e seus critérios de rollback estarem validados.
