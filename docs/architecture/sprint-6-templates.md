# Sprint 6 — duplicação e templates pessoais

## Fundação V006

A migração V006 adiciona somente `personal_templates` e conecta o campo
`artifacts.templateId`, já reservado na V004. Não existe backfill, alteração de
payload legado ou ativação automática.

O template mantém proprietário, artifact canônico de origem, ferramenta, nome,
payload estrutural sanitizado, visibilidade e status. A origem usa `ON DELETE
RESTRICT`; instâncias usam `ON DELETE SET NULL`, preservando artifacts.

As flags `duplicate_v1` e `personal_templates_v1` continuam desligadas. Community
permanece não exposta nesta etapa; sua indexação exige moderação e gate próprios.

## Próximos slices compatíveis

1. contrato allowlist de payload portável por ferramenta;
2. duplicação autenticada e owner-scoped para novo draft;
3. criação e instanciação de template pessoal;
4. instrumentação de `continuity.duplicated` e tempo até outcome.

## Slice de duplicação canônica

`POST /api/v1/artifacts/{id}/duplicate` exige sessão, origem confiável, UUID e
ownership. O writer cria nova task e novo artifact privado em uma transação,
marca `duplicatedFromId`, recalcula timestamps e não altera a origem. O payload
portável usa allowlist estrutural estrita; campos livres e PII são descartados.
Depois da transação concluída, o endpoint tenta emitir `continuity.duplicated`
com IDs canônicos e ferramenta. Analytics é não bloqueante e não altera o 201.

`POST /api/v1/templates` salva um artifact owned como template pessoal privado.
O contrato aceita somente `sourceArtifactId` e `name`; o servidor deriva owner e
tool, sanitiza novamente o payload e não oferece publicação community neste slice.

`POST /api/v1/templates/{id}/instantiate` cria task e artifact draft privados a
partir de um template ativo do próprio usuário. O novo artifact referencia
`templateId`; o template e o artifact de origem não são alterados.

`GET /api/v1/templates` lista somente metadados de templates privados ativos do
usuário, com paginação por cursor. O payload sanitizado não sai nessa listagem.

`DELETE /api/v1/templates/{id}` arquiva logicamente apenas template privado ativo
do owner autenticado. A linha e todos os artifacts que referenciam o template
permanecem preservados.

`POST /api/v1/templates/{id}/restore` reativa somente template privado arquivado
do owner autenticado, reutilizando a mesma linha e mantendo todas as referências.
