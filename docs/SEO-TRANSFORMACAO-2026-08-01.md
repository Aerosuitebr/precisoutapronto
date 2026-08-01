# Relatório de SEO, AEO, indexação e performance

Data da revisão: 1 de agosto de 2026  
Site canônico: https://resolvajato.com.br

## Resultado executivo

O projeto já possuía uma arquitetura orgânica madura e foi preservado. A revisão validou a geração de 178 páginas, reforçou as áreas ainda incompletas e adicionou uma auditoria repetível. O site está tecnicamente preparado para rastreamento, indexação, respostas por IA e expansão programática; autoridade e posições dependem de publicação, qualidade contínua, sinais de uso e menções externas.

## Implementado e validado

- `robots.txt` dinâmico com bloqueio das áreas privadas, liberação das públicas e referências ao sitemap completo e ao índice segmentado.
- Sitemap completo deduplicado e índice dividido em `core`, `tools`, `growth`, `guides`, `games` e `i18n`.
- Canonicals e `hreflang` nas rotas principais e internacionais.
- Metadados globais e por página, Open Graph, Twitter Cards e imagens sociais dinâmicas.
- JSON-LD para Organization, WebSite, CollectionPage, ItemList, SoftwareApplication, Article, HowTo, FAQPage e BreadcrumbList onde semanticamente adequado.
- Hubs públicos em `/recursos`, `/biblioteca`, `/guias`, `/para/[segmento]` e `/modelos/[slug]`.
- SEO programático alimentado por catálogos tipados de intenções, segmentos, guias, ferramentas e games.
- Linkagem interna por cabeçalho, rodapé, hubs, páginas relacionadas, breadcrumbs e chamadas contextuais.
- Conteúdo legível por mecanismos de resposta em `llms.txt`, respostas diretas, FAQs e marcação HowTo.
- Página 404 personalizada, acessível, com `noindex,follow` e rotas de recuperação.
- Reforço de cabeçalhos com HSTS, CSP, proteção de framing, MIME sniffing, política de referência, permissões, cross-domain policy e isolamento de origem.
- Analytics carregado somente após consentimento e depois da interação, reduzindo impacto e respeitando privacidade.
- Imagens modernas AVIF/WebP via Next Image e geração estática das páginas editoriais escaláveis.
- Auditoria automatizada disponível em `npm run seo:audit`.

## Alterações desta execução

1. Criada a página 404 personalizada com navegação para ferramentas, biblioteca e guias.
2. Ampliados Open Graph e Twitter Cards nas páginas programáticas de modelos.
3. Adicionados `HowTo`, `dateModified` e relação com o WebSite ao JSON-LD dos modelos.
4. Adicionados cabeçalhos `X-Permitted-Cross-Domain-Policies` e `Origin-Agent-Cluster`.
5. Criado o verificador estático de arquivos essenciais, metadados e segmentos de sitemap.
6. Executada compilação de produção com checagem de tipos e geração das rotas.
7. Corrigido o comando padrão de produção: `npm start` agora inicia o servidor Next.js atual. O comando anterior servia a pasta `out` desatualizada, respondia HTML da home em `robots.txt` e sitemaps e transformava URLs inexistentes em soft 404 com status 200.
8. Preservado o servidor estático antigo somente como `npm run start:legacy-static`, para compatibilidade e diagnóstico explícitos, sem uso no fluxo de produção.
9. Corrigido também o fallback do servidor legado: URLs ausentes agora retornam a página 404 com status 404 e `X-Robots-Tag`, em vez de responder a home com 200.
10. Adicionado `npm run seo:smoke`, que verifica o servidor real por HTTP: status, tipos de conteúdo, canonicals, cabeçalhos, 404, robots, volume do sitemap, vazamento de rotas privadas e os seis segmentos do índice.

## Pendências externas e operacionais

- Publicar a versão e confirmar no ambiente real os status HTTP, canonicals e conteúdos de `robots.txt` e sitemaps.
- Enviar `https://resolvajato.com.br/sitemaps/index.xml` ao Google Search Console e Bing Webmaster Tools.
- Acompanhar páginas indexadas, consultas, CTR, Core Web Vitals de campo e erros de rastreamento por pelo menos 28 dias.
- Executar Lighthouse em dispositivo móvel contra produção; métricas locais não substituem dados reais de usuários.
- Revisar trimestralmente conteúdos jurídicos, trabalhistas e contábeis com profissional habilitado e atualizar `dateModified` somente quando houver revisão real.
- Conquistar menções editoriais e backlinks relevantes. SEO técnico sozinho não cria autoridade de domínio.
- Usar IndexNow após publicações e mudanças editoriais, sem submissões repetitivas de URLs inalteradas.

## Critérios de aceitação

- `npm run seo:audit` deve encerrar sem falhas.
- Com o servidor iniciado, `npm run seo:smoke` deve encerrar sem falhas (`SEO_BASE_URL` permite apontar para staging ou produção).
- `npm run build` deve compilar, verificar tipos e gerar todas as rotas sem erro.
- `npm start` deve servir o aplicativo Next.js, nunca a exportação antiga da pasta `out`.
- Nenhuma rota privada deve aparecer nos sitemaps.
- Toda URL indexável deve responder 200, ter canonical autorreferente e estar acessível por link interno.
- URLs removidas devem retornar 404/410 ou redirecionar por 301 para um equivalente real; nunca para a página inicial por conveniência.
