# Distribuição e autoridade

Estas ações dependem de contas externas e relacionamento humano; por isso não são automatizadas pelo deploy.

**Kit operacional pronto (copies, UTMs, Product Hunt, checklist de 14 dias):**  
[`docs/KIT-DISTRIBUICAO-VIRAL.md`](./KIT-DISTRIBUICAO-VIRAL.md)

## Perfis e diretórios

- Validar se Google Business Profile e Bing Places fazem sentido para a operação.
- Preparar perfis em Product Hunt, AlternativeTo e diretórios brasileiros de SaaS.
- Usar sempre a descrição oficial e os materiais em `/sobre`.
- Não criar avaliações artificiais nem alegar números sem fonte.

## Conteúdo social

Cadência inicial sugerida (detalhes e textos no kit):

- Card da calculadora de rescisão no WhatsApp Status / Stories.
- Post LinkedIn de precificação freelancer.
- Post em comunidades MEI com o comparador MEI vs CLT.
- Dica prática retirada de cada guia novo, com link canônico + UTM.
- Vídeo do fluxo orçamento, aprovação e Pix no WhatsApp.

Priorize o **texto com link** (WhatsApp) para atribuição. A imagem de Stories fortalece marca, mas o link com UTM é o que mede resultado.

## Parcerias

Priorizar canais que atendem MEIs, freelancers, estudantes e profissionais contábeis. Oferecer conteúdo útil, demonstração ou material coautorado; não comprar links editoriais disfarçados.

Use `utm_medium=partner` e `utm_source=<parceiro>` conforme o kit.

## Medição

Marcar links externos com UTMs consistentes:

```text
utm_source=<canal>&utm_medium=organic_social|referral|partner&utm_campaign=<campanha>
```

Comparar no GA4:

- sessões por landing e por campanha
- evento `share_result`
- `begin_checkout` e `purchase`

Backlinks devem ser acompanhados no Search Console e Bing Webmaster Tools.
