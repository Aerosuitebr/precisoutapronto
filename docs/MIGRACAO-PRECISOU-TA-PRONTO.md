# Identidade Precisou, Tá Pronto

## Estado atual

- A identidade pública no código usa **Precisou, Tá Pronto**.
- `precisoutapronto.com.br` é o único domínio oficial e canônico.
- `contato@precisoutapronto.com.br` é a caixa pública.
- Hosts anteriores da plataforma só existem para redirect 301 no middleware, preservando caminho e query.

## Redirects

O middleware envia todo pedido no host legado para `https://precisoutapronto.com.br` no mesmo caminho, inclusive `robots.txt`, `sitemap.xml` e `/sitemaps/*`. Não servir cópia 200 no host antigo.

## Search Console

1. Confirmar a propriedade de domínio `precisoutapronto.com.br`.
2. Pedir recrawl de `/imprensa` e `/precisou-ta-pronto`.
3. Usar remoção de URLs na propriedade do host antigo para páginas que ainda apareçam na SERP depois do 301.
4. Manter os redirects por pelo menos 12 meses.

## Depois da consolidação

- Acompanhar erros 404, páginas indexadas, impressões e cliques no domínio canônico.
- Atualizar links externos, perfis sociais, diretórios e materiais de divulgação para `precisoutapronto.com.br`.
- Não criar URLs novas de `/orcamento-para` durante o ciclo de foco.
