# Migração para Precisou? Tá Pronto!

## Estado atual

- A identidade pública no código usa **Precisou? Tá Pronto!**.
- `resolvajato.com.br` permanece como origem operacional e canônica por ambiente.
- `contato@resolvajato.com.br` permanece como caixa padrão até a migração do Workspace.
- Os dois domínios devem coexistir durante a transferência dos sinais de busca.

## Antes do corte

1. Publicar e testar a nova identidade no domínio atual.
2. Adicionar `precisoutapronto.com.br` ao Google Workspace como domínio secundário.
3. Verificar DNS, MX, SPF, DKIM e DMARC.
4. Configurar o novo hostname no Cloudflare Tunnel e emitir TLS.
5. Verificar o novo domínio no Google Search Console e no Bing Webmaster Tools.
6. Testar pagamentos, webhooks, autenticação, e-mails e URLs públicas no novo hostname.

## Corte do domínio

Alterar no ambiente de produção:

```env
DOMAIN=precisoutapronto.com.br
NEXT_PUBLIC_APP_URL=https://precisoutapronto.com.br
NEXT_PUBLIC_CONTACT_EMAIL=contato@precisoutapronto.com.br
```

Depois:

1. Redirecionar cada URL de `resolvajato.com.br` para o mesmo caminho no domínio novo com HTTP 301 ou 308.
2. Não redirecionar todas as páginas para a home.
3. Atualizar sitemaps, canonicals, hreflang, dados estruturados e IndexNow.
4. Enviar a mudança de endereço no Search Console.
5. Manter o domínio antigo e os redirecionamentos por pelo menos 12 meses, preferencialmente sem prazo para remoção.

## Depois do corte

- Acompanhar erros 404, páginas indexadas, impressões e cliques nos dois domínios.
- Atualizar links externos, perfis sociais, diretórios e materiais de divulgação.
- Manter os endereços antigos de e-mail como aliases.
- Só alterar estrutura de URLs ou conteúdo de grande escala depois da estabilização da migração.
