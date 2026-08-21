# ADR-001 — Banco e mecanismo de migrations

Status: aceito
Data: 2026-08-21

## Contexto

O monólito usa PostgreSQL, Prisma 5.22, um schema único e migrations SQL versionadas. Produção já executa `prisma migrate deploy`; `prisma db push` também está exposto para desenvolvimento.

O blueprint exige evolução aditiva, rollback operacional e compatibilidade entre releases.

## Decisão

PostgreSQL continua sendo o banco transacional e Prisma Migrate continua sendo o mecanismo oficial de mudança de schema.

- Toda alteração de release entra em `prisma/migrations/<timestamp>_<nome>/migration.sql`.
- `prisma migrate deploy` é o único comando de aplicação de schema em staging/produção.
- `prisma db push` fica restrito a prototipagem local descartável e nunca substitui migration versionada.
- Migrations seguem `expand -> deploy compatível -> backfill opcional -> switch por flag -> cleanup posterior`.
- Sprints 0/1 não executam `DROP`, `RENAME`, alteração destrutiva de tipo ou constraint que exija reescrita obrigatória de dados existentes.
- Seeds necessários a runtime devem ser idempotentes e separados de fixtures de teste.
- Writers novos ficam desligados por padrão e precisam tolerar ausência temporária de consumidores/readers.

## Verificação obrigatória

Cada migration deve ser validada em:

1. banco limpo criado pelo histórico completo;
2. upgrade a partir do schema imediatamente anterior;
3. aplicação repetida do seed idempotente, quando houver;
4. build com Prisma Client regenerado;
5. rollback operacional por flag, sem depender de rollback de schema.

## Consequências

O banco permanece único e não surge infraestrutura paralela. Rollback de release desliga comportamento novo, mas normalmente preserva tabelas/colunas aditivas até um cleanup futuro explicitamente aprovado.
