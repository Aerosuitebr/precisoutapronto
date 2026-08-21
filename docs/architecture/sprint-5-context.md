# Sprint 5 — Context foundation (V005)

## Escopo desta entrega

A V005 cria apenas `user_business_profiles` e `customers`. Não existem writers,
readers, endpoints, UI, backfill ou dual-write nesta etapa. A flag
`reusable_context_v1` permanece desativada.

Campos sensíveis são `BYTEA` para receber envelopes autenticados conforme a
ADR-003. `displayName`, `preferencesJson` e `metadata` não poderão receber PII
fora de allowlists ainda não implementadas. A ausência do provider de chaves é
um bloqueador explícito para qualquer persistência.

O provider de chave por ambiente e o envelope `RJCTX` v1 já estão implementados.
A chave precisa ser base64 canônico de exatamente 32 bytes e possuir versão
explícita. O envelope usa nonce aleatório de 96 bits, AES-256-GCM, tag de 128 bits
e associated data vinculando entidade, registro, proprietário e campo. Erros de
configuração, versão, integridade ou escopo retornam `null` e não expõem plaintext.

Rotação usa `CONTEXT_ENCRYPTION_KEYS_JSON` como mapa versão→chave e
`CONTEXT_ENCRYPTION_ACTIVE_VERSION` para novas cifras. Até oito versões podem ser
mantidas para leitura. As variáveis singulares anteriores continuam aceitas como
fallback de uma única chave.

O contrato de perfil exige `consent: true`, `consentVersion: context-v1` e modo
`patch` ou `replace`. Campos, objetos de endereço/Pix e preferências usam
allowlists fechadas; propriedades desconhecidas, updates vazios e valores fora
dos limites são rejeitados antes de qualquer criptografia. A prova mínima de
consentimento será persistida em `consentVersion` e `consentedAt`.

## Compatibilidade

- `UserProfile`, dados de Orçamento e documentos existentes não são alterados.
- Não há FK com exclusão em cascata para usuários legados.
- Nenhum dado existente é inferido ou copiado sem consentimento/necessidade.
- Rollback operacional: manter `reusable_context_v1` desligada.
