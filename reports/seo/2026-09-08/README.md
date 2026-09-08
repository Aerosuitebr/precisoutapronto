# Melhorias de visibilidade — 08/09/2026

Implementadas e verificadas localmente. Publicação pendente: a revisão automática rejeitou o SCP do patch ao servidor 216.238.102.195 por exigir autorização específica para transferir código privado. Não houve upload, alteração de produção ou contorno da rejeição. O acesso SSH de leitura confirmou a aplicação saudável em /opt/precisoutapronto.

## Mudanças prontas

- Orçamento: labels associados a nome, quantidade, valor e subtotal de todos os itens, inclusive os adicionados.
- Recibo: botões selecionados e de download com fundo mais escuro, textos secundários do documento com maior contraste e exportador carregado sob demanda.
- Fontes decorativas: removido preload de Dancing Script, Playfair Display e Great Vibes. As fontes continuam disponíveis; a fonte principal mantém preload. Isso reduz competição de carregamento, mas não é uma medição de ganho de LCP.
- Proposta: exemplo fictício preenchido, escopo, prazo, exclusões, entrada/saldo, mensagem de WhatsApp e links contextuais para preço, orçamento e recibo Pix.
- Recibo Pix: exemplo de pagamento parcial e links para proposta e orçamento, com eventos de CTA.
- Medição: receipt_pdf_download_completed somente depois do sucesso da exportação; sem nomes, valores ou conteúdo do documento. A entrada direta no formulário recebe atribuição quando não há origem anterior. O envio GA4 depende da configuração e do consentimento existente.
- Painel: recibo Pix incluído, downloads separados, comparação opcional de páginas e consultas, ausência de export Bing apresentada como n/d.

Titles e descriptions preservados nos arquivos alterados. Teste de título até 28/09 preservado. Nenhuma expansão do sitemap ou alteração das regras de indexação. Mudanças locais anteriores em landing-content, guide-clusters e divulgação não foram sobrescritas nem incluídas no patch de produção.

## Validação

- ESLint dos arquivos alterados: aprovado.
- TypeScript geral: dois erros preexistentes, em e2e/event-platform-contract.spec.ts:664 (flag de regex/target) e src/lib/seo/public-indexable-path.test.ts:1 (vitest ausente). Nenhum erro reportado nos arquivos desta tarefa.
- Navegador Chromium, 390 × 844: PDF baixado e evento de conclusão recebido; primeiro e segundo itens de orçamento com os quatro rótulos; novas páginas/links presentes; sem overflow horizontal nas páginas de Pix e proposta. Imagens e PDF de teste nesta pasta.
- Painel executado com CSVs reais para baseline. Comparação e contagem de download testadas separadamente com fixture sintética e comparação do mesmo período; dashboard-test.md não representa evolução real.
- Rede local bloqueou download de Google Fonts; conferência local usou fontes alternativas. Build de produção e nova medição móvel permanecem pendentes da publicação autorizada. Não afirmar melhora de Core Web Vitals ou nota de PageSpeed.

## Comparação semanal

Baseline real: 30/08–05/09, export salvo em 07/09, 918 impressões e 6 cliques agregados na propriedade. baseline.md detalha páginas e consultas. Não somar linhas para substituir o agregado do Search Console.

Próximo recorte completo sugerido: 06–12/09, quando disponível. Depois comparar semanas completas, com mesma propriedade, pesquisa Web e filtros. Registrar a data real do deploy antes de interpretar antes/depois. Preservar os títulos até 28/09 e o ciclo de foco existente.

```powershell
node scripts/seo/build-weekly-dashboard.mjs --end AAAA-MM-DD --gsc CAMINHO_PAGINAS_ATUAIS --queries CAMINHO_CONSULTAS_ATUAIS --previous-gsc reports/seo/2026-09-07/gsc-paginas-2026-08-30_2026-09-05.csv --previous-queries reports/seo/2026-09-07/gsc-consultas-2026-08-30_2026-09-05.csv --output CAMINHO_RELATORIO
```

Quando houver export GA4, acrescentar --funnel CAMINHO_CSV, com colunas landing_path,event_name,event_count e filtro de tráfego orgânico. Não misturar visitas sociais ao avaliar SEO. O painel usa contagens de eventos, não usuários únicos; razões entre eventos não são taxas de conversão de uma coorte. Aprovações na sessão do cliente não devem ser atribuídas à sessão do prestador sem uma ligação comprovada. Sem export, conversões continuam n/d; não há resultado futuro medido nem monitor automático criado.

## Publicação após autorização

production.patch contém apenas nove arquivos de código desta tarefa; deploy-files.txt lista os caminhos. Antes de aplicar, conferir compatibilidade com git apply --check no servidor, preservar cópia dos arquivos e imagem anterior, construir a aplicação e substituir somente o serviço app. Não substituir .env, banco, tokens ou serviços de WhatsApp. Se o patch não aplicar, revisar diferenças antes de qualquer escrita. Verificar HTTP, títulos, links, PDF e health após publicar. Não executar o script amplo de deploy com remove-orphans para esta mudança pontual.

Divulgação: roteiro e retornos em docs/divulgacao/CONTINUIDADE-2026-09-08.md. Não houve nova mensagem enviada; os contatos de 07/09 ainda estão dentro do intervalo de espera.
