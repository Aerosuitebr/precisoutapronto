# Sprint 0 — baseline técnico e de produto

Data: 2026-08-21

Status: baseline de repositório concluído; baseline de produção pendente de dados agregados.

## Objetivo

Fixar uma referência reproduzível antes da introdução de eventos canônicos, flags, Intent Graph ou novas entidades. Este baseline não muda páginas, ferramentas, banco ou contratos públicos.

## Superfície versionada

- 158 arquivos `page.tsx`.
- 45 Route Handlers em `src/app/api`.
- 22 specs Playwright.
- 7 migrations Prisma após o baseline inicial, na data da coleta.
- 20 URLs críticas formalizadas em `scripts/seo/tier-fixtures.json`: 10 Tier 0 e 10 Tier 1.

Os números são um snapshot informativo. A lista de URLs é o contrato versionado usado para regressão.

## Outcomes P0 — definição inicial

| Ferramenta/família | Outcome primário observável | Sinais legados atuais | Evento canônico futuro |
| --- | --- | --- | --- |
| Orçamento com Pix | link/artefato criado e pronto para envio | `document_completed`, `quote_link_created` | `task.completed` + `outcome.shared` |
| Recibo | PDF gerado | `document_completed` | `task.completed` + `outcome.downloaded` |
| Contrato | PDF gerado | `document_completed` | `task.completed` + `outcome.downloaded` |
| Proposta comercial | PDF gerado | `document_completed` | `task.completed` + `outcome.downloaded` |
| Currículo | PDF gerado | eventos específicos do fluxo a confirmar | `task.completed` + `outcome.downloaded` |
| Pix | código Copia e Cola produzido/copiado | `pix_copied` | `task.completed` + `outcome.copied` |
| Calculadoras | resultado calculado e exibido | eventos de share; first value irregular | `task.completed` |
| PDF/imagem | arquivo transformado e baixado | varia por ferramenta | `task.completed` + `outcome.downloaded` |
| Redação ENEM | revisão concluída e resultado apresentado | analytics vertical do assistente | `task.completed` |

Esta tabela define semântica, não autoriza renomear eventos legados. O mapeamento será dual-write durante a migração.

## Baseline SEO

O catálogo inicial está em `scripts/seo/tier-fixtures.json`. Cada entrada fixa:

- tier de criticidade;
- caminho público;
- arquivo de rota esperado;
- intenção de indexabilidade.

A auditoria estática valida a integridade do catálogo e a existência das rotas. A etapa HTTP da Sprint 1 adicionará status, canonical absoluto parametrizado por origem, robots, title, H1, conteúdo essencial e links internos.

## Métricas que exigem produção

O repositório não contém dados suficientes para declarar com honestidade:

- top 20 entradas por sessões orgânicas;
- top outcomes por conclusão;
- taxa de conclusão por ferramenta;
- retenção e repetição por usuário/coorte;
- share rate e recipient activation de todas as famílias;
- jornadas cruzadas mais frequentes.

Esses números serão anexados somente a partir de export agregado, sem PII, com ambiente, janela e timestamp registrados. Até lá, não há ranking presumido.

## Coleta mínima necessária

1. GA4: landing page, source/medium, tool start, outcome e share por janela de 28 dias.
2. Banco: contagens agregadas de artefatos persistidos, documentos compartilhados e outcomes de orçamento.
3. Clarity: apenas diagnóstico qualitativo agregado; não é fonte canônica de conversão.
4. Registro da cobertura: percentual de outcomes P0 que já emitem sinal utilizável.

## Guardrails do baseline

- Analytics opcional não pode bloquear outcome.
- Nenhuma consulta exporta nomes, e-mails, CPF/CNPJ, conteúdo de documentos ou dados bancários.
- Mudança de marca/domínio deve ser parametrizada por ambiente nos testes.
- Tier 0/1 só muda por revisão explícita, com justificativa de SEO.
- Página privada, recipient link e conteúdo unlisted permanecem fora do sitemap e `noindex` por padrão.

## Critério de saída da Sprint 0

- [x] Estado atual documentado.
- [x] Tier 0/1 versionado.
- [x] Outcomes P0 definidos semanticamente.
- [x] Auditoria estática desacoplada do nome legado no title template.
- [ ] Export agregado de produção anexado.
- [ ] Baseline de conclusão/share calculado com janela definida.
- [ ] ADR-001, ADR-002, ADR-004 e ADR-005 aceitos antes das migrations V001/V002.
