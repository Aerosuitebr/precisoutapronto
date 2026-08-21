# ADR-002 — Estratégia de identificadores

Status: aceito
Data: 2026-08-21

## Contexto

O schema existente mistura CUID textual em entidades de conta/documentos e UUID nativo em entidades operacionais. Converter IDs legados seria destrutivo e não agrega valor às primeiras sprints.

## Decisão

Adotar compatibilidade híbrida:

- IDs existentes permanecem inalterados.
- Novas entidades de domínio do blueprint usam UUID v4 armazenado como `UUID` nativo do PostgreSQL.
- FKs para entidades legadas mantêm o tipo real da origem; por exemplo, `user_id` continua textual ao referenciar `users.id`.
- IDs públicos, tokens e tracking tokens não reutilizam PKs internas.
- `ProductEventDTO.eventId` usa UUID gerado no produtor para idempotência; a linha persistida usa esse mesmo UUID como chave.
- DTOs tratam identificadores como strings opacas e não inferem formato no cliente.

## Motivos

UUID fornece geração distribuída segura para eventos e novos módulos sem exigir uma sequência central. Preservar CUID evita migração de PK/FK, invalidação de cache, alteração de contratos e risco de perda de dados.

## Consequências

Repositories e DTOs devem aceitar relações entre UUIDs novos e IDs textuais legados. Nenhum endpoint deve expor a estratégia interna como requisito de negócio.
