# Task: itens 1, 2, 4 do plano de tração viral (branch master)

## Descobertas
- Produção roda em `master` (não `feat/seo-landing-curriculo`). Fix do CPF autofocus portado pra cá também.
- Item 4 (marca d'água + link nos documentos grátis) JÁ EXISTE: `DocumentExportShell` + `DocumentBrandWatermark` + `DocumentViralFooter`, usado em recibos, contratos, propostas, currículo, jurídicos, contábeis, lattes, trabalhos. Nada a fazer aqui.
- Item 1 (compartilhar no WhatsApp) já existe nas 3 calculadoras (rescisao, mei-vs-clt, precificacao) só que o texto NÃO inclui link de volta pro site — gap real, vou corrigir usando `viral-loop.ts`.
- Item 2 (card de imagem pra Stories) NÃO existe — vou construir um componente reutilizável com html2canvas (já é dependência do projeto).

## Plano
1. [ ] Criar `src/lib/viral-loop.ts` -> adicionar helper de texto/link específico pra calculadoras (rescisao, mei-vs-clt, precificacao).
2. [ ] Atualizar `resumoTexto()` das 3 calculadoras pra incluir o link com UTM.
3. [ ] Criar `src/components/shared/result-share-card.tsx`: card 1080x1350 estilizado, renderizado off-screen, exportado com html2canvas -> download PNG + Web Share API (fallback download).
4. [ ] Integrar o card nas 3 calculadoras ao lado do botão de WhatsApp.
5. [ ] Rodar `tsc --noEmit` e lint no diff.
6. [ ] Commit + push pra `master` (é a branch de produção).
7. [ ] Perguntar se dispara o deploy (Vultr) e o que fazer com os 3 vídeos que o usuário já tem prontos localmente (precisa que ele suba/anexe).
