# ADR-003 — Criptografia de PII e contexto

## Status

Aceita para a fundação de dados; implementação do provider de chaves obrigatória
antes de qualquer writer.

## Contexto

A V005 introduz perfil de negócio e clientes reutilizáveis. CPF/CNPJ, nome legal,
e-mail, telefone, endereço e dados Pix podem identificar pessoas ou expor dados
financeiros. A especificação proíbe migração automática sem consentimento ou
necessidade e exige PII cifrada.

## Decisão

- Criptografia será feita na aplicação com AES-256-GCM e envelope versionado.
- Produção deverá obter a chave por um `ContextKeyProvider`; chave não será salva
  no banco, logs, bundle cliente ou código-fonte.
- Cada campo sensível será persistido como `BYTEA`, contendo versão, nonce,
  ciphertext e authentication tag. `encryptionKeyVersion` identifica a chave.
- Associated data vinculará ciphertext a entidade, registro, proprietário e campo,
  impedindo transplante entre registros.
- Writers falharão fechados quando a chave estiver ausente ou inválida.
- Leituras exigirão autenticação, ownership e audit trail sem conteúdo sensível.
- `displayName` poderá permanecer em texto para busca/listagem consentida;
  `metadata` e preferências terão schema allowlist sem PII.
- Nenhum backfill será executado nesta fase.

## Compatibilidade e rollback

As tabelas são novas e não possuem consumidor. Rollback operacional consiste em
manter `reusable_context_v1` desligada. Tabelas e dados não serão removidos por
rollback de aplicação.

## Pendências antes do writer

1. Implementar e testar `ContextKeyProvider`, rotação e compatibilidade de versão.
2. Definir consentimento, retenção, exportação e exclusão por proprietário.
3. Implementar audit trail e testes de ownership/IDOR.
4. Revisar classificação campo a campo e schemas de preferências/metadata.

O envelope criptográfico e o provider de ambiente foram concluídos, incluindo
keyring com até oito versões e escolha independente da versão ativa. Permanecem
pendentes consentimento, retenção, audit trail e ownership antes da criação dos
endpoints de escrita.
