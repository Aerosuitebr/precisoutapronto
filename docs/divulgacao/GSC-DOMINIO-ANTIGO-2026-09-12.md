# Search Console — domínio antigo — 12/09/2026

Mudança de endereço de resolvajato.com.br para precisoutapronto.com.br confirmada ativa nas duas propriedades. Não alterada.

## Desempenho Web: 03 a 09/09/2026
315 impressões, 0 cliques, CTR 0%, posição média 8,2. Tabela de páginas com 38 linhas.

| URL antiga (caminho) | Impressões | Cliques |
|---|---:|---:|
| /es/tools/severance | 136 | 0 |
| /es/tools/lattes-cv | 60 | 0 |
| /recibos/como-preencher-recibo | 20 | 0 |
| /guias/recibo-simples-tem-validade | 19 | 0 |
| /orcamento-com-pix | 16 | 0 |
| /para/gestores | 6 | 0 |
| /comprimir-redimensionar-imagem | 5 | 0 |
| /guias/modelo-de-recibo-mei | 4 | 0 |
| /recibos/recibo-com-assinatura | 4 | 0 |
| /guias/como-precificar-servico-freelancer | 4 | 0 |

## Inspeções
- /orcamento-com-pix antigo: fora do índice, erro de redirecionamento no último rastreamento de 11/09/2026 09:35. Teste ao vivo em 12/09 10:25 passou. Solicitação de indexação ACEITA, confirmação de fila prioritária. Não equivale à conclusão do recrawl.
- /orcamento-com-pix novo: indexado; último rastreamento 12/09/2026 08:57:36; canônico declarado e escolhido pelo Google iguais ao URL novo.
- /recibos/como-preencher-recibo antigo: ainda indexado a partir do rastreamento de 11/08/2026 13:49:37, canônico antigo. Solicitação RECUSADA pelo Google; teste ao vivo de 12/09 10:26 encontrou noindex no destino novo. Confirmado HTML público: robots noindex, follow; canonical novo. Nenhuma alteração nessa configuração.
- /guias/recibo-simples-tem-validade antigo: fora do índice como Página com redirecionamento, último rastreamento 08/09/2026 11:21:10; Google já seleciona canônico no domínio novo. Não houve necessidade de reenviar.

## HTTP público
HEAD seguindo redirecionamentos: as cinco primeiras URLs da tabela (incluindo orçamento) retornaram um 301 para o mesmo caminho no domínio novo e depois 200. Não houve loop nessa amostra. Isso não exclui problemas intermitentes ou específicos de crawlers.

Preservados: migração, title de recibo Pix, ciclo de foco, páginas e regras de indexação. Nenhum deploy realizado.
