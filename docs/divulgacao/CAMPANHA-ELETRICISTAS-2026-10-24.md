# Campanha de aquisição — eletricistas, 30 dias

Status: implementação local; nenhuma publicação, contato, anúncio ou deploy realizado. Dias relativos ao lançamento, sem prazo de resultado garantido.

## Destino e materiais

Página: /campanhas/eletricistas-30-dias#kit-eletricistas. Seis roteiros, legendas e cards PNG 1080 × 1920. Cada parceiro usa um identificador público no gerador; cada peça tem utm_content próprio. Os cards são peças estáticas; gravar os seis vídeos seguindo os roteiros, com dados fictícios. Não usar documentos de clientes nas gravações.

## Execução

Dias 1–7: validar fluxo móvel de criação, abertura, resposta, Pix opcional e recibo. Registrar baseline atual de 28 dias no GA4/Search Console. Não usar o relatório de setembro como baseline atual. Confirmar eventos com consentimento no DebugView antes de lançar. Conferir geração de link e segundo uso com conta de teste.
Dias 8, 10, 12, 14, 17, 19: publicar as seis peças do kit. Reaproveitar nos canais mantidos pela marca, sempre registrando URL pública e data. Manter o mesmo destino; variar abertura e formato. No Story/Status, anexar o link identificado; o card sozinho não fornece link clicável.
Dias 15–23: selecionar cinco parceiros para piloto; combinar uma demonstração por parceiro com link próprio. Perfis sobre elétrica, instalação e gestão de serviços. Priorizar comentários de profissionais e demonstrações reais; não selecionar apenas por seguidores. Usar o CSV como registro, não como prova de parcerias realizadas.
Dias 24–30: comparar campanhas por primeiros orçamentos, segundos orçamentos, custo e retorno. Repetir as duas peças com melhor ativação entre visitantes comparáveis; com amostra pequena, manter a conclusão como hipótese. Não prometer aumento de fechamento.

## Critérios para cinco parceiros

Selecionar perfis públicos com conteúdo recorrente sobre elétrica, comentários relevantes, disposição para testar a ferramenta e demonstração que caiba no contexto do canal. Registrar links concretos e data de consulta antes do contato. Não há parceiros contratados ou contatos autorizados neste pacote.

Mensagem para revisar e enviar individualmente: “Olá, [nome]. Vi seu conteúdo sobre [tema específico]. Temos um modelo gratuito de orçamento para eletricistas, com materiais e mão de obra separados e resposta pelo celular. Você pode testar com dados fictícios em [link identificado]. Se for útil para sua comunidade, podemos combinar uma demonstração e avaliar quantos profissionais passam a usar. O documento gratuito leva a marca da plataforma.”

## Medição

No GA4, criar exploração com dimensões de evento utm_source, utm_medium, utm_campaign e utm_content (cadastrar dimensões personalizadas de evento); filtrar campanha eletricistas_30_dias_v2. As dimensões personalizadas não são retroativas. O primeiro conjunto válido de UTMs permanece na aba após consentimento, sem copiar consultas completas, telefone ou e-mail. Nova aba ou limpeza de dados pode perder essa associação.

Funil: quote_started → quote_preview_ready → quote_link_created → quote_whatsapp_send_started. Clique para abrir WhatsApp não comprova envio; quote_whatsapp_send_completed não prova entrega ou leitura. quote_recipient_view mede abertura da página por montagem, não pessoas únicas. quote_recipient_recruit_click mede interesse; quote_browser_first_created e quote_browser_second_created medem marcos por navegador com consentimento. Retorno: quote_browser_returned, após pelo menos 24 horas sem criação; não equivale a retenção de usuários autenticados. Cruzar com métricas agregadas existentes de produto quando disponíveis.

A principal avaliação é ativação seguida de segundo uso, além de custo por primeiro orçamento. Não somar contagens de eventos como se fossem profissionais únicos. Ausência de consentimento, bloqueadores e dispositivos diferentes reduzem a cobertura. Não enviar nomes, números, valores de documentos ou conteúdo privado ao relatório de campanha.

Search Console: comparar janelas completas de 28 dias por páginas de recibos, orçamentos e marca. Preservar títulos já alterados durante o teste; priorizar consultas com impressões e páginas com geração real de documentos. Não criar novas páginas em massa.

## Antes de publicar

Revisar cards no celular; gravar vídeos; confirmar links e consentimento; conferir as métricas no ambiente de teste. Deploy, GA4, Search Console, contratos, orçamento de mídia e postagem precisam ser executados nas contas correspondentes. O arquivo parceiros.csv começa vazio de resultados; preencher somente com evidências reais.

## Validação local concluída

- Build de produção Next.js aprovado, 309 páginas estáticas geradas. Dois avisos preexistentes de imagens permanecem em profile-settings e orcamento-public-view.
- Auditoria SEO estática aprovada: oito arquivos essenciais e 166 rotas.
- 15 testes aprovados no Chrome local: campanha móvel, download PNG, links segmentados, consentimento, atribuição entre navegações, demonstração sem criação real, prévia sem contatos, criação com API simulada, indicação e compartilhamento nativo com código preservado. Nenhum orçamento real foi criado e nenhuma mensagem foi enviada.
- Conferência visual do card 1080 × 1920 e página em largura de 390 pixels. Evidências locais em output/growth-2026-10-24/.
- O fluxo existente de indicação por profissão, duplicação segura e segundo uso foi preservado; novos botões oferecem cópia e compartilhamento nativo após criação.
- Corrigida a duplicação de quote_recipient_view e growth.share_opened ao mudar o status do mesmo orçamento durante a visualização. Recarregar ou abrir em outro dispositivo ainda pode gerar nova abertura; não é contagem de pessoas.
- Nenhum deploy, alteração de banco, postagem, contato externo ou configuração de GA4/Search Console foi realizado.
