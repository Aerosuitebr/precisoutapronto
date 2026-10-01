# Jornada de primeiro orçamento e indicação

## Estado da entrega

Implementado e validado localmente em 01/10/2026: build de produção concluído, tipagem e lint dos arquivos alterados sem erros, 27 testes distintos aprovados entre jornada, growth-loop, indicações e contratos de depoimentos. Dois avisos preexistentes de imagens permanecem em arquivos fora desta mudança.

Publicação pendente: a revisão automática bloqueou a transferência do pacote de código ao servidor 216.238.102.195 por exigir autorização explícita do usuário para esse envio. Nenhum código foi transferido ou ativado. Foi criada somente uma pasta temporária vazia para preparação no servidor. A chave configurada e o serviço foram conferidos por operações de leitura. Não tentar outro método de envio sem autorização.

Casos reais: nenhum novo relato foi fornecido nesta conversa. O bloco está integrado ao banco existente, mas só exibe relatos previamente aprovados com consentimento; falta obter e revisar novos casos se não houver registros elegíveis. As consultas de métricas foram compiladas, mas não exercitadas contra um banco local configurado.

## Implantação

- `/demonstracao-orcamento`: exemplo fictício interativo, sem chamadas de criação ou envio.
- Editor público: serviços e valores → prévia local → dados de envio → geração. As validações de envio e a API continuam obrigatórias.
- `/conteudos-para-compartilhar#kit`: vídeo horizontal existente, imagem para download, legenda e link por profissão/canal.
- A home exibe até três relatos de orçamento, Pix ou recibo que tenham autorização na versão vigente, revisão e aprovação no sistema existente. Sem relatos aprovados, o bloco fica oculto. Coleta em `/depoimentos`; moderação na conta interna. Não publicar números de resultado sem conferir a evidência com o autor.

## Experimento de indicação

Campanha `peer_model_v1`: convite após gerar orçamento, profissional → colega, com escolha de profissão. Mantém `ref` quando disponível. Não copia preços, nomes ou identificadores de documentos. Comparar por profissão, janela de 30 dias e dispositivo. É um piloto segmentado; não há distribuição aleatória A/B nem resultado de eficácia ainda.

## Eventos e interpretação

- `quote_started`: primeira edição; carregar um modelo sozinho não conta.
- `quote_preview_ready`: prévia realmente aberta; `elapsed_seconds` desde a primeira edição.
- `quote_delivery_details_opened`: passagem para os dados de envio.
- `quote_link_created`: criação confirmada pela API.
- `quote_link_copied`: cópia, não envio confirmado.
- `quote_whatsapp_send_started`: intenção de envio; não comprova entrega.
- `quote_recipient_view`: abertura do destinatário; pode sofrer influência de visualizações do proprietário, conforme a identificação da sessão.
- `referral_invite_started`: abertura do compartilhador, não envio confirmado.
- `creator_kit_copied`, `creator_kit_download`: interação com o kit, não publicação na rede.
- `quote_browser_first_created`, `quote_browser_second_created`, `quote_browser_repeat_created`: criação confirmada, deduplicada pelo documento neste navegador com consentimento. Não são pessoas únicas, nem prova de primeira utilização na vida; limpeza de armazenamento e outros dispositivos alteram essa contagem.
- `quote_browser_returned`: retorno após pelo menos 24h da última criação, no máximo uma vez por dia UTC, com consentimento.

Os eventos de navegador seguem a configuração de analytics existente. Não estimar usuários sem consentimento como zero. Eventos novos precisam ser selecionados nos relatórios de analytics após o deploy.

## Painel persistido

`/api/analytics/k100` continua restrito à equipe interna. K100 = 100 × novos criadores identificados cuja primeira criação histórica tem origem em documento / orçamentos criados na janela. Não denominar essa métrica como documentos compartilhados. A primeira criação é calculada considerando todos os orçamentos históricos, não apenas os indicados.

Repetição = identificados com pelo menos duas criações na janela / identificados ativos na janela. Retorno em dias distintos é uma medida separada; nenhuma delas substitui retenção por coorte D7/D30. Orçamentos anônimos sem identificação não permitem contar pessoas únicas nesse painel.

## Avaliação semanal

Comparar início → prévia → criação e mediana de segundos até prévia; abertura de orçamento; criações por campanha/profissão; segunda criação e retorno. Comparar períodos equivalentes, registrar tamanho da amostra e não atribuir causalidade a diferenças sem controle. Executar o piloto antes de prometer aumento de conversão.
