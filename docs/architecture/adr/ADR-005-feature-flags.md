# ADR-005 — Feature flags e experimentação

Status: aceito
Data: 2026-08-21

## Contexto

Não há provider canônico de flags. O blueprint exige rollout gradual, assignment estável, exposição mensurável e rollback sem remoção de schema.

## Decisão

Implementar provider interno no monólito usando PostgreSQL, com `feature_flag` e `experiment_assignment`.

- Toda flag desconhecida ou indisponível resolve para `off`.
- Flags novas nascem desabilitadas e com rollout zero.
- Bucketing percentual é determinístico por `flag key + subject key`.
- Subject autenticado usa ID interno; anônimo usa identificador pseudônimo estável, nunca e-mail/IP.
- Regras server-side são avaliadas em módulo puro e compartilhável, sem chamada de rede externa.
- Assignments de experimentos que precisam estabilidade entre mudanças de rollout são persistidos.
- Exposição só é registrada quando a experiência controlada é realmente apresentada.
- Falha na persistência de exposição não bloqueia a feature nem o outcome.

## Cache e consistência

A primeira versão usa cache curto em memória por processo. Alterações aceitam consistência eventual; rollback de emergência também pode ser aplicado por variável de ambiente de kill switch para as iniciativas P0.

## Administração

Não haverá painel público na primeira versão. Alterações são feitas por seed/migration idempotente ou endpoint interno autenticado e auditado, conforme o slice aprovado.

## Rollout padrão

`internal -> 5% -> 25% -> 50% -> 100%`, com gates de conclusão, erro, latência e SEO. Cada iniciativa documenta sua métrica primária, guardrails e procedimento de rollback.

## Consequências

O produto ganha rollback operacional sem dependência externa. Se volume ou governança justificarem um provider dedicado no futuro, a interface interna permite trocar o adapter sem alterar consumidores.
