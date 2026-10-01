# Métricas do loop viral de Orçamento + Pix

## Métrica central

**Novos criadores identificados atribuídos a cada 100 orçamentos criados**

```text
K100 = 100 × criadores identificados cuja primeira criação histórica é indicada e ocorre na janela
       ÷ documentos criados na janela
```

O painel usa a primeira criação histórica por ownerEmail; exclui identidades nulas. Não mede pessoas anônimas nem envios efetivos. O denominador conta documentos, não pessoas. Ver `docs/growth-journey-2026-10.md` para diagnóstico por navegador e campanha.

## Eventos disponíveis

| Etapa | Evento | Chaves principais |
|---|---|---|
| Orçamento iniciado | `quote_started` | `public_access`, `source_occupation` |
| Link criado | `quote_link_created` | `source_document`, `quote_value`, `recruited_from_document`, `source_occupation` |
| Cópia do link (intenção) | `quote_link_copied` | `tool_name=orcamentos`, `output` |
| Destinatário abriu | `quote_recipient_view` | `source_document`, `quote_status` |
| Cliente aprovou | `quote_approved` | `source_document`, `quote_value` |
| CTA viral clicado | `quote_recipient_recruit_click` | `source_document`, `source_occupation`, `placement` |
| Compartilhador de convite aberto (intenção) | `referral_invite_started` | `channel`, `source_occupation`, `campaign` |

## Funil semanal

1. Links de orçamento criados.
2. Intenções de compartilhamento: copiar link ou abrir WhatsApp (separadas).
3. Destinatários que visualizaram.
4. Orçamentos aprovados.
5. Destinatários que clicaram em “Criar meu orçamento grátis”.
6. Novos criadores com `recruited_from_document`.
7. Indicações ativadas e recompensas Premium concedidas.
8. Criadores identificados com duas criações na janela e criadores que criaram em dias distintos (horário de São Paulo).

## Segmentação obrigatória

- `source_occupation`: eletricista, pintor, instalador de ar-condicionado, designer ou manutenção residencial.
- `placement`: card ou barra fixa pós-aprovação.
- dispositivo: mobile versus desktop.
- origem: orgânico, parceiro/embed, conteúdo compartilhável e documento público.

## Meta inicial de validação

Não publicar uma promessa de volume até haver amostra suficiente. Usar internamente:

- ≥ 60% dos links criados com intenção de compartilhamento; não chamar esse número de entrega confirmada.
- ≥ 40% dos links criados visualizados pelo cliente.
- ≥ 2 novos criadores identificados por 100 documentos criados (K100).
- Acompanhar semanalmente por profissão antes de ampliar novas páginas.
