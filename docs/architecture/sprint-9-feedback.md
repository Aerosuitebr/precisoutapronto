# Sprint 9 — feedback e pedidos de resolução

## Fundação V009

A V009 adiciona `helpfulness_feedback` e `resolution_requests` sem alterar
feedback, suporte, busca ou formulários existentes. Não há backfill.

Feedback usa rating fechado (`resolved`, `partial`, `not_resolved`), target
genérico e detalhe opcional limitado. Pedidos preservam texto bruto limitado,
intenção normalizada opcional, origem e workflow de status fechado.

Identidade anônima deve ser pseudonimizada no servidor. Writers futuros devem
aplicar detecção/redação de PII antes de persistir texto livre e rate limiting
antes da escrita.

`POST /api/v1/feedback/helpfulness` aplica contrato fechado, mesma origem e rate
limit antes do banco. Identidade anônima é pseudonimizada; detalhe sofre redação
de e-mail, telefone e CPF/CNPJ antes de ser persistido.

`POST /api/v1/feedback/resolution-requests` recebe texto e origem allowlisted,
redige PII e deriva `normalizedIntent` no servidor. O workflow sempre nasce em
`received`; identidade e rate limiting seguem o mesmo contrato de helpfulness.

Após a escrita confirmada, os endpoints tentam emitir `feedback.helpfulness` e
`request.resolution_gap`. Analytics recebe somente target/rating ou intenção
normalizada/origem; texto livre e detalhe nunca entram nas propriedades.
