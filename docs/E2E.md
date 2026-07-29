# Testes E2E do Resolva Jato (staging)

## Modelo híbrido

| Camada | Ferramenta | Papel |
|--------|------------|--------|
| **Gate** | Playwright | Pass/fail determinístico. Bloqueia promover para produção. |
| **UX** | Browser Use (IA) | Relatório de experiência. Soft: não derruba o deploy sozinho. |

Fluxo:

1. `Deploy Resolva Jato Vultr` com target **staging**
2. Job reutilizável **E2E Staging Gate** roda Playwright
3. Se Playwright passar, Browser Use gera `ux-report.md`
4. Commit status `e2e/staging=success` é gravado no SHA
5. Deploy **production** só segue se esse status existir (últimas 24h), salvo `skip_e2e_gate`

## Rodar local contra staging

```bash
npm ci
npx playwright install chromium
npm run test:e2e:staging
```

Base URL padrão: `https://staging.resolvajato.com.br`  
Override: `E2E_BASE_URL=https://outro.host npm run test:e2e`

### Cloudflare Access (se o staging estiver protegido)

Exporte o service token:

```bash
# Windows PowerShell
$env:E2E_CF_ACCESS_CLIENT_ID="..."
$env:E2E_CF_ACCESS_CLIENT_SECRET="..."
npm run test:e2e:staging
```

Os headers `CF-Access-Client-Id` / `CF-Access-Client-Secret` são injetados em [`playwright.config.ts`](../playwright.config.ts).

### UI mode

```bash
npm run test:e2e:ui
```

## Specs do gate (v1)

- [`e2e/home-locale.spec.ts`](../e2e/home-locale.spec.ts): `/` não redireciona para `/en` com cookie `rj_locale=en`
- [`e2e/quote-pix-en.spec.ts`](../e2e/quote-pix-en.spec.ts): preço `1000` atualiza total; Generate nunca é silencioso
- [`e2e/orcamento-pt-smoke.spec.ts`](../e2e/orcamento-pt-smoke.spec.ts): páginas PT de orçamento carregam

## Agente UX (Browser Use)

```bash
cd e2e-agent
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
set E2E_LLM_API_KEY=sk-...   # ou OPENAI_API_KEY
python run_ux_agent.py
```

Saídas:

- `e2e-agent/artifacts/ux-report.json`
- `e2e-agent/artifacts/ux-report.md`

No CI a etapa UX usa `continue-on-error: true` e `E2E_UX_SOFT=1`. Sem chave de LLM, o agent grava relatório `skipped` e segue.

## Secrets no GitHub

| Secret | Uso |
|--------|-----|
| `E2E_LLM_API_KEY` | OpenAI (ou compatível) para Browser Use |
| `E2E_CF_ACCESS_CLIENT_ID` | Service token CF Access (opcional) |
| `E2E_CF_ACCESS_CLIENT_SECRET` | Service token CF Access (opcional) |

Deploy Vultr continua com `VULTR_*` já existentes.

## Promover para produção

1. Deploy **staging** no commit que vai para prod
2. Esperar **E2E Staging Gate** verde (status `e2e/staging`)
3. Deploy **production** no **mesmo commit**

Se o gate falhar, produção é recusada com mensagem clara. Só use `skip_e2e_gate=true` em emergência.

## Dispatch manual do E2E

Actions → **E2E Staging Gate** → Run workflow (útil para revalidar sem redeploy).
