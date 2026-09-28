# Visibilidade — 28/09/2026

## Alterações para publicação

- Orçamento para eletricista: título, descrição e FAQ priorizam a criação e o envio do orçamento. Removidas faixas de preço sem fonte; preservado o exemplo explicitamente fictício e o escopo do serviço.
- Orçamento para pintor: exemplo de R$ 1.250 (250 + 900 + 100), entrada de R$ 500 e saldo de R$ 750. Orientações sobre metragem de paredes, demãos e materiais, sem apresentar valores como pesquisa de mercado.
- Reabertura seletiva da indexação de `/orcamento-para/pintor` e `/recibos/como-preencher-recibo`, com inclusão no sitemap. Demais exclusões editoriais e áreas privadas preservadas.
- Guia de preenchimento: exemplo de entrada com saldo e links para recibo Pix, serviços e autônomos. A central de recibos oferece acesso direto ao guia.
- Textos públicos, FAQs, imprensa e mensagens das ferramentas alinhados à regra existente: conta grátis guarda histórico; Premium remove a marca. Nenhuma regra de cobrança foi alterada.
- Datas de revisão específicas para os modelos alterados; datas do sitemap atualizadas nas páginas centrais revisadas.
- Título da página de recibo Pix preservado para não misturar sua avaliação com uma nova mudança de título.

## Verificação

- Auditoria estática SEO: 165 rotas verificadas, aprovada.
- TypeScript: aprovado.
- Build de produção: aprovado, com 308 páginas estáticas geradas. Permanecem dois avisos preexistentes de uso de imagens em componentes fora deste escopo.
- Cobertura comercial SEO: cinco testes aprovados localmente, incluindo HTTP 200, canonical, ausência de noindex e presença das duas páginas no sitemap.
- Modelo de eletricista no navegador: aprovado, com os três itens profissionais carregados.

## Publicação e medição

Publicação reservada ao usuário. Nenhum deploy, contato externo ou anúncio foi realizado. Não enviar IndexNow nem solicitar nova indexação antes de o conteúdo estar publicado.

Após publicar, conferir as duas URLs liberadas e o sitemap em produção. Comparar janelas completas de 28 dias no Search Console, separando marca, recibos e orçamentos; observar cliques e impressões por página e consulta. No GA4, acompanhar `quote_link_created` e `document_completed`, sem contar clique em CTA como documento concluído. Não há novos dados de desempenho nesta execução.

Os materiais de divulgação já preparados em `docs/divulgacao/RODADA-2026-09-16.md` continuam disponíveis. Publicações e contatos precisam ser registrados com URL pública e resultado; rascunhos não devem ser contabilizados como divulgação ou backlinks.
