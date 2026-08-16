# Métricas do loop viral de Orçamento + Pix

## Métrica central

**Novos criadores atribuídos a cada 100 orçamentos compartilhados**

```text
K100 = 100 × usuários únicos com quote_link_created.recruited_from_document
       ÷ usuários únicos com document_shared(tool_name = orcamentos)
```

O numerador deve considerar apenas o primeiro orçamento criado por cada novo usuário/origem. Não somar recriações do mesmo destinatário.

## Eventos disponíveis

| Etapa | Evento | Chaves principais |
|---|---|---|
| Orçamento iniciado | `quote_started` | `public_access`, `source_occupation` |
| Link criado | `quote_link_created` | `source_document`, `quote_value`, `recruited_from_document`, `source_occupation` |
| Compartilhamento | `document_shared` | `tool_name=orcamentos`, `output` |
| Destinatário abriu | `quote_recipient_view` | `source_document`, `quote_status` |
| Cliente aprovou | `quote_approved` | `source_document`, `quote_value` |
| CTA viral clicado | `quote_recipient_recruit_click` | `source_document`, `source_occupation`, `placement` |
| Convite indicado | `referral_invite_shared` | `channel` |

## Funil semanal

1. Links de orçamento criados.
2. Links efetivamente compartilhados.
3. Destinatários que visualizaram.
4. Orçamentos aprovados.
5. Destinatários que clicaram em “Criar meu orçamento grátis”.
6. Novos criadores com `recruited_from_document`.
7. Indicações ativadas e recompensas Premium concedidas.

## Segmentação obrigatória

- `source_occupation`: eletricista, pintor, instalador de ar-condicionado, designer ou manutenção residencial.
- `placement`: card ou barra fixa pós-aprovação.
- dispositivo: mobile versus desktop.
- origem: orgânico, parceiro/embed, conteúdo compartilhável e documento público.

## Meta inicial de validação

Não publicar uma promessa de volume até haver amostra suficiente. Usar internamente:

- ≥ 60% dos links criados efetivamente compartilhados.
- ≥ 40% dos links compartilhados visualizados pelo cliente.
- ≥ 2 novos criadores por 100 documentos compartilhados.
- Acompanhar semanalmente por profissão antes de ampliar novas páginas.
