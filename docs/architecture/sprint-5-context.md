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

Cada envelope carrega sua própria versão de chave. Portanto, um patch pode cifrar
um campo com a chave ativa sem tornar ilegíveis os demais campos ainda protegidos
por versões anteriores; a coluna de versão no registro é apenas observabilidade
da última escrita.

O contrato de perfil exige `consent: true`, `consentVersion: context-v1` e modo
`patch` ou `replace`. Campos, objetos de endereço/Pix e preferências usam
allowlists fechadas; propriedades desconhecidas, updates vazios e valores fora
dos limites são rejeitados antes de qualquer criptografia. A prova mínima de
consentimento será persistida em `consentVersion` e `consentedAt`.

`context_audit_events` registra ator, entidade, ação, data, versão de consentimento
e somente nomes allowlisted dos campos alterados. Valores, ciphertext, snapshots,
IP, e-mail e documentos não pertencem ao audit trail. A tabela não possui cascade
nem FK para modelos legados.

O repository de perfil combina flag, validação, criptografia, `upsert` e audit
event em uma única transação. Ele não possui endpoint ou consumidor. `patch`
preserva campos ausentes; `replace` limpa campos ausentes. Falha de chave, flag,
contrato ou persistência retorna `null` sem escrita parcial.

`GET /api/v1/me/context` exige sessão autenticada e consulta exclusivamente pelo
`session.sub`. A flag é avaliada antes do banco. Falha em qualquer envelope torna
a resposta inteira indisponível (503), evitando perfil parcial ou mistura de
ownership; com a flag desligada, retorna `{ enabled:false, context:null }` sem
consultar a tabela.

`PUT /api/v1/me/context` exige origem same-origin, sessão, contrato válido,
consentimento e a flag `reusable_context_v1`. Não aceita `userId` do cliente. A
rota retorna erro genérico quando chave/flag/banco estão indisponíveis e nunca
inclui plaintext ou ciphertext na resposta.

Os contratos de Customer exigem consentimento `context-v1`. Create exige tipo
`person|business` e `displayName`; patch não permite mudar tipo nem definir
ownership, ID ou arquivamento. `metadata` aceita somente tags técnicas limitadas
e `source:manual`, sem notas livres ou PII.

O repository de criação de Customer avalia a flag antes do banco e executa uma
verificação suave de nome, case-insensitive, somente entre clientes ativos do
mesmo proprietário. Duplicidade retorna o ID candidato sem escrever. Uma criação
válida cifra PII e persiste Customer + audit event atomicamente.

`GET /api/v1/customers` oferece search e paginação por cursor (10/20/50), sempre
filtrando `ownerUserId` e excluindo arquivados. A lista retorna somente resumo e
metadata sanitizada, sem decifrar PII. `POST /api/v1/customers` aplica origem,
sessão, contrato e ownership do servidor; duplicidade suave responde 409.

`PATCH /api/v1/customers/{id}` aceita limpeza explícita de PII com `null`. O
repository verifica ownership e repete o filtro `id + ownerUserId + ativo` no
`updateMany` transacional antes do audit event, protegendo também contra corrida
entre autorização e escrita. IDs ausentes ou de outro usuário retornam 404.

`GET /api/v1/customers/{id}` descriptografa o detalhe somente para o proprietário
autenticado. `DELETE /api/v1/customers/{id}` faz arquivamento lógico, nunca remove
a linha, e grava `archivedAt` com o evento de auditoria na mesma transação.
`POST /api/v1/customers/{id}/restore` reverte o arquivamento com o mesmo escopo
de proprietário e registra o evento `restored` atomicamente.

## Compatibilidade

- `UserProfile`, dados de Orçamento e documentos existentes não são alterados.
- Não há FK com exclusão em cascata para usuários legados.
- Nenhum dado existente é inferido ou copiado sem consentimento/necessidade.
- Rollback operacional: manter `reusable_context_v1` desligada.
