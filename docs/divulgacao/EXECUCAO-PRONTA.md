# Execução de divulgação · Precisou, Tá Pronto

Pacote operacional para publicar hoje. Textos em `colar/`, imagens e vídeo em `assets/`.

**Marca:** sempre `Precisou, Tá Pronto` + `precisoutapronto.com.br` (ver `MARCA-COMPLETA.md`).
Não use abreviações em copy pública.

Legenda de status:
- FEITO: executado por automação / ops
- COLAR: exige sua conta (1 clique / copiar)
- BLOQUEADO: precisa login ou ação humana no navegador

---

## 0) GSC hoje (04/ago) · COLAR

**Guia:** `HOJE-2026-08-04-GSC.md`
**Console:** https://search.google.com/search-console?resource_id=sc-domain%3Aprecisoutapronto.com.br

1. Reenviar `sitemap.xml` + `sitemaps/index.xml` até status **Sucesso**
2. Exportar Desempenho · últimos 28 dias (CSV)
3. Salvar em `docs/divulgacao/exports/` e avisar no chat com os totais

Pré-checagem: sitemaps em HTTP 200 com 152 URLs (curl · 04/ago).

---

## 1) WhatsApp Status / Stories · Rescisão

**Status:** COLAR  
**Arquivo:** `colar/01-whatsapp-status-rescisao.txt`  
**Imagem:** `assets/calculadora-de-rescisao.png` (ou botão Baixar imagem na calculadora)

Link direto para abrir o WhatsApp com o texto pronto:
https://wa.me/?text=Precisou%2C%20T%C3%A1%20Pronto%20%C2%B7%20demiss%C3%A3o%20ou%20pedido%20de%20conta%3F%0ACalcule%20uma%20estimativa%20de%20saldo%2C%20f%C3%A9rias%2C%2013%C2%BA%2C%20aviso%20e%20FGTS%20em%20minutos.%0AGr%C3%A1tis%2C%20sem%20cadastro%3A%0A%0Ahttps%3A%2F%2Fprecisoutapronto.com.br%2Fcalculadora-de-rescisao%3Futm_source%3Dwhatsapp%26utm_medium%3Dorganic_social%26utm_campaign%3Drescisao_status

Passos: abrir o link → Status → anexar a imagem → publicar.

---

## 2) Instagram bio + link UTM

**Status:** COLAR  
**Arquivo:** `colar/02-instagram-bio.txt`

Bio sugerida:
```text
Precisou, Tá Pronto · precisoutapronto.com.br
Orçamento com Pix no WhatsApp
Cliente aprova. Você recebe.
Ferramentas grátis pra estudar, trabalhar e vender
```

Link da bio (prioridade rescisão):
```text
https://precisoutapronto.com.br/calculadora-de-rescisao?utm_source=instagram&utm_medium=organic_social&utm_campaign=rescisao_stories
```

Stories MEI vs CLT: `colar/02b-instagram-stories-mei.txt` + `assets/05-preco-og.png` ou card da calculadora MEI.

---

## 3) LinkedIn · Precificação freelancer

**Status:** FEITO  
**Arquivo:** `colar/03-linkedin-preco.txt`  
**Imagem opcional:** `assets/05-preco-og.png`  
**Post:** https://lnkd.in/dD27Rwpk  
**Aero Suite:** compartilhamento FEITO (como página)  
**LinkedIn PT (currículo):** FEITO · `colar/18-pt-linkedin-curriculo.txt`  
**DM conexões:** `colar/23-linkedin-dm-conexoes.txt` (COLAR · lista curta 5 a 15/dia)

### 3b) LinkedIn · lote com artes novas (navy / gold)

**Status:** COLAR (1 post por dia)  
**Arquivo:** `colar/29-linkedin-lote-artes.txt`  
**Artes feed (recomendado):** `ph-gallery/ph-gallery-*.png` (1536×1024)  
**Artes verticais:** `assets/promo-*-stories.png` (1024×1536)

Fila: orçamento Pix → currículo → recibo → proposta → marca → celular.

---

## 4) Facebook · Página Precisou, Tá Pronto + grupo MEI

**Status:** COLAR (conta logada; criar Página e publicar)  
**Arquivo página:** `colar/24-facebook-pagina.txt`  
**Arquivo grupo:** `colar/04-comunidade-mei.txt`  
**Arte:** `assets/promo-orcamento-pix-stories.png` (ou `02-orcamento-og.png`)

Passos:
1. Em Criar Página: nome `Precisou, Tá Pronto`, clicar categoria na lista (ex.: Empresa de software), Criar Página
2. Postar o texto de `24` com a arte e o link UTM
3. Em 1 grupo MEI onde já participa: colar `04` (não spammar)

---

## 4b) TikTok

**Status:** COLAR (login / upload no app ou CapCut)  
**Arquivo:** `colar/25-tiktok-legenda.txt`  
**Vídeo:** 9:16 via CapCut (`reel/CAPCUT.md` + artes `promo-*-stories.png`)  
Não usar o mp4 16:9 do repo no TikTok.

---

## 4c) Reels nichos premium (12)

**Status:** VIDEOS PRONTOS + composer Meta aberto (upload do arquivo exige clique humano no seletor do Windows)  
**Pasta publish:** `reel/nichos/_publish/`  
**Guia:** `reel/nichos/PUBLICAR-META.md`  
**Pasta:** `reel/nichos/` (ver `reel/nichos/README.md`)  
**Roteiro:** `colar/28-reels-nichos-orcamento.txt`  
**Pipeline:** `scripts/ops/generate-niche-reel-narration.py` + `compose-niche-reel-arts.py` + `build-niche-reel-premium.ps1`

12 MP4 9:16 com AntonioNeural + trilha impact-trailer. Legenda em cada pasta `legenda.txt`.

Meta Business Suite: Criar reel (pagina Precisou, Tá Pronto). Instagram: conectar perfil antes de cruzar.

---

## 5) Product Hunt

**Status:** FEITO (gallery EN + maker update)  
**Arquivo:** `colar/05-product-hunt.txt`  
**Produto:** https://www.producthunt.com/products/precisoutapronto

URL canônica:
`https://precisoutapronto.com.br/?utm_source=producthunt&utm_medium=referral&utm_campaign=launch`

---

## 6) AlternativeTo + diretórios BR

**Status:** MicroSaaS MKT FEITO; resto BLOQUEADO por login

Checklist:
- [ ] AlternativeTo (conta + 7 dias + perfil → Suggest new application; texto EN em `colar/27-alternativeto.txt`)
- [x] MicroSaaS MKT: https://microsaas.marketing/micro-saas/precisoutapronto (curto: https://veja.microsaas.marketing/precisoutapronto)
- [x] FindSaaS: enviado, aguarda aprovação (~48h)
- [x] TabNews: https://www.tabnews.com.br/precisoutapronto/mostrei-o-precisoutapronto-ferramentas-gratis-pra-mei-e-freelancer-orcamento-com-pix-pdfs-e-calculadoras
- [x] Distrito: cadastro enviado (base de startups)
- [ ] Indie Hackers Show IH (Cloudflare / login)
- [ ] Softonic / similares (se aceitar web app)
- [ ] SaaSHub (exige produto em inglês + Register/Login)

Descrição padrão: `colar/06-diretorios-descricao.txt`

**Marca nos diretórios:** campo Nome / Title = `Precisou, Tá Pronto` (nunca abreviação).
Ver `MARCA-COMPLETA.md`.

Lusofonia (BR + PT): `LUSOFONIA-BR-PT.md` + `OUTREACH-LUSOFONIA.md` + `colar/17` a `22`

---

## 7) Referral · 3 amigos = Premium

**Status:** FEITO (10 e-mails enviados via SMTP em 2026-07-27) + COLAR mensagem pessoal  
**Arquivo:** `colar/07-referral-nudge.txt`

Painel no produto: `/conta` (Indique e ganhe).

---

## 8) Vídeo promo + mensagem curta

**Status:** COLAR  
**Vídeo:** `assets/precisoutapronto-promo-16x9.mp4`  
**Também em:** https://precisoutapronto.com.br/videos/precisoutapronto-promo-16x9.mp4  
**Arquivo:** `colar/08-video-promo-contatos.txt`

---

## 9) Artes elaboradas · Currículo / Recibo / Proposta

**Status:** PRONTO  
**Artes 9:16 (Status/Stories):**
- `assets/promo-curriculo-stories.png`
- `assets/promo-recibo-stories.png`
- `assets/promo-proposta-stories.png`
- `assets/promo-orcamento-pix-stories.png`
- `assets/promo-marca-site-stories.png`

**Textos:**
- `colar/09-whatsapp-curriculo.txt`
- `colar/10-whatsapp-recibo.txt`
- `colar/11-whatsapp-proposta.txt`
- `colar/12-whatsapp-orcamento-pix.txt`
- `colar/13-whatsapp-marca-site.txt`

**Links públicos (landing, sem login pra ver):**
- https://precisoutapronto.com.br/gerador-de-curriculo
- https://precisoutapronto.com.br/gerador-de-recibo
- https://precisoutapronto.com.br/gerador-de-proposta-comercial
- https://precisoutapronto.com.br/orcamento-com-pix
- https://precisoutapronto.com.br/

**Nota:** a landing e o preview são públicos. Baixar/salvar PDF pede conta grátis (`/cadastro?next=/ferramentas/...`).

---

## Autoridade / backlinks (COLAR)

**Status:** COLAR  
**Playbook:** `AUTORIDADE-BACKLINKS.md`  
**E-mail pronto:** `colar/33-outreach-mei-rh-educacao.txt`

Páginas para pedir menção (sempre internas, não só a home):
- https://precisoutapronto.com.br/imprensa
- https://precisoutapronto.com.br/embed
- https://precisoutapronto.com.br/checklist-cobranca-mei
- https://precisoutapronto.com.br/calculadora-de-rescisao
- https://precisoutapronto.com.br/corretor-de-redacao-enem

Meta: 10 e-mails/dia · pedir link para URL específica · oferecer badge de `/embed`.
