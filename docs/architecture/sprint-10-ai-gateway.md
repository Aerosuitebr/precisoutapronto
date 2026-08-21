# Sprint 10 — AI Gateway e Safety

## Fundação V010

A V010 adiciona `ai_interactions` sem ativar modelos, alterar ferramentas ou
introduzir chamadas externas. Não há backfill.

A tabela armazena identidade pseudonimizada/autenticada, capability, model key,
versão do prompt, hash SHA-256 da entrada, saída estruturada sanitizada, resultado
de safety, latência, custo estimado e aceite opcional.

Não existe coluna de prompt ou input bruto. `outputJson` deve aceitar somente
campos estruturados allowlisted e nunca texto livre sensível. `ai_router_beta` e
`ai_prefill_beta` continuam desligadas por padrão.

`recordAiInteraction` é writer interno e não recebe prompt bruto. O contrato
aceita somente `inputHash`, output escalar allowlisted, safety categórico,
latência e custo limitados. A flag é escolhida pela capability.
