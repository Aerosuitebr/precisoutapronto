# Recibo Pix e posicionamento para prestadores — 19/09/2026

## Implementação

- Gerador público inicia vazio; não reaproveita nomes, CPF, endereço ou data do exemplo ao exportar.
- Serviço/referência e data editáveis. Valores inteiros representam reais; valores negativos, malformados, nulos ou acima do limite não geram recibo.
- Modalidades: integral, entrada, parcela intermediária e quitação de saldo. Cálculo em centavos e bloqueio de recebimentos acima do combinado ou quitação incompleta.
- Total, pagamentos anteriores, recebimento atual e saldo entram nas observações do PDF. Nenhuma consulta ao banco ou conciliação automática é feita.
- Confirmação do recebimento antes da exportação; declaração comum dos três modelos limitada ao recebimento descrito, evitando uma frase de quitação ampla em recibos parciais.
- Página de recibo Pix liga diretamente às modalidades do gerador. Título de busca preservado para não misturar o efeito da mudança de título com o das novas chamadas.
- Página inicial e orçamento destacam MEIs/prestadores, acesso sem conta e clareza de entrada/saldo. Comparativo com fontes na página de orçamento.
- Datas do sitemap atualizadas somente nas páginas alteradas.

## Inspeção dos concorrentes

Pesquisa das páginas públicas em 19/09/2026; não houve criação de conta nem teste dos painéis pagos.

| Fonte | Oferta pública observada | Implicação |
|---|---|---|
| https://www.orcamentozap.com.br/ | Cadastro, 14 dias de teste e R$ 39/mês; orçamento, WhatsApp, Pix e acompanhamento de cobrança. Oferece também modelos gratuitos fora da plataforma. | WhatsApp e Pix não são diferenciais exclusivos. Comparação limitada à entrada na plataforma. |
| https://meuorcamentodigital.com.br/orcamento-para-eletricista | Conta e 7 dias de teste sem cartão; modelo profissional, catálogo e aprovação com assinatura. | Modelos por profissão também não são exclusivos. Mostrar o fluxo gratuito sem conta e a clareza de pagamentos parciais. |

O saldo no recibo é uma melhoria real do nosso produto. A inspeção pública não demonstra que os concorrentes não tenham esse recurso; não publicamos essa alegação. Também não equiparamos nosso Pix informado manualmente à conciliação bancária anunciada pelo concorrente.

## Medição

Base histórica: leitura registrada em 16/09, desempenho até 14/09. Página `/recibos/recibo-pagamento-pix`: 347 impressões / 6 cliques. Esse total não é uma janela de 28 dias nem prova de resultado da versão nova.

Eventos do gerador público:

- `receipt_payment_kind_selected`: troca manual de modalidade; parâmetro `payment_kind`.
- `receipt_pdf_download_completed`: exportação bem-sucedida; `payment_kind`, `template_id`, `tool_path` e atribuição da landing.
- `document_completed`: mesma conclusão no evento comum do produto; `tool_name=recibos`, `output=pdf`, `payment_kind`.
- Ambos os eventos de conclusão descrevem o mesmo download. Não somar os dois como duas conversões. Usar `document_completed` como indicador principal.
- Nenhum nome, valor recebido, serviço, CPF ou informação bancária é enviado nesses eventos.
- CTA interno para a ferramenta preserva a landing de origem. O mecanismo de consentimento existente continua controlando o carregamento do GA4.

No GA4, cadastrar `payment_kind` e, se ainda ausente, `landing_path` como dimensões personalizadas de evento. Comparar `document_completed` com inícios do gerador, sem chamar clique em CTA de recibo concluído. Essas configurações de conta não foram feitas nesta execução.

No Search Console, filtrar a URL de recibo Pix e comparar janelas completas de 28 dias antes/depois da publicação, excluindo dias não consolidados. Separar marca e não marca. Observar consultas como comprovante de Pix serve como recibo, recibo de entrada, recibo de pagamento parcial e recibo de saldo; registrar consultas realmente retornadas, sem inventar volume. Não é possível ligar a consulta individual do Google ao recibo individual no GA4: a comparação é agregada.

## Divulgação por 30 dias

Público: MEIs e prestadores que fazem orçamento pelo WhatsApp. Objetivo: orçamento criado e recibo concluído. Todos os exemplos abaixo são fictícios e devem ser identificados como demonstrações.

| Semana | Demonstrações propostas | Destino |
|---|---|---|
| 1 | Orçamento de R$ 490 no celular; entrada de R$ 150 com saldo de R$ 340 | Orçamento e recibo Pix |
| 2 | Parcela intermediária de R$ 100 após entrada; descrição do serviço no recibo | Gerador em modo parcial |
| 3 | Quitação dos R$ 340 após entrada; exemplo de orçamento para eletricista | Gerador em modo saldo e modelo de eletricista |
| 4 | Comparação de acesso sem cadastro; passo a passo orçamento → Pix recebido → recibo | Página de orçamento com comparativo e recibo Pix |

Texto pronto para demonstração de entrada:

> Recebeu R$ 150 de um serviço de R$ 490? Seu recibo precisa deixar os R$ 340 restantes claros. No Precisou, Tá Pronto, você informa o total e a entrada, confere o saldo e baixa o recibo em PDF sem cadastro. Exemplo fictício. Gere somente depois de conferir o Pix na sua conta.

Destino para YouTube: `https://precisoutapronto.com.br/recibos/recibo-pagamento-pix?utm_source=youtube&utm_medium=organic_social&utm_campaign=mei_whatsapp_2026_09&utm_content=entrada_saldo`.

Para parceiros, criar uma origem específica por publicação e apontar para o modelo profissional relevante. Conferir os contatos anteriores antes de qualquer envio. Não aplicar UTMs a links internos. Este documento prepara a divulgação; não representa mensagens enviadas ou publicações realizadas.

## Validação e publicação

- Auditoria SEO estática: 165 rotas aprovadas.
- TypeScript: aprovado.
- Fluxo do recibo: cálculo, entrada via landing, atribuição, PDF válido e uso móvel aprovados.
- Carregamento/hidratação: recibo, proposta e página inicial aprovados.
- Cobertura comercial SEO: cinco testes aprovados.
- Publicação: envio dos arquivos ao servidor bloqueado pela revisão automática por exigir autorização explícita do destino e da publicação. Site público ainda não alterado por esta execução; confirmação solicitada ao usuário.
