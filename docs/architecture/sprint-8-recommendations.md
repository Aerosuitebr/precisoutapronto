# Sprint 8 — recommendation exposures

## Fundação V008

A V008 adiciona `recommendation_exposures` sem alterar o ranking, endpoints ou
eventos NBA existentes. Não há backfill.

Cada linha representa o ciclo de uma recomendação: contexto canônico opcional,
chave e ferramenta de destino, variante, posição 1–3, apresentação, clique e
task concluída. O sujeito exige `userId` ou `sessionId` e não aceita PII.

As referências usam `ON DELETE SET NULL`, preservando a medição agregada sem
bloquear o ciclo de vida de tasks/artifacts. `nba_v1` continua sendo o kill
switch funcional.

`POST /api/v1/recommendations/exposures` registra apresentação com contrato
fechado: recommendation key, target tool, variante e rank. Auth vem da sessão;
anônimos usam chave opaca validada e pseudonimizada. O cliente não informa IDs
persistidos nem contexto canônico neste slice.

`POST /api/v1/recommendations/exposures/{id}/click` marca o primeiro clique para
a mesma identidade da exposição. Repetições são idempotentes e não alteram o
timestamp original; ownership/sessão fazem parte do filtro de escrita.

`completeRecommendationExposure` é writer interno, sem endpoint público. Ele só
liga `completedTaskId` após confirmar, em transação, sujeito, clique anterior,
task concluída e ferramenta igual ao target assinado/ranqueado.
