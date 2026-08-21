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
- PATCH interno de nodes existentes permite apenas estado, label, descrição, frequência e risco.
- Chave, tipo e metadata do node permanecem imutáveis; atualização e auditoria são transacionais.

## Compatibilidade e segurança

Nenhuma rota, canonical, H1, title, ferramenta ou fluxo existente foi modificado. `nba_v1` continua desligada e nenhum componente consulta o grafo. Os `transferSchema` nascem com allowlist vazia para impedir cópia acidental antes do slice específico de transferência.

## Próximos slices

1. Ranking NBA puro por regras, ainda sem UI, atrás de `nba_v1`.
2. Endpoint público de next actions somente após contratos e observabilidade do ranking.

## Primeiro slice da Sprint 3 — ranking sem UI

O módulo `recommendation/ranker` aplica regras determinísticas sobre edges já validados: outcome obrigatório, teto de risco, ferramenta disponível, URL interna e peso. Ordena por peso com desempate estável, limita a três ações e informa campos transferíveis sem copiar valores.

`getGatedRankedNextActions` consulta `nba_v1` antes do grafo. Flag desligada, kill switch, configuração ausente ou qualquer falha retornam lista vazia e nunca bloqueiam o outcome. Ainda não há endpoint público, tracking token, exposure ou componente visual.

`GET /api/v1/intent/next-actions?toolKey=&outcomeStatus=completed` expõe o `NextActionDTO` sem contexto privado. A rota aceita sessão autenticada ou device cookie pseudônimo, possui rate limit por hash de IP e só retorna ações quando `nba_v1` permite. Cada ação recebe token HMAC de 24 horas assinado por `NBA_TRACKING_SECRET`; segredo ausente/inválido degrada para lista vazia.

Consultar a rota não registra exposição. A resposta declara `exposureRecorded=false`; somente um componente futuro que realmente renderize as ações poderá registrar `recommendation.shown`.

`POST /api/v1/recommendations/events` aceita somente `shown` ou `clicked` com tracking token válido, device cookie e rate limit. O evento canônico usa ID determinístico derivado de token+tipo, permitindo `skipDuplicates` em retries. As propriedades contêm apenas recommendation key, target tool, variante e rank; falha de analytics responde `accepted=false` sem afetar a ação do usuário.

O piloto visual `NextActionsPanel` foi adicionado depois do card de sucesso do orçamento, sem substituir WhatsApp, cópia, preview ou share existentes. Com flag desligada ou erro, renderiza `null`. `shown` é enviado somente depois de ações existirem no estado renderizado; clique usa request `keepalive` e o link navega normalmente mesmo se analytics falhar.

Rollout permanece bloqueado até `NBA_TRACKING_SECRET` (mínimo 32 caracteres) estar configurado em staging/produção e `nba_v1` incluir apenas subjects internos. A ordem recomendada continua internal → 5% → 25% → 50% → 100%, observando task completion e p95.

`GET /api/analytics/recommendations?days=1|7|30` fornece shown, clicked, completed, CTR, completion rate, click-to-completion, edges ativos e estado de rollout. A resposta é restrita à equipe interna e não retorna tokens, propriedades, subjects, sessões ou usuários. Divisões sem denominador retornam zero, sem produzir `NaN`/`Infinity`.

O link NBA inclui `rj_rec`, que contém somente o token assinado e é removido da URL após ser guardado em `sessionStorage` pela ferramenta de destino. No piloto, a exportação bem-sucedida do PDF em Recibos envia `recommendation.completed`. O servidor confere se o target assinado é `recibos`; uma ferramenta diferente falha fechada sem emitir evento. Nenhum campo do orçamento é transferido.

## Rollback

Não remover as tabelas no rollback operacional. Como não há reader ativo, basta manter `nba_v1=false`; os fluxos atuais continuam independentes do V003.
