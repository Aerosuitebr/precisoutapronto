# Ciclo de CTR e funil — 02/09/2026 a 28/09/2026

## Regra do teste

Não alterar títulos, descrições, H1 ou promessa inicial das sete URLs antes de 28/09/2026. A comparação exige duas janelas equivalentes ou pelo menos 100 impressões por URL. Mudanças necessárias por erro factual, jurídico ou técnico devem ser registradas como interrupção do teste.

## Variantes publicadas

| URL | Ângulo principal |
|---|---|
| `/orcamento-com-pix` | grátis + WhatsApp + aprovação + Pix |
| `/recibos/recibo-pagamento-pix` | comprovante versus recibo + PDF grátis |
| `/gerador-de-proposta-comercial` | sem cadastro + PDF + WhatsApp |
| `/gerador-de-contrato` | teste sem cadastro + revisão + PDF para assinar |
| `/gerador-de-recibo` | grátis + valor por extenso + PDF no celular |
| `/orcamento-para/eletricista` | faixa de preço + modelo + aprovação + Pix |
| `/orcamento-para/pedreiro` | etapas + faixa de preço + cronograma + Pix |

O sitemap canônico continua limitado a 30 URLs. `/gerador-de-contrato` entra no ciclo no lugar de `/gerador-de-referencias-abnt`, reforçando a concentração em orçamento, formalização, cobrança e recibo.

## Critérios de decisão em 28/09

- CTR: comparar apenas URLs com amostra útil; não escolher vencedor por uma única impressão.
- Posição: segmentar consultas de marca e não marca.
- Resultado de negócio: observar `CTA→link`, `envio→aprovação` e compra por `landing_path`.
- Conteúdo: preservar a variante quando o CTR cair, mas a taxa de aprovação ou compra subir de forma consistente.

## Evidência e estudos de caso

Exemplos fictícios permanecem identificados como demonstrativos. Um estudo de caso só pode ser publicado quando houver autorização documentada ou dados agregados acima do piso de privacidade, período de observação, denominadores e metodologia. Não transformar indicadores pequenos em alegações de resultado.

Os primeiros dois casos candidatos são:

1. orçamento de eletricista: início → link → WhatsApp → visualização → aprovação;
2. orçamento de pedreiro: início → link → WhatsApp → visualização → aprovação.

Até haver amostra suficiente, as páginas exibem somente fatos verificáveis do produto e indicadores agregados liberados por `/api/stats/public`.

## Export semanal

Exportar do GA4 `landing_path`, `event_name` e `event_count` e executar:

```bash
npm run seo:dashboard -- --gsc paginas.csv --queries consultas.csv --funnel funil.csv --output docs/seo/painel-semanal-AAAA-MM-DD.md
```

Eventos do funil: `landing_cta_click`, `quote_started`, `quote_preview_ready`, `quote_link_created`, `quote_whatsapp_send_completed`, `quote_recipient_view`, `quote_approved`, `begin_checkout` e `purchase`.
