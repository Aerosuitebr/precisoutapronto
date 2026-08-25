# NuPay for Business (Precisou, Tá Pronto)

Pagamento Premium via app Nubank (fluxo **NuPay 2FA com Sessões**), em paralelo a Mercado Pago e Stripe.

Documentação oficial da API: https://docs.nupaybusiness.com.br/checkout/docs/openapi/index.html

## Pré-requisitos comerciais

1. Cadastro/contrato em [NuPay for Business](https://nupaybusiness.com.br) (produto Nu Enterprises).
2. Aguardar e-mail de ativação do **Painel do Cliente** (Administrador Master).
3. Painéis:
   - Sandbox: https://sandbox-painel.spinpay.com.br
   - Produção: https://painel.spinpay.com.br
4. Em **Credentials**, copiar **APP KEY** e **APP TOKEN**.

Sem essas chaves a API responde 503 e o logo NuPay em `/conta` não consegue abrir o checkout.

## Variáveis de ambiente

```env
NUPAY_MODE=sandbox
NUPAY_APP_KEY=
NUPAY_APP_TOKEN=
```

Em produção (`NUPAY_MODE=production`):

- API: `https://api.spinpay.com.br`
- Webhook público: `https://precisoutapronto.com.br/api/webhooks/nupay`

No Vultr, as vars entram em `/opt/precisoutapronto/.env.production` (o compose já repassa `NUPAY_*` ao container).

## Fluxo oficial (2FA com Sessões)

Conforme a OpenAPI NuPay:

1. Cliente escolhe NuPay em `/conta` → `/checkout?method=nupay` e informa CPF.
2. `POST /api/billing/checkout-nupay` → `POST /v1/checkouts/sessions` (headers `X-Merchant-Key` / `X-Merchant-Token`).
3. Redirect para `redirectUrl` (app Nubank).
4. Após aprovar, retorno em `returnUrl` com `sessionId` (e `approvalCode` na query). Se cancelar: `state=canceled`.
5. `GET /api/billing/confirm-nupay` consulta `GET /v1/checkouts/sessions/{sessionId}`.
6. Com status `approved`, cria o pagamento: `POST /v1/checkouts/payments` com `approvalCode` + `selectedPaymentOption`.
7. Status `AUTHORIZED` / `COMPLETED` libera Premium.
8. Webhook em `callbackUrl` (`POST /api/webhooks/nupay`) reforça a liberação (payload de sessão traz só `sessionId` + `reference` — o status é reconsultado na API).

Erros comuns da API:

| HTTP | Situação | Tratamento no app |
| --- | --- | --- |
| 409 | `reference` já usado | Novo `reference` único por tentativa |
| 412 | CPF não elegível NuPay | Mensagem pedindo outro método |

## Código

- [`src/lib/nupay.ts`](../src/lib/nupay.ts)
- [`src/app/api/billing/checkout-nupay/route.ts`](../src/app/api/billing/checkout-nupay/route.ts)
- [`src/app/api/billing/confirm-nupay/route.ts`](../src/app/api/billing/confirm-nupay/route.ts)
- [`src/app/api/webhooks/nupay/route.ts`](../src/app/api/webhooks/nupay/route.ts)
- UI: `/checkout?method=nupay` + logo em [`payment-methods-grid.tsx`](../src/components/billing/payment-methods-grid.tsx)
