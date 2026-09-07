# Auditoria de indexação e desempenho móvel — 06/09/2026

## Resultado e ação realizada

Foram conferidos os oito motivos de exclusão do Google Search Console, a lista de 171 URLs indexadas e todos os 32 endereços únicos dos sitemaps atuais. O relatório agregado do GSC exibe atualização em 27/08/2026; algumas linhas de exemplos trazem rastreamentos posteriores. Ele não deve ser confundido com o estado em tempo real.

Das 32 URLs promovidas atualmente, 27 aparecem na lista de indexadas. Outras quatro, ainda classificadas como descobertas no relatório agregado, foram confirmadas como **“O URL está no Google”** pela inspeção individual atual:

- `/guias/modelo-de-orcamento-para-eletricista`
- `/guias/modelo-de-orcamento-para-prestacao-de-servico`
- `/guias/como-fazer-orcamento-com-pix`
- `/guias/recibo-simples-tem-validade`

A URL `/pesquisa/orcamentos-prestadores` está descoberta, mas ainda não indexada. Solicitei sua indexação no GSC. O Google testou a página e confirmou **“Indexação solicitada”**, com inclusão na fila de rastreamento prioritário. Aceitação do pedido não significa que a indexação já ocorreu.

Portanto, há evidência de indexação para **31 das 32 URLs atuais** (27 no relatório e quatro na inspeção atualizada). Esse número não é a cobertura de todo o domínio e não representa 32 inspeções individuais simultâneas.

As inspeções adicionais de `/orcamento-com-pix` e `/orcamento-para/pedreiro` também confirmaram presença no Google. `/ferramentas` permanece com `noindex, follow`, compatível com a configuração atual do projeto; não foi solicitada sua indexação.

## Sitemaps e verificação HTTP

O GSC já registra dois sitemaps processados:

| Sitemap | Envio | Última leitura | URLs registradas no GSC |
|---|---|---|---:|
| `/sitemap.xml` | 04/09/2026 | 06/09/2026 | 32 |
| `/sitemaps/index` | 04/09/2026 | 05/09/2026 | 85 |

O índice publicado atualmente contém quatro segmentos: core (18 URLs), tools (7), growth (1) e guides (6). As variantes `/sitemaps/index` e `/sitemaps/index.xml` e o sitemap simples convergem para 32 URLs únicas. Os 85 endereços apresentados pelo GSC para o índice refletem seu processamento anterior; não correspondem ao conteúdo atual. Não foi necessário reenviar sitemaps já processados nem criar submissões duplicadas.

Todas as 32 URLs responderam HTTP 200, com canônica autorreferente, sem `noindex` nas diretivas examinadas e sem bloqueio nas regras gerais do robots.txt. Nenhum problema foi encontrado nessa verificação. Os resultados por URL estão em [crawl.json](crawl.json).

O projeto já possui um ciclo de foco editorial iniciado em 04/09/2026 e previsto para revisão em 03/12/2026, com URLs prioritárias definidas em `src/lib/seo/focus-cycle.ts`. Não foi alterada essa estratégia.

## Cobertura geral disponível no GSC

| Categoria | Quantidade | Interpretação e encaminhamento |
|---|---:|---|
| Indexadas | 171 | Lista completa consultada e cruzada com as 32 URLs atuais. |
| Descobertas, mas não indexadas | 76 | Mistura guias, versões internacionais e páginas por profissão. Quatro guias prioritários já estão indexados na inspeção atual. A nova pesquisa, identificada na inspeção individual, recebeu pedido de indexação. |
| Rastreadas, mas não indexadas | 37 | Todos os exemplos são imagens Open Graph ou os arquivos `manifest.webmanifest` e `.well-known/security.txt`. Não representam 37 artigos sem indexação. |
| Bloqueadas por robots.txt | 24 | Ferramentas internas e login; não desbloqueadas indiscriminadamente. |
| Excluídas por noindex | 14 | Principalmente login, cadastro, conta, busca, checkout e ferramentas. O catálogo `/ferramentas` segue noindex atualmente. |
| Redirecionamento | 11 | URLs antigas e parâmetros de idioma, incluindo marca antiga e modelos consolidados. Não precisam ser indexadas como páginas separadas. |
| Alternativas com canônica adequada | 11 | Variações com parâmetros de tarefa, segmento ou referência. Sem solicitação de indexação separada. |
| Não encontradas (404) | 4 | `/$`, `/&`, `/cdn-cgi/l/email-protection` e a inicial HTTP. Os três caminhos inválidos continuam 404. A inicial HTTP já responde 308 para HTTPS. Não foi declarada correção global de um grupo com 404 legítimos. |
| Canônica diferente escolhida pelo Google | 1 | `/games/jogos/grand-theft-auto-v`, fora das 32 URLs prioritárias. Atualmente responde 200 com canônica própria. A canônica escolhida pelo Google não foi investigada individualmente; não houve alteração nem validação indevida. |

Os 178 endereços não indexados não equivalem a 178 erros que devam ser corrigidos. Validação em massa seria inadequada para redirecionamentos, parâmetros, arquivos auxiliares e exclusões intencionais.

Os relatórios **Ações manuais** e **Problemas de segurança** foram consultados e ambos exibem **“Nenhum problema foi detectado”**.

## Desempenho móvel medido

Testes novos realizados no PageSpeed Insights em 06/09/2026, entre 12:03 e 12:06 BRT, com Lighthouse 13.4.1, Moto G Power emulado e limitação de 4G lento. Uma execução por página; os valores variam entre execuções.

| Página | Desempenho | Acessibilidade | Boas práticas | SEO básico | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Inicial | 90 | 100 | 100 | 100 | 1,7 s | 3,5 s | 10 ms | 0 |
| Orçamento com Pix | 91 | 95 | 100 | 100 | 1,7 s | 3,3 s | 10 ms | 0 |
| Gerador de recibo | 82 | 96 | 100 | 100 | 2,2 s | 4,1 s | 50 ms | 0 |

Relatórios reproduzíveis:

- [Inicial](https://pagespeed.web.dev/analysis/https-precisoutapronto-com-br/gsnqkx5snz?form_factor=mobile)
- [Orçamento](https://pagespeed.web.dev/analysis/https-precisoutapronto-com-br-orcamento-com-pix/pyz72x2v3m?form_factor=mobile)
- [Recibo](https://pagespeed.web.dev/analysis/https-precisoutapronto-com-br-gerador-de-recibo/vl6zscn5w3?form_factor=mobile)

Não há dados de usuários reais disponíveis no PageSpeed para essas páginas; a visão geral do GSC também mostra ausência de dados de Core Web Vitals. Assim, não se pode declarar aprovação dos Core Web Vitals reais ou medir INP a partir destes resultados. TBT é uma métrica de laboratório diferente de INP. Nota 100 em SEO significa aprovação das verificações básicas do Lighthouse, não garantia de classificação.

## Melhorias técnicas identificadas para implementação posterior

1. **Priorizar renderização inicial de recibos.** LCP de 4,1 s; o elemento identificado é o parágrafo introdutório. O detalhamento registra atraso de renderização de 2.420 ms. Investigar fontes, CSS e a montagem inicial antes de atribuir a causa a imagens ou ao servidor. A oportunidade estimada para recursos que bloqueiam renderização é de 300 ms.
2. **Associar rótulos aos campos de orçamento.** O teste aponta o campo numérico de quantidade e o campo de total somente leitura sem etiquetas acessíveis.
3. **Corrigir contraste no recibo.** Foram sinalizados, entre outros, o botão de modelo “Profissional”, “Baixar PDF agora”, “Emitir recibo grátis” e textos do exemplo visual.
4. **Otimizar recursos comuns.** Economia estimada de aproximadamente 58–59 KiB em imagens, 22–23 KiB de CSS não usado e 23 KiB de JavaScript legado. Essas estimativas não devem ser somadas como promessa de ganho de desempenho.
5. **Verificar posteriormente a indexação da pesquisa.** A fila foi aceita, mas a decisão e o prazo pertencem ao Google. Nenhum monitor automático foi criado.

Esta execução mediu e diagnosticou o site, realizou a solicitação cabível no GSC e salvou evidências locais. Não houve alteração de código de produção nem publicação de versão do site.
