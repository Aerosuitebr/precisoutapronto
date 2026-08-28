import type { ProfessionLanding } from '@/lib/orcamentos/profession-presets';

export const EXPANDED_PROFESSION_LANDINGS: ProfessionLanding[] = [
  {
    slug: 'encanador', name: 'Encanador', title: 'Orçamento grátis para encanador com materiais e Pix',
    description: 'Monte um orçamento de encanador com diagnóstico, peças, mão de obra, prazo, aprovação no WhatsApp e pagamento por Pix.',
    promise: 'Modelo preparado para vazamentos, trocas, desentupimentos e instalações hidráulicas.',
    preset: { occupation: 'encanador', items: [{ nome: 'Visita e diagnóstico hidráulico' }, { nome: 'Peças e materiais' }, { nome: 'Mão de obra do reparo' }], observacoes: 'Identifique ambiente, ponto hidráulico e sinais observados.\nServiços ocultos ou adicionais dependem de novo orçamento e aprovação.\nPagamento via Pix após teste de funcionamento.' },
    checklist: ['Ponto e problema identificados', 'Peças separadas da mão de obra', 'Teste, prazo e garantia registrados'],
    example: { client: 'Cliente: Condomínio Ipê — exemplo fictício', items: [{ description: 'Diagnóstico', detail: 'Inspeção de vazamento sob pia e teste do registro', value: 'R$ 120,00' }, { description: 'Materiais', detail: 'Sifão, flexível e vedações', value: 'R$ 145,00' }, { description: 'Mão de obra', detail: 'Substituição, vedação e teste', value: 'R$ 280,00' }], total: 'R$ 545,00', terms: ['Validade: 5 dias', 'Execução estimada: 2 horas', 'Pix após teste sem vazamento'] },
    sections: [{ title: 'Como descrever o serviço hidráulico', paragraphs: ['Informe o ambiente, o componente afetado e o que será desmontado ou substituído.', 'Se a origem do problema ainda não estiver confirmada, apresente o diagnóstico como etapa separada.'] }, { title: 'Problemas ocultos', paragraphs: ['Tubulações embutidas podem exigir investigação adicional. Qualquer abertura, peça ou reparo fora do escopo deve ser apresentado ao cliente antes da execução.', 'O modelo organiza a proposta comercial e não substitui avaliação técnica no local.'] }],
    faqs: [{ q: 'Como cobrar uma visita sem reparo?', a: 'Crie um item de diagnóstico e diga se ele será abatido caso o serviço seja aprovado.' }, { q: 'Quem compra as peças?', a: 'Registre se o profissional fornecerá os materiais, as especificações consideradas e como diferenças serão aprovadas.' }]
  },
  {
    slug: 'marceneiro', name: 'Marceneiro', title: 'Orçamento para marceneiro com medidas e etapas',
    description: 'Apresente móveis sob medida com materiais, ferragens, instalação, cronograma, aprovação e entrada por Pix.',
    promise: 'Modelo preparado para armários, painéis, cozinhas e móveis planejados.',
    preset: { occupation: 'marceneiro', items: [{ nome: 'Projeto e medição técnica' }, { nome: 'Fabricação do móvel' }, { nome: 'Ferragens, entrega e instalação' }], observacoes: 'Confirme medidas após visita técnica.\nDescreva acabamento, ferragens e itens não inclusos.\nEntrada via Pix para compra de materiais e saldo conforme as etapas.' },
    checklist: ['Medidas e ambiente definidos', 'Material, acabamento e ferragens', 'Entrada, produção e montagem'],
    example: { client: 'Cliente: Lucas Mendes — exemplo fictício', items: [{ description: 'Projeto e medição', detail: 'Gabinete de cozinha com 2,40 m', value: 'R$ 350,00' }, { description: 'Fabricação', detail: 'MDF 18 mm branco, três módulos', value: 'R$ 3.480,00' }, { description: 'Instalação', detail: 'Ferragens, transporte e montagem', value: 'R$ 870,00' }], total: 'R$ 4.700,00', terms: ['Validade: 10 dias', 'Produção: 25 dias úteis após medição', '50% de entrada via Pix'] },
    sections: [{ title: 'Especificações que evitam dúvidas', paragraphs: ['Registre dimensões, tipo e espessura do painel, acabamento, ferragens e quantidade de portas e gavetas.', 'Explique se puxadores, iluminação, pedras e desmontagem de móveis antigos estão incluídos.'] }, { title: 'Pagamento por etapas', paragraphs: ['Vincule entrada à compra de materiais e parcelas seguintes à fabricação e montagem.', 'Alterações depois da aprovação devem gerar atualização de preço e prazo.'] }],
    faqs: [{ q: 'A medida inicial pode mudar?', a: 'Sim. Identifique-a como estimativa e condicione a produção à conferência técnica final.' }, { q: 'Como limitar alterações do projeto?', a: 'Defina as revisões incluídas e peça nova aprovação para mudanças de material, medida ou desenho.' }]
  },
  {
    slug: 'social-media', name: 'Social media', title: 'Orçamento para social media com entregas mensais',
    description: 'Organize planejamento, posts, vídeos, relatórios e revisões em um orçamento mensal com aprovação e Pix.',
    promise: 'Modelo preparado para gestão de redes sociais, conteúdo e campanhas.',
    preset: { occupation: 'social media', items: [{ nome: 'Planejamento e calendário editorial' }, { nome: 'Criação de posts e vídeos curtos' }, { nome: 'Publicação e relatório mensal' }], observacoes: 'Informe redes, volume mensal, formatos e rodadas de ajustes.\nVerba de mídia e produção externa não estão inclusas salvo indicação.\nPagamento mensal antecipado via Pix.' },
    checklist: ['Canais e volume mensal', 'Formatos e revisões', 'Mídia, prazo e aprovação'],
    example: { client: 'Cliente: Café do Centro — exemplo fictício', items: [{ description: 'Planejamento', detail: 'Calendário para Instagram e Facebook', value: 'R$ 450,00' }, { description: 'Conteúdo', detail: '12 posts e 4 vídeos curtos por mês', value: 'R$ 1.350,00' }, { description: 'Gestão', detail: 'Agendamento e relatório mensal', value: 'R$ 500,00' }], total: 'R$ 2.300,00/mês', terms: ['Ciclo mensal', 'Até 2 rodadas de ajustes por pauta', 'Pagamento antecipado via Pix'] },
    sections: [{ title: 'Entregáveis mensuráveis', paragraphs: ['Liste canais, quantidade de peças, formatos e o que o cliente precisa fornecer.', 'Diferencie criação, publicação, atendimento de comentários e gestão de anúncios.'] }, { title: 'Resultado não é promessa absoluta', paragraphs: ['Alcance e vendas dependem de audiência, oferta, plataforma e investimento. O orçamento deve prometer entregas controláveis, não números garantidos.', 'Registre a periodicidade do relatório e quais indicadores serão acompanhados.'] }],
    faqs: [{ q: 'A verba de anúncios entra no valor?', a: 'Normalmente é separada. Informe a taxa de gestão e deixe o investimento de mídia identificado.' }, { q: 'Como cobrar conteúdo extra?', a: 'Inclua valores unitários para post, vídeo ou cobertura adicional fora do pacote.' }]
  },
  {
    slug: 'manicure', name: 'Manicure', title: 'Orçamento para manicure com pacote e Pix',
    description: 'Monte pacotes de manicure, pedicure, alongamento e atendimento em domicílio com condições e Pix.',
    promise: 'Modelo preparado para atendimentos individuais, eventos e pacotes recorrentes.',
    preset: { occupation: 'manicure', items: [{ nome: 'Manicure e esmaltação' }, { nome: 'Pedicure' }, { nome: 'Deslocamento para atendimento' }], observacoes: 'Informe técnica, duração, local e materiais especiais.\nDefina antecedência para cancelamento e política de atraso.\nReserva mediante sinal via Pix.' },
    checklist: ['Serviços e técnica escolhidos', 'Local e duração', 'Sinal e cancelamento'],
    example: { client: 'Cliente: Ana Ribeiro — exemplo fictício', items: [{ description: 'Manicure', detail: 'Cutilagem e esmaltação tradicional', value: 'R$ 45,00' }, { description: 'Pedicure', detail: 'Cutilagem e esmaltação tradicional', value: 'R$ 55,00' }, { description: 'Domicílio', detail: 'Deslocamento no bairro informado', value: 'R$ 25,00' }], total: 'R$ 125,00', terms: ['Reserva por 24 horas', 'Sinal de R$ 40 via Pix', 'Remarcação com 12 horas de antecedência'] },
    sections: [{ title: 'Pacote claro para a cliente', paragraphs: ['Informe técnica, remoção anterior, decoração e manutenção como itens separados.', 'Para grupos ou eventos, registre quantidade de pessoas e tempo reservado.'] }, { title: 'Agenda e sinal', paragraphs: ['O sinal ajuda a confirmar o horário; descreva por escrito como funciona cancelamento e remarcação.', 'Evite anunciar duração ou resultado idêntico para todas as pessoas.'] }],
    faqs: [{ q: 'Posso cobrar sinal para reservar?', a: 'Sim. Informe valor, prazo de pagamento e regra de remarcação antes da confirmação.' }, { q: 'Como orçar nail art?', a: 'Crie um adicional por unha ou por complexidade e confirme a referência antes do atendimento.' }]
  },
  {
    slug: 'diarista', name: 'Diarista', title: 'Orçamento para diarista por ambiente e frequência',
    description: 'Detalhe ambientes, tipo de limpeza, duração, materiais, frequência e pagamento por Pix.',
    promise: 'Modelo preparado para limpeza comum, pesada, pós-obra e recorrente.',
    preset: { occupation: 'diarista', items: [{ nome: 'Limpeza dos ambientes' }, { nome: 'Serviços adicionais' }, { nome: 'Materiais e deslocamento' }], observacoes: 'Informe quantidade de cômodos, estado do imóvel e tarefas incluídas.\nLimpeza pós-obra, vidros externos e organização devem ser combinados à parte.\nPagamento via Pix ao final.' },
    checklist: ['Ambientes e tipo de limpeza', 'Tarefas incluídas e excluídas', 'Materiais, duração e frequência'],
    example: { client: 'Cliente: Residência Família Lima — exemplo fictício', items: [{ description: 'Limpeza comum', detail: 'Apartamento de 2 quartos e 2 banheiros', value: 'R$ 210,00' }, { description: 'Adicional', detail: 'Limpeza interna de geladeira', value: 'R$ 45,00' }, { description: 'Materiais', detail: 'Fornecidos pela cliente', value: 'R$ 0,00' }], total: 'R$ 255,00', terms: ['Duração estimada: 6 horas', 'Não inclui pós-obra', 'Pix ao final da diária'] },
    sections: [{ title: 'Escopo por ambiente', paragraphs: ['Liste os cômodos e tarefas importantes, como armários internos, janelas e eletrodomésticos.', 'Informe quem fornecerá produtos e equipamentos.'] }, { title: 'Estimativa baseada no estado do local', paragraphs: ['Tempo e preço podem variar conforme tamanho, acúmulo e acesso. Confirme essas condições antes de fechar.', 'Serviços adicionais devem ser autorizados antes de serem realizados.'] }],
    faqs: [{ q: 'Como cobrar limpeza pesada?', a: 'Considere tamanho, estado do imóvel, equipe, duração e tarefas especiais; não use apenas o número de quartos.' }, { q: 'Produtos estão inclusos?', a: 'Declare quem os fornece e cobre separadamente itens ou equipamentos especiais.' }]
  },
  {
    slug: 'vidraceiro', name: 'Vidraceiro', title: 'Orçamento para vidraceiro com medidas e instalação',
    description: 'Apresente vidro, espessura, ferragens, acabamento, instalação, prazo e entrada por Pix.',
    promise: 'Modelo preparado para boxes, espelhos, tampos e fechamentos.',
    preset: { occupation: 'vidraceiro', items: [{ nome: 'Medição técnica' }, { nome: 'Vidro e acabamento' }, { nome: 'Ferragens e instalação' }], observacoes: 'Confirme medidas, tipo, espessura e acabamento após visita.\nAlvenaria e adequações fora do escopo serão orçadas à parte.\nEntrada via Pix para produção.' },
    checklist: ['Medidas conferidas', 'Tipo, espessura e acabamento', 'Ferragens e instalação'],
    example: { client: 'Cliente: Paula Nunes — exemplo fictício', items: [{ description: 'Medição', detail: 'Vão de box em banheiro', value: 'R$ 80,00' }, { description: 'Vidro', detail: 'Temperado incolor 8 mm, duas folhas', value: 'R$ 980,00' }, { description: 'Instalação', detail: 'Kit de ferragens e montagem', value: 'R$ 370,00' }], total: 'R$ 1.430,00', terms: ['Validade: 7 dias', 'Produção: 12 dias úteis', '50% de entrada via Pix'] },
    sections: [{ title: 'Especificação antes do preço', paragraphs: ['O orçamento deve identificar aplicação, dimensões, tipo, espessura, cor e acabamento do vidro.', 'Ferragens, recortes, transporte e retirada do material antigo precisam aparecer no escopo.'] }, { title: 'Medição e instalação', paragraphs: ['Trate medidas preliminares como estimativas até a conferência técnica.', 'A escolha e instalação devem observar as condições do local e os requisitos aplicáveis ao produto.'] }],
    faqs: [{ q: 'Posso fechar com medida enviada pelo cliente?', a: 'Use-a para estimar, mas condicione fabricação e preço final à medição técnica.' }, { q: 'Como cobrar recortes e furos?', a: 'Liste-os por quantidade e tipo, pois alteram fabricação e custo.' }]
  },
  {
    slug: 'serralheiro', name: 'Serralheiro', title: 'Orçamento para serralheiro com material e montagem',
    description: 'Detalhe estrutura, medidas, metal, acabamento, transporte, montagem e pagamento por etapas.',
    promise: 'Modelo preparado para portões, grades, corrimãos e estruturas metálicas.',
    preset: { occupation: 'serralheiro', items: [{ nome: 'Medição e projeto' }, { nome: 'Material e fabricação' }, { nome: 'Pintura, transporte e montagem' }], observacoes: 'Informe medidas, perfil, espessura e acabamento considerados.\nAutomação, alvenaria e elétrica somente quando descritas.\nEntrada via Pix e saldo após montagem.' },
    checklist: ['Medidas e desenho', 'Perfil, espessura e acabamento', 'Montagem e itens externos'],
    example: { client: 'Cliente: Oficina Horizonte — exemplo fictício', items: [{ description: 'Projeto', detail: 'Grade fixa de 3,00 × 1,20 m', value: 'R$ 240,00' }, { description: 'Fabricação', detail: 'Metalon e chapas conforme desenho', value: 'R$ 1.860,00' }, { description: 'Acabamento e montagem', detail: 'Fundo anticorrosivo, pintura e fixação', value: 'R$ 720,00' }], total: 'R$ 2.820,00', terms: ['Validade: 7 dias', 'Prazo: 15 dias úteis', '40% de entrada via Pix'] },
    sections: [{ title: 'Material e acabamento', paragraphs: ['Registre perfis, espessuras, tipo de solda e acabamento considerados no preço.', 'Separe fabricação, pintura, transporte e montagem para facilitar comparações.'] }, { title: 'Condições do local', paragraphs: ['Confirme acesso, pontos de fixação e interferências antes da produção.', 'Projetos estruturais ou situações que exijam responsabilidade técnica devem ser avaliados por profissional habilitado.'] }],
    faqs: [{ q: 'Automação do portão está inclusa?', a: 'Somente se estiver listada com equipamento, instalação elétrica e testes.' }, { q: 'Como prever aumento do material?', a: 'Defina validade curta para a proposta e confirme o preço antes da compra.' }]
  },
  {
    slug: 'jardinagem', name: 'Jardinagem', title: 'Orçamento para jardinagem com manutenção e Pix',
    description: 'Organize poda, plantio, insumos, retirada de resíduos e manutenção recorrente em um orçamento claro.',
    promise: 'Modelo preparado para jardins residenciais, condomínios e manutenção periódica.',
    preset: { occupation: 'jardineiro', items: [{ nome: 'Avaliação e preparo do jardim' }, { nome: 'Poda, plantio e manutenção' }, { nome: 'Insumos e retirada de resíduos' }], observacoes: 'Informe área, espécies, frequência e acesso ao local.\nMudas, adubo e descarte devem ser discriminados.\nPagamento via Pix por visita ou mensalidade.' },
    checklist: ['Área e espécies', 'Serviços e frequência', 'Insumos e descarte'],
    example: { client: 'Cliente: Residencial das Flores — exemplo fictício', items: [{ description: 'Avaliação', detail: 'Jardim frontal de aproximadamente 80 m²', value: 'R$ 120,00' }, { description: 'Manutenção', detail: 'Poda, capina e acabamento', value: 'R$ 480,00' }, { description: 'Insumos e descarte', detail: 'Adubo, sacos e retirada de resíduos', value: 'R$ 190,00' }], total: 'R$ 790,00', terms: ['Uma visita de até 6 horas', 'Mudas não inclusas', 'Pix na conclusão'] },
    sections: [{ title: 'Visita ou manutenção recorrente', paragraphs: ['Para serviço único, descreva área e tarefas. Para contrato mensal, informe frequência, duração e atividades sazonais.', 'Liste insumos e retirada de resíduos separadamente.'] }, { title: 'Condições naturais', paragraphs: ['Clima, pragas e resposta das plantas podem mudar o resultado. Evite garantia absoluta e registre os cuidados esperados do cliente.', 'Poda de risco ou trabalho em altura exige avaliação e equipamento apropriados.'] }],
    faqs: [{ q: 'Como cobrar manutenção mensal?', a: 'Defina quantidade de visitas, horas estimadas e insumos incluídos no ciclo.' }, { q: 'Mudas entram no orçamento?', a: 'Liste espécie, tamanho, quantidade e substituições possíveis, ou declare que serão aprovadas à parte.' }]
  },
  {
    slug: 'reforma-apartamento', name: 'Reforma de apartamento', title: 'Orçamento para reforma de apartamento por etapa',
    description: 'Estruture demolição, instalações, revestimentos, acabamento, cronograma, aprovação e Pix por etapa.',
    promise: 'Modelo preparado para reformas parciais de apartamentos ocupados ou vazios.',
    preset: { occupation: 'reforma de apartamento', items: [{ nome: 'Proteção, demolição e descarte' }, { nome: 'Instalações e revestimentos' }, { nome: 'Pintura, acabamento e limpeza' }], observacoes: 'Descreva ambientes, projeto e condições verificadas na vistoria.\nMateriais, condomínio e serviços técnicos devem ter responsáveis definidos.\nPagamentos via Pix vinculados às etapas aprovadas.' },
    checklist: ['Ambientes e projeto', 'Etapas, materiais e descarte', 'Cronograma e pagamentos'],
    example: { client: 'Cliente: Apartamento 84 — exemplo fictício', items: [{ description: 'Preparação', detail: 'Proteção do elevador, demolição e caçamba', value: 'R$ 4.200,00' }, { description: 'Execução', detail: 'Cozinha e dois banheiros conforme projeto', value: 'R$ 18.600,00' }, { description: 'Acabamento', detail: 'Pintura dos ambientes e limpeza final', value: 'R$ 6.400,00' }], total: 'R$ 29.200,00', terms: ['Validade: 10 dias', 'Prazo estimado: 45 dias úteis', 'Pagamentos por marcos aprovados'] },
    sections: [{ title: 'Cronograma por marcos', paragraphs: ['Divida a reforma em preparação, instalações, revestimentos e acabamento, com critérios observáveis de conclusão.', 'Registre materiais fornecidos por cada parte, horários e regras do condomínio.'] }, { title: 'Projeto e responsabilidades', paragraphs: ['O orçamento comercial não substitui projeto, licença, laudo ou responsabilidade técnica quando aplicáveis.', 'Imprevistos devem ser documentados com impacto em custo e prazo antes da continuação.'] }],
    faqs: [{ q: 'Como tratar imprevistos?', a: 'Registre o achado, apresente preço e prazo complementares e aguarde aprovação.' }, { q: 'Quem paga caçamba e proteção?', a: 'Defina isso em itens próprios, incluindo taxas e exigências do condomínio.' }]
  },
  {
    slug: 'instalacao-eletrica', name: 'Instalação elétrica', title: 'Orçamento de instalação elétrica por ponto e circuito',
    description: 'Detalhe pontos, circuitos, quadro, materiais, testes, prazo, aprovação e Pix em uma proposta própria.',
    promise: 'Modelo preparado para instalação nova, ampliação e renovação elétrica.',
    preset: { occupation: 'instalação elétrica', items: [{ nome: 'Levantamento e distribuição de pontos' }, { nome: 'Quadro, cabos e materiais' }, { nome: 'Instalação, identificação e testes' }], observacoes: 'Informe quantidade de pontos, circuitos e condições da infraestrutura.\nObras civis e projeto técnico somente quando descritos.\nEntrada para materiais e saldo via Pix após testes.' },
    checklist: ['Pontos e circuitos contados', 'Materiais especificados', 'Testes e exclusões'],
    example: { client: 'Cliente: Loja Nova Estação — exemplo fictício', items: [{ description: 'Levantamento', detail: '18 pontos e 5 circuitos previstos', value: 'R$ 480,00' }, { description: 'Materiais', detail: 'Cabos, disjuntores, conduítes e caixas', value: 'R$ 2.750,00' }, { description: 'Instalação e testes', detail: 'Montagem, identificação e verificação funcional', value: 'R$ 3.400,00' }], total: 'R$ 6.630,00', terms: ['Validade: 7 dias', 'Prazo: 8 dias úteis', '40% de entrada para materiais'] },
    sections: [{ title: 'Preço por ponto não conta tudo', paragraphs: ['Além da quantidade, registre distância, infraestrutura, circuitos, quadro e condições existentes.', 'Materiais e adequações descobertas devem ser apresentados separadamente.'] }, { title: 'Escopo técnico', paragraphs: ['O gerador organiza a proposta, mas dimensionamento, normas e responsabilidade técnica cabem ao profissional habilitado quando exigidos.', 'Informe os testes previstos e o que caracteriza a entrega.'] }],
    faqs: [{ q: 'Posso cobrar por ponto elétrico?', a: 'Sim, desde que defina o que cada ponto inclui e trate quadro, circuitos e distâncias à parte.' }, { q: 'Projeto elétrico está incluso?', a: 'Somente quando descrito; não confunda orçamento de execução com projeto ou laudo.' }]
  },
  {
    slug: 'manutencao-ar-condicionado', name: 'Manutenção de ar-condicionado', title: 'Orçamento para manutenção de ar-condicionado',
    description: 'Apresente higienização, diagnóstico, peças, fluido, testes, prazo e Pix em um orçamento especializado.',
    promise: 'Modelo preparado para limpeza preventiva e correções em equipamentos split.',
    preset: { occupation: 'manutenção de ar-condicionado', items: [{ nome: 'Higienização preventiva' }, { nome: 'Diagnóstico e testes' }, { nome: 'Peças ou correções autorizadas' }], observacoes: 'Identifique modelo, capacidade, quantidade e sintomas.\nPeças e carga de fluido só serão executadas após diagnóstico e aprovação.\nPagamento via Pix na conclusão.' },
    checklist: ['Equipamento identificado', 'Preventiva separada de reparo', 'Peças e testes autorizados'],
    example: { client: 'Cliente: Escritório Alfa — exemplo fictício', items: [{ description: 'Higienização', detail: '2 aparelhos split de 12.000 BTU/h', value: 'R$ 360,00' }, { description: 'Diagnóstico', detail: 'Medições e inspeção de dreno', value: 'R$ 160,00' }, { description: 'Correção', detail: 'Desobstrução e teste do dreno', value: 'R$ 140,00' }], total: 'R$ 660,00', terms: ['Execução: 3 horas', 'Peças não previstas dependem de aprovação', 'Pix na conclusão'] },
    sections: [{ title: 'Preventiva e reparo são escopos diferentes', paragraphs: ['Higienização não deve ocultar troca de peças, correção de vazamento ou carga de fluido.', 'Identifique cada aparelho e os testes incluídos.'] }, { title: 'Diagnóstico antes da promessa', paragraphs: ['Sintomas semelhantes podem ter causas diferentes. Registre hipóteses como diagnóstico, não como garantia de reparo.', 'Intervenções devem seguir especificações do equipamento e avaliação profissional.'] }],
    faqs: [{ q: 'Carga de gás está inclusa?', a: 'Somente se estiver descrita após diagnóstico; informe fluido, quantidade estimada e correção da causa.' }, { q: 'Como cobrar vários aparelhos?', a: 'Use a quantidade por tipo e aplique desconto de visita apenas quando fizer sentido operacional.' }]
  },
  {
    slug: 'criacao-de-logotipo', name: 'Criação de logotipo', title: 'Orçamento para criação de logotipo com revisões',
    description: 'Defina briefing, propostas, revisões, arquivos finais, prazo, direitos de uso e entrada por Pix.',
    promise: 'Modelo preparado para logotipo e pacote inicial de identidade visual.',
    preset: { occupation: 'designer de logotipo', items: [{ nome: 'Briefing e pesquisa visual' }, { nome: 'Criação e apresentação de propostas' }, { nome: 'Ajustes e arquivos finais' }], observacoes: 'Informe quantidade de propostas e rodadas de revisão.\nRegistro de marca, fontes pagas e peças adicionais não estão inclusos salvo indicação.\n50% de entrada via Pix.' },
    checklist: ['Propostas e revisões', 'Formatos de arquivo', 'Direitos e itens não inclusos'],
    example: { client: 'Cliente: Aurora Consultoria — exemplo fictício', items: [{ description: 'Briefing', detail: 'Reunião, pesquisa e direção visual', value: 'R$ 450,00' }, { description: 'Criação', detail: 'Duas rotas de logotipo apresentadas', value: 'R$ 1.450,00' }, { description: 'Finalização', detail: 'Até 2 revisões e arquivos SVG, PDF e PNG', value: 'R$ 600,00' }], total: 'R$ 2.500,00', terms: ['Prazo: 15 dias úteis', '50% de entrada via Pix', 'Registro de marca não incluso'] },
    sections: [{ title: 'Entregáveis e revisões', paragraphs: ['Defina quantas rotas serão apresentadas, quantas revisões estão incluídas e quais arquivos serão entregues.', 'Mudança de briefing após aprovação deve gerar ajuste de escopo.'] }, { title: 'Uso e registro', paragraphs: ['Explique quando os direitos de uso serão transferidos e quais elementos têm licença de terceiros.', 'Criação visual e pesquisa preliminar não garantem disponibilidade ou registro da marca; orientação especializada pode ser necessária.'] }],
    faqs: [{ q: 'Quantas opções de logo oferecer?', a: 'Escolha um número coerente com seu processo e descreva se são rotas distintas ou variações.' }, { q: 'O registro da marca está incluso?', a: 'Não presuma. Declare se pesquisa e registro são serviços separados e evite garantir aprovação.' }]
  },
  {
    slug: 'fotografia-casamento', name: 'Fotografia de casamento', title: 'Orçamento de fotografia para casamento',
    description: 'Monte pacote de casamento com horas de cobertura, equipe, fotos, álbum, deslocamento, reserva e Pix.',
    promise: 'Modelo preparado para cerimônia, recepção, making of e ensaio.',
    preset: { occupation: 'fotógrafo de casamento', items: [{ nome: 'Cobertura fotográfica do casamento' }, { nome: 'Segundo fotógrafo e deslocamento' }, { nome: 'Tratamento, galeria e álbum' }], observacoes: 'Informe data, locais, duração, equipe e prazo de entrega.\nÁlbum, impressão e horas extras devem ser discriminados.\nReserva da data mediante entrada via Pix.' },
    checklist: ['Data, locais e duração', 'Equipe e entregas', 'Reserva e horas extras'],
    example: { client: 'Cliente: Camila e André — exemplo fictício', items: [{ description: 'Cobertura', detail: 'Making of, cerimônia e recepção por 8 horas', value: 'R$ 4.200,00' }, { description: 'Equipe', detail: 'Segundo fotógrafo e deslocamento urbano', value: 'R$ 1.100,00' }, { description: 'Entrega', detail: 'Galeria tratada e álbum 25 × 30 cm', value: 'R$ 1.700,00' }], total: 'R$ 7.000,00', terms: ['Reserva de 30% via Pix', 'Hora extra: R$ 450', 'Galeria em até 45 dias úteis'] },
    sections: [{ title: 'Cobertura sem lacunas', paragraphs: ['Registre horários, locais, equipe e eventos cobertos, além do limite de horas.', 'Defina estimativa de fotos, seleção, tratamento, formato e prazo.'] }, { title: 'Reserva da data', paragraphs: ['Informe entrada, vencimentos e condições de remarcação ou cancelamento de forma clara.', 'Direito de imagem e autorização para portfólio devem ser tratados expressamente, sem presumir consentimento.'] }],
    faqs: [{ q: 'Como cobrar hora extra?', a: 'Informe o valor e quem pode autorizar a extensão no dia do evento.' }, { q: 'Posso publicar as fotos no portfólio?', a: 'Combine autorização específica com o casal; não trate a aprovação do orçamento como consentimento automático.' }]
  }
];
