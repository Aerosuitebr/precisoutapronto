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

## Shadow writer V1

O contrato V1 e o shadow writer já estão disponíveis, mas não possuem consumidor.
O writer falha fechado, depende de `artifact_shadow_write_v1`, grava Task e Artifact na
mesma transação e nunca copia o payload legado. Nesta etapa apenas um resumo
escalar sem chaves de PII pode ser persistido; falhas retornam `null` e não mudam
o resultado da ferramenta original.

O primeiro consumidor shadow é a criação de Orçamentos. Ele roda somente depois
do `Orcamento` legado ter sido salvo, usa uma sessão pseudonimizada, persiste
apenas `total_items`, `outcome` e o UUID legado e não altera o JSON retornado ao
cliente. Com `artifact_shadow_write_v1` desligada, o fluxo termina antes da transação
canônica.

A rota interna `GET /api/analytics/artifacts?days=1|7|30` expõe somente
contagens agregadas, cobertura shadow, divergência Task/Artifact e bloqueadores
de rollout. Payloads, resumos, IDs e sujeitos não são retornados.

`GET /api/v1/artifacts/history?limit=10|20|50` fornece a leitura canônica
autenticada somente quando `smart_history_v1` estiver habilitada para o usuário.
A consulta seleciona metadados e `summaryJson`, nunca `payloadJson`. A rota não é
consumida pela interface e `/api/documents` permanece inalterada como histórico
operacional atual.

O painel aditivo `SmartHistoryPanel` consulta essa rota na área da conta, mas
renderiza `null` enquanto a flag estiver desligada ou não houver itens. Ele não
modifica, oculta ou reordena `RecentDocumentsPanel`.

Retries são idempotentes: quando há `legacyArtifactId`, os UUIDs de Task e
Artifact são derivados deterministicamente do par ferramenta/registro legado.
A persistência usa `upsert` sem atualização, evitando duplicação e impedindo que
um retry sobrescreva o primeiro snapshot.

Os rollouts são independentes: `artifact_shadow_write_v1` controla somente o
dual-write canônico e `smart_history_v1` controla somente a API e o painel de
leitura. Ambas são semeadas desativadas, permitindo medir o shadow write antes de
mostrar qualquer camada nova ao usuário.
