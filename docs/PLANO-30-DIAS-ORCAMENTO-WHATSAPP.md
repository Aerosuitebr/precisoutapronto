# Plano de 30 dias — Orçamento + aprovação + Pix no WhatsApp

## Regra de foco por 90 dias

Toda comunicação principal deve vender este resultado:

> O jeito mais rápido de o prestador enviar um orçamento profissional, conseguir a aprovação e cobrar no Pix pelo WhatsApp.

Currículo, ENEM, PDF, rescisão e demais ferramentas continuam indexáveis e disponíveis no catálogo, mas não entram no calendário principal de distribuição.

Públicos prioritários: eletricistas, pintores, instaladores, técnicos, designers/freelancers e oficinas/prestadores locais.

## Métrica norteadora

**Orçamentos aprovados por semana.**

Funil obrigatório no GA4:

1. `quote_started` — começou a preencher.
2. `quote_preview_ready` — chegou a uma prévia enviável.
3. `quote_link_created` — criou o link.
4. `quote_whatsapp_send_started` — iniciou o envio.
5. `quote_whatsapp_send_completed` — concluiu o envio conhecido.
6. `quote_recipient_view` — cliente abriu.
7. `quote_approved` — cliente aprovou.
8. `quote_adjustment_requested` — cliente pediu ajuste.
9. `quote_recipient_recruit_click` — destinatário quis criar o próprio.
10. `signup_completed` com `signup_origin=quote_recipient` — destinatário criou conta.
11. `quote_link_created` com `recruited_from_document` — indicado enviou o primeiro orçamento.

Painel semanal:

| Métrica | Meta inicial |
| --- | ---: |
| Prestadores ativados | 100 |
| Orçamentos enviados | 300 |
| Taxa de abertura | ≥ 30% |
| Taxa de aprovação | ≥ 10% dos enviados |
| Novos criadores vindos de documentos | ≥ 5 |
| Segundo orçamento em até 7 dias | medir baseline na semana 1 |

Nunca preencher ausência de dado como zero silenciosamente. Nunca publicar números aproximados como se fossem auditados.

## Cadência semanal

- 15 vídeos verticais publicados.
- 20 contatos personalizados com microcriadores.
- 10 abordagens para contadores, agências e consultores de MEI.
- 5 participações úteis em comunidades profissionais, sem spam.
- 5 entrevistas curtas com usuários ou prestadores do público-alvo.
- Sexta-feira: revisar o funil, escolher o melhor segmento e interromper formatos sem ativação.

## Roteiro-base de 20 segundos

1. 0–3s: “Ainda manda o preço assim no WhatsApp?” e mostrar uma mensagem solta.
2. 3–7s: preencher ou colar serviço e valor.
3. 7–11s: mostrar o orçamento profissional no celular.
4. 11–14s: cliente toca em Aprovar.
5. 14–17s: mostrar a cobrança Pix.
6. 17–20s: “Faça seus 2 primeiros grátis — Resolva Jato”.

## 15 ganchos para a primeira semana

1. Eletricista: “Pare de mandar material + mão de obra em cinco mensagens.”
2. Pintor: “O cliente pediu preço de dois quartos. Responda assim.”
3. Instalador: “Equipamento, instalação e deslocamento sem confusão.”
4. Técnico: “Diagnóstico não é orçamento. Separe os dois.”
5. Designer: “Proposta com cara de agência sem abrir o Word.”
6. Oficina: “Peças e serviço aprovados antes de começar.”
7. “Preço solto no WhatsApp versus orçamento profissional.”
8. “O que o cliente vê quando abre seu orçamento.”
9. “Como cobrar entrada no Pix depois da aprovação.”
10. “Seu cliente não precisa instalar aplicativo.”
11. “Três informações que evitam pedido de desconto.”
12. “Como saber que o cliente aprovou o combinado.”
13. “Transforme uma conversa em orçamento em dois minutos.”
14. “O erro de começar o serviço sem validade e escopo.”
15. “Do orçamento ao recibo no mesmo fluxo.”

Cada publicação deve usar uma URL por segmento, por exemplo:

`https://resolvajato.com.br/orcamento-com-pix?profissao=eletricista&utm_source=instagram&utm_medium=organic_social&utm_campaign=orcamento_eletricista`

## Entrevista de 10 minutos

1. Como você manda preço hoje?
2. Qual foi a última vez que um cliente sumiu depois do orçamento?
3. Quanto tempo você leva para montar e enviar?
4. O que o cliente mais pede para ajustar?
5. Você cobra entrada? Como envia o Pix?
6. Teste o Resolva Jato sem ajuda e diga onde hesitou.
7. Você enviaria este link a um cliente real hoje? Por quê?

Não pedir elogio. Registrar profissão, canal atual, objeção e se houve envio real.

## Decisão ao final de cada semana

Para cada profissão, comparar:

- custo ou esforço por visita;
- `quote_started / landing_view`;
- `quote_whatsapp_send_completed / quote_started`;
- `quote_approved / quote_whatsapp_send_completed`;
- segundo orçamento em sete dias;
- recrutados por 100 destinatários.

Na semana seguinte, 60% do conteúdo vai para o melhor segmento, 30% para o segundo e 10% para novas hipóteses.

## Dependências externas

Publicações, contatos, entrevistas e lançamentos em diretórios exigem acesso às contas e revisão humana. Usar os textos existentes em `docs/KIT-DISTRIBUICAO-VIRAL.md`; não automatizar spam, avaliações ou depoimentos.
