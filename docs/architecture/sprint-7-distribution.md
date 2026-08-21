# Sprint 7 — distribuição e recipient loop

## Fundação V007

A V007 adiciona `share_links` e `share_events` ao modelo canônico. Não altera
rotas, tokens, tabelas ou páginas de compartilhamento legadas e não executa
backfill.

`share_links` referencia um artifact e armazena exclusivamente SHA-256 do token,
nunca o segredo em claro. Canal e campanha são metadados internos limitados;
expiração e revogação são independentes.

`share_events` registra eventos por link usando recipient pseudonimizado. Metadata
é reservada para propriedades allowlisted e nunca deve carregar PII.

Todo link canônico nasce `unlisted/noindex`. Nenhuma rota community ou entrada em
sitemap é criada nesta etapa. `share_attribution_v1` e `recipient_cta_v1`
continuam desligadas por padrão.

`POST /api/v1/artifacts/{id}/share-links` cria link apenas para artifact owned.
O segredo aleatório de 256 bits aparece somente na resposta de criação; o banco
recebe apenas SHA-256 hexadecimal. Canal, campanha e validade usam allowlists e o
writer permanece atrás de `share_attribution_v1`.
Depois do commit do link, o endpoint tenta emitir `outcome.shared` com artifact,
share link e canal. A emissão é não bloqueante e nunca invalida o `201`.

`GET /api/v1/shares/{token}` deriva o hash antes da consulta, rejeita links
revogados/expirados e retorna somente metadados canônicos mínimos. A resposta usa
`private, no-store` e `X-Robots-Tag: noindex, nofollow, noarchive`.

`POST /api/v1/shares/{token}/events` registra `opened` ou `recipient_action`.
O recipient fornece apenas chave opaca validada, que é hasheada com escopo antes
da persistência. Ações usam allowlist e metadata nunca recebe campos livres.

`DELETE /api/v1/share-links/{id}` revoga logicamente somente link criado pelo
usuário autenticado. Link, artifact e eventos permanecem preservados.
