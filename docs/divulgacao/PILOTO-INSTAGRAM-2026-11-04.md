# Piloto Instagram — 4 de novembro de 2026

Canal escolhido pelo usuário: Instagram. Perfil oficial ainda precisa ser identificado. Não há postagem, parceria contratada nem contato enviado nesta execução.

## Publicações preparadas

Gerar ou atualizar o pacote: `node scripts/seo/export-electrician-campaign.mjs`.
Saída: `output/campanha-eletricistas-2026-11-04/`. Seis PNGs verticais, seis arquivos com roteiros/legendas e planilha CSV de publicações. Usar as legendas do canal Instagram, com `utm_source=instagram` e identificação distinta para cada peça.

Publicar as peças nos dias relativos 8, 10, 12, 14, 17 e 19 do lançamento. Gravar a demonstração descrita em cada roteiro para os Reels. Cards estáticos estão prontos; não registrá-los como vídeos gravados. Acrescentar link clicável nos Stories e destino correspondente na bio. Registrar URL pública e data no CSV após cada publicação.

## Cinco candidatos para o piloto

Fontes públicas consultadas em 04/11/2026. A seleção indica afinidade de assunto, não audiência ou desempenho verificados. Não são parceiros confirmados; disponibilidade e condições precisam ser negociadas. Algumas organizações podem ter soluções concorrentes.

| Candidato | Fonte | Proposta |
|---|---|---|
| Família Eletricista | https://linktr.ee/Familia.eletricista | Demonstração de orçamento e atendimento pelo WhatsApp; o perfil já aborda esses temas |
| Tudo para Eletricista | https://tudoparaeletricista.com.br/ | Complementar a apresentação profissional de serviços com orçamento detalhado |
| Portal da Elétrica | https://portaldaeletricaoficial.com/ | Tutorial para alunos sobre materiais e mão de obra em um orçamento |
| Mundo da Elétrica | https://www.mundodaeletrica.com.br/sobre/ | Demonstração educativa de organização do atendimento |
| Engehall | https://engehall.com.br/contato/ | Piloto com profissionais em formação; avaliar compatibilidade com ofertas existentes |

### Texto para abordagem individual

Olá, [nome]. Vi seu conteúdo sobre [tema concreto da fonte]. O Precisou, Tá Pronto tem um modelo gratuito de orçamento para eletricistas: materiais e mão de obra separados, aprovação pelo celular e Pix opcional. Gostaríamos de propor um teste com dados fictícios e uma demonstração para sua comunidade. O PDF gratuito leva a marca da plataforma. Podemos conversar sobre formato e condições? Página de teste: https://precisoutapronto.com.br/orcamento-para/eletricista

Antes de enviar, preencher tema específico e confirmar o canal comercial público. Cada demonstração acordada deve usar identificador próprio no kit https://precisoutapronto.com.br/campanhas/eletricistas-30-dias#kit-eletricistas. Não preencher resultados sem evidência.

## Três relatos reais

Selecionar três usuários reais que já geraram documentos. Solicitação preparada: “Você pode contar como usou o Precisou, Tá Pronto e o que facilitou no atendimento? Se quiser autorizar a publicação, envie seu relato pela página https://precisoutapronto.com.br/depoimentos e escolha os dados que podem aparecer. Não inclua dados dos seus clientes.”

Publicar somente relatos autorizados e aprovados no fluxo existente. Nenhum depoimento foi inventado ou cadastrado.

## Medição

Antes do lançamento, exportar duas janelas consolidadas e consecutivas de 28 dias no Search Console, com páginas e consultas; manter os mesmos filtros. Não usar setembro como desempenho atual. No GA4, confirmar eventos no DebugView com consentimento e exportar por landing_path × event_name e por campanha/peça.

O painel `scripts/seo/build-weekly-dashboard.mjs` recebe `--gsc`, `--queries`, `--previous-gsc`, `--previous-queries` e `--funnel`. Foi ampliado para documentos concluídos, início do próximo recibo, primeiro e segundo orçamento no navegador e retorno após 24h. Não confundir eventos com pessoas únicas ou coortes. Métricas indisponíveis permanecem n/d. Não habilitar anúncios pagos antes de medir criação e repetição.
