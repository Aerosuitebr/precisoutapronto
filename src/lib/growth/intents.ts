export type IntentPage = {
  slug: string;
  title: string;
  description: string;
  answer: string;
  segmentSlugs: string[];
  toolHref: string;
  toolLabel: string;
  steps: string[];
  faqs: Array<{ question: string; answer: string }>;
};

export const intentPages: IntentPage[] = [
  {
    slug: 'contrato-de-prestacao-de-servicos',
    title: 'Contrato de prestação de serviços: crie um modelo para o seu caso',
    description: 'Entenda os dados e cláusulas essenciais e use o assistente para preparar uma primeira versão.',
    answer: 'Um contrato de prestação de serviços deve identificar as partes e definir escopo, entregas, prazo, preço, pagamento, responsabilidades e encerramento.',
    segmentSlugs: ['mei', 'freelancers', 'empresas', 'advogados', 'prestadores'],
    toolHref: '/assistente/documentos?tipo=contrato',
    toolLabel: 'Criar com o assistente',
    steps: ['Descreva o serviço e as partes', 'Defina prazo, entregas e pagamento', 'Revise alertas e cláusulas sugeridas', 'Abra a versão no editor atual'],
    faqs: [
      { question: 'O modelo serve para qualquer serviço?', answer: 'Ele é uma base adaptável. O risco e as regras de cada atividade precisam ser avaliados no caso concreto.' },
      { question: 'A IA substitui revisão jurídica?', answer: 'Não. O assistente organiza informações e aponta cuidados gerais, mas não presta aconselhamento jurídico.' }
    ]
  },
  {
    slug: 'curriculo-para-primeiro-emprego',
    title: 'Currículo para primeiro emprego: estrutura e modelo',
    description: 'Monte um currículo objetivo mesmo sem experiência formal, destacando formação, projetos e competências.',
    answer: 'No primeiro currículo, priorize objetivo específico, formação, cursos, projetos, voluntariado e competências demonstráveis.',
    segmentSlugs: ['estudantes', 'rh'],
    toolHref: '/assistente/documentos?tipo=curriculo',
    toolLabel: 'Montar meu currículo',
    steps: ['Informe a vaga desejada', 'Adicione formação e projetos', 'Receba sugestões de palavras-chave', 'Finalize no gerador de currículo'],
    faqs: [
      { question: 'Preciso colocar foto?', answer: 'Na maioria das vagas, não. Use apenas quando o contexto justificar.' },
      { question: 'Posso ter uma página só?', answer: 'Sim. Para início de carreira, uma página clara costuma ser suficiente.' }
    ]
  },
  {
    slug: 'recibo-para-mei',
    title: 'Recibo para MEI: dados obrigatórios e modelo',
    description: 'Crie um recibo organizado para registrar pagamentos do seu negócio.',
    answer: 'O recibo deve identificar pagador e recebedor, valor, finalidade, data, local e assinatura. Ele não substitui nota fiscal quando ela for obrigatória.',
    segmentSlugs: ['mei', 'contadores'],
    toolHref: '/gerador-de-recibo',
    toolLabel: 'Gerar recibo',
    steps: ['Identifique pagador e recebedor', 'Descreva o pagamento', 'Confira valor e data', 'Exporte e compartilhe o PDF'],
    faqs: [
      { question: 'Recibo substitui nota fiscal?', answer: 'Não necessariamente. Confirme a obrigação fiscal da atividade e do município.' },
      { question: 'Pode ser assinado digitalmente?', answer: 'Sim, desde que o fluxo preserve autoria, integridade e concordância.' }
    ]
  },
  {
    slug: 'como-calcular-rescisao',
    title: 'Como calcular rescisão trabalhista',
    description: 'Organize as informações do desligamento e estime as principais verbas.',
    answer: 'A rescisão depende da modalidade e normalmente considera saldo salarial, 13º, férias, aviso-prévio e verbas relacionadas ao FGTS.',
    segmentSlugs: ['rh', 'contadores'],
    toolHref: '/calculadora-de-rescisao',
    toolLabel: 'Calcular rescisão',
    steps: ['Escolha a modalidade', 'Informe datas e remuneração', 'Confira as verbas estimadas', 'Valide particularidades do caso'],
    faqs: [
      { question: 'O resultado é definitivo?', answer: 'Não. É uma estimativa e pode variar por médias, convenções e descontos.' },
      { question: 'Serve para acordo?', answer: 'Use a modalidade correspondente e confira as regras aplicáveis.' }
    ]
  },
  {
    slug: 'proposta-comercial-para-mei',
    title: 'Proposta comercial para MEI: modelo simples e profissional',
    description: 'Apresente escopo, prazo e preço com clareza antes de começar o serviço.',
    answer: 'Uma proposta de MEI deve resumir o problema do cliente, entregas, cronograma, investimento, validade e condições para aprovação.',
    segmentSlugs: ['mei'],
    toolHref: '/gerador-de-proposta-comercial',
    toolLabel: 'Criar proposta',
    steps: ['Identifique cliente e necessidade', 'Liste entregas e limites', 'Defina preço, prazo e validade', 'Revise e envie a proposta'],
    faqs: [
      { question: 'Proposta substitui contrato?', answer: 'Nem sempre. Depois da aprovação, um contrato pode detalhar responsabilidades e encerramento.' },
      { question: 'Precisa ter CNPJ?', answer: 'Identifique corretamente o MEI e o cliente com os dados disponíveis para a negociação.' }
    ]
  },
  {
    slug: 'quanto-cobrar-por-hora',
    title: 'Quanto cobrar por hora como autônomo',
    description: 'Calcule um valor sustentável considerando custos, impostos e horas realmente vendáveis.',
    answer: 'O preço por hora deve cobrir custos pessoais e do negócio, impostos, períodos sem faturamento, margem e as horas produtivas que podem ser vendidas.',
    segmentSlugs: ['freelancers'],
    toolHref: '/calculadora-de-preco-freelancer',
    toolLabel: 'Calcular preço por hora',
    steps: ['Some custos mensais', 'Defina renda e margem desejadas', 'Estime horas faturáveis', 'Compare o resultado com o mercado'],
    faqs: [
      { question: 'Devo usar todas as horas do mês?', answer: 'Não. Separe tempo comercial, administrativo, estudo, férias e períodos sem projeto.' },
      { question: 'Preço por projeto é melhor?', answer: 'Pode ser, mas conhecer seu custo por hora ajuda a validar se o projeto é sustentável.' }
    ]
  },
  {
    slug: 'proposta-comercial-para-freelancer',
    title: 'Proposta comercial para freelancer',
    description: 'Organize entregáveis, revisões, cronograma e investimento em uma proposta convincente.',
    answer: 'A proposta do freelancer deve conectar o problema do cliente ao resultado, delimitar o escopo e explicar valores, prazos, revisões e validade.',
    segmentSlugs: ['freelancers'],
    toolHref: '/assistente/documentos?tipo=proposta',
    toolLabel: 'Montar proposta',
    steps: ['Descreva o objetivo', 'Detalhe entregáveis e revisões', 'Informe cronograma e investimento', 'Defina validade e próximo passo'],
    faqs: [
      { question: 'Devo mostrar o preço por hora?', answer: 'Só quando isso ajudar a negociação. Muitos projetos ficam mais claros com preço por entrega.' },
      { question: 'Quantas revisões incluir?', answer: 'Declare uma quantidade objetiva e explique como alterações adicionais serão cobradas.' }
    ]
  },
  {
    slug: 'proposta-comercial-para-empresa',
    title: 'Proposta comercial para empresa',
    description: 'Padronize oportunidades comerciais sem perder contexto e clareza.',
    answer: 'Uma proposta empresarial eficaz apresenta diagnóstico, solução, escopo, responsáveis, cronograma, investimento, validade e condições comerciais.',
    segmentSlugs: ['empresas', 'gestores'],
    toolHref: '/gerador-de-proposta-comercial',
    toolLabel: 'Criar proposta empresarial',
    steps: ['Contextualize a oportunidade', 'Apresente solução e entregas', 'Defina cronograma e responsáveis', 'Inclua investimento e aceite'],
    faqs: [
      { question: 'Quanto tempo a proposta deve valer?', answer: 'Defina um prazo compatível com custos, agenda e condições comerciais, deixando a data explícita.' },
      { question: 'Posso oferecer opções?', answer: 'Sim. Pacotes comparáveis ajudam o cliente a escolher sem descaracterizar o escopo.' }
    ]
  },
  {
    slug: 'calculo-de-ferias',
    title: 'Cálculo de férias: entenda os valores',
    description: 'Estime remuneração, adicional de um terço e descontos do período.',
    answer: 'O cálculo normalmente considera remuneração aplicável, quantidade de dias, adicional constitucional de um terço, médias e descontos.',
    segmentSlugs: ['rh'],
    toolHref: '/calculadora-de-ferias',
    toolLabel: 'Calcular férias',
    steps: ['Informe salário e período', 'Defina dias e eventual abono', 'Confira adicional e descontos', 'Valide médias e regras coletivas'],
    faqs: [
      { question: 'Horas extras entram nas férias?', answer: 'Médias habituais podem integrar o cálculo; confira o histórico e as regras aplicáveis.' },
      { question: 'Quando as férias são pagas?', answer: 'Observe o prazo legal vigente e as particularidades do vínculo.' }
    ]
  },
  {
    slug: 'documentos-contabeis-para-clientes',
    title: 'Documentos contábeis para organizar o atendimento a clientes',
    description: 'Padronize solicitações, declarações e comprovantes da rotina contábil.',
    answer: 'Uma biblioteca contábil útil reúne modelos revisáveis, identifica finalidade e responsável e mantém histórico de emissão para cada cliente.',
    segmentSlugs: ['contadores'],
    toolHref: '/documentos-contabeis-online',
    toolLabel: 'Criar documento contábil',
    steps: ['Escolha a finalidade', 'Confirme dados do cliente', 'Preencha período e declarações', 'Revise antes de emitir'],
    faqs: [
      { question: 'Um modelo serve para todos os clientes?', answer: 'Use uma base padronizada, mas revise regime, período, finalidade e exigências do destinatário.' },
      { question: 'Como evitar versões erradas?', answer: 'Registre data, responsável, cliente e versão, preservando o histórico.' }
    ]
  },
  {
    slug: 'mei-ou-clt',
    title: 'MEI ou CLT: como comparar os dois cenários',
    description: 'Compare renda, custos, benefícios e riscos antes de tomar uma decisão.',
    answer: 'A comparação deve considerar remuneração líquida, benefícios, impostos, custos de operação, férias, proteção social, autonomia e riscos da relação.',
    segmentSlugs: ['contadores'],
    toolHref: '/mei-ou-clt',
    toolLabel: 'Comparar MEI e CLT',
    steps: ['Informe valores dos dois cenários', 'Inclua benefícios e despesas', 'Compare resultado anual', 'Avalie riscos e condições reais'],
    faqs: [
      { question: 'O maior valor mensal sempre vence?', answer: 'Não. Benefícios, custos, períodos sem faturamento e proteção social alteram o resultado.' },
      { question: 'Todo prestador pode ser MEI?', answer: 'Não. Verifique atividade permitida, limites e se a relação prática caracteriza vínculo.' }
    ]
  },
  {
    slug: 'contrato-de-aluguel',
    title: 'Contrato de aluguel: informações e cláusulas essenciais',
    description: 'Organize imóvel, prazo, valor, reajuste, garantia e responsabilidades.',
    answer: 'O contrato deve identificar partes e imóvel e definir uso, prazo, aluguel, reajuste, encargos, garantia, vistoria e condições de devolução.',
    segmentSlugs: ['advogados'],
    toolHref: '/contrato-de-aluguel',
    toolLabel: 'Criar contrato de aluguel',
    steps: ['Identifique partes e imóvel', 'Defina prazo, aluguel e reajuste', 'Registre garantia e encargos', 'Anexe vistoria e revise'],
    faqs: [
      { question: 'É necessário reconhecer firma?', answer: 'Nem sempre, mas a formalização e as assinaturas precisam permitir comprovar autoria e concordância.' },
      { question: 'Quem paga condomínio e impostos?', answer: 'Distribua expressamente cada encargo conforme a legislação e o acordo aplicável.' }
    ]
  },
  {
    slug: 'documentos-juridicos-online',
    title: 'Documentos jurídicos online: escolha e revise o modelo correto',
    description: 'Comece com uma estrutura organizada e adapte cada documento ao caso concreto.',
    answer: 'Modelos jurídicos economizam tempo, mas devem ser selecionados pela finalidade e revisados quanto a partes, fatos, poderes, prazos e riscos.',
    segmentSlugs: ['advogados'],
    toolHref: '/documentos-juridicos-online',
    toolLabel: 'Criar documento jurídico',
    steps: ['Escolha o tipo adequado', 'Preencha fatos e partes', 'Revise poderes, pedidos e prazos', 'Valide a versão final'],
    faqs: [
      { question: 'Modelo pronto dispensa revisão?', answer: 'Não. Um modelo é ponto de partida e pode conter previsões inadequadas ao caso.' },
      { question: 'Posso reutilizar dados?', answer: 'Sim, com controles de privacidade, atualização e conferência antes de cada emissão.' }
    ]
  },
  {
    slug: 'referencias-abnt-online',
    title: 'Referências ABNT online: organize as fontes do trabalho',
    description: 'Reúna os dados bibliográficos e padronize livros, sites e artigos.',
    answer: 'A referência depende do tipo de fonte e normalmente usa autoria, título, edição, local, editora, data e informações de acesso.',
    segmentSlugs: ['estudantes'],
    toolHref: '/gerador-de-referencias-abnt',
    toolLabel: 'Formatar referências',
    steps: ['Identifique o tipo de fonte', 'Reúna os dados bibliográficos', 'Gere a referência', 'Confira com a orientação da instituição'],
    faqs: [
      { question: 'Todo site precisa de data de acesso?', answer: 'Fontes online geralmente exigem URL e acesso conforme a norma e o tipo documental.' },
      { question: 'A ferramenta substitui conferência?', answer: 'Não. Dados incompletos na fonte exigem revisão e podem mudar a formatação.' }
    ]
  },
  {
    slug: 'como-fazer-redacao-enem',
    title: 'Como fazer uma redação para o ENEM',
    description: 'Estruture tese, argumentos e proposta de intervenção com clareza.',
    answer: 'Uma redação consistente compreende o tema, apresenta tese, desenvolve argumentos conectados e conclui com proposta de intervenção detalhada.',
    segmentSlugs: ['estudantes'],
    toolHref: '/corretor-de-redacao-enem',
    toolLabel: 'Analisar minha redação',
    steps: ['Leia tema e textos motivadores', 'Defina tese e dois argumentos', 'Desenvolva com repertório pertinente', 'Revise intervenção e linguagem'],
    faqs: [
      { question: 'Preciso citar um autor?', answer: 'Não obrigatoriamente. Use repertório pertinente e produtivo, sem citações decoradas fora de contexto.' },
      { question: 'Quantos parágrafos usar?', answer: 'Não há fórmula única; introdução, dois desenvolvimentos e conclusão formam uma estrutura frequente.' }
    ]
  },
  {
    slug: 'orcamento-para-prestador-de-servico',
    title: 'Orçamento para prestador de serviço',
    description: 'Apresente materiais, mão de obra, prazo e condições antes da aprovação.',
    answer: 'O orçamento deve identificar cliente e prestador, descrever itens e quantidades, separar custos quando útil e informar total, validade, prazo e pagamento.',
    segmentSlugs: ['prestadores'],
    toolHref: '/orcamento-com-pix',
    toolLabel: 'Criar orçamento',
    steps: ['Entenda o serviço solicitado', 'Liste mão de obra e materiais', 'Calcule total e prazo', 'Defina validade e forma de aprovação'],
    faqs: [
      { question: 'Orçamento pode ser cobrado?', answer: 'Depende do serviço e da política informada previamente, especialmente quando há visita ou diagnóstico.' },
      { question: 'Como tratar serviço extra?', answer: 'Declare o que está fora do escopo e exija nova aprovação para adicionais.' }
    ]
  },
  {
    slug: 'recibo-de-pagamento',
    title: 'Recibo de pagamento: modelo e informações essenciais',
    description: 'Registre valor, finalidade, partes, data e assinatura de forma clara.',
    answer: 'O recibo comprova o pagamento descrito e deve informar quem pagou, quem recebeu, valor, finalidade, data e forma de quitação.',
    segmentSlugs: ['empresas', 'prestadores'],
    toolHref: '/recibo-de-pagamento',
    toolLabel: 'Gerar recibo de pagamento',
    steps: ['Identifique as partes', 'Informe valor e finalidade', 'Registre data e forma de pagamento', 'Revise, assine e compartilhe'],
    faqs: [
      { question: 'Recibo prova quitação total?', answer: 'O texto deve deixar claro se a quitação é total, parcial ou vinculada a uma parcela.' },
      { question: 'Posso enviar em PDF?', answer: 'Sim. Preserve uma versão íntegra e meios de demonstrar autoria e aceite.' }
    ]
  },
  {
    slug: 'recibo-para-profissional-de-saude',
    title: 'Recibo para profissional de saúde',
    description: 'Organize dados do atendimento e do pagamento com cuidado e objetividade.',
    answer: 'O recibo deve identificar profissional e pagador, valor, data e finalidade suficiente, evitando exposição desnecessária de informações sensíveis.',
    segmentSlugs: ['saude'],
    toolHref: '/gerador-de-recibo',
    toolLabel: 'Criar recibo',
    steps: ['Confirme dados necessários', 'Informe valor e data', 'Descreva a finalidade sem excesso', 'Revise e entregue ao pagador'],
    faqs: [
      { question: 'Devo informar diagnóstico?', answer: 'Evite dados clínicos desnecessários; use apenas informações exigidas para a finalidade do documento.' },
      { question: 'Recibo substitui nota fiscal?', answer: 'A obrigação fiscal depende da atividade e das regras locais. Confirme o caso aplicável.' }
    ]
  },
  {
    slug: 'agenda-profissional-online',
    title: 'Agenda profissional online para organizar atendimentos',
    description: 'Centralize horários, compromissos e lembretes da rotina profissional.',
    answer: 'Uma agenda profissional eficaz registra horário, duração, tipo de compromisso e observações mínimas, com rotina de confirmação e atualização.',
    segmentSlugs: ['saude'],
    toolHref: '/agenda-online',
    toolLabel: 'Organizar agenda',
    steps: ['Cadastre horários disponíveis', 'Registre compromissos essenciais', 'Revise conflitos e intervalos', 'Acompanhe próximos atendimentos'],
    faqs: [
      { question: 'Quais dados devo guardar?', answer: 'Mantenha apenas os dados necessários para organizar o compromisso e proteja informações sensíveis.' },
      { question: 'Preciso reservar intervalos?', answer: 'Sim. Considere preparação, atrasos, deslocamento e tarefas posteriores ao atendimento.' }
    ]
  },
  {
    slug: 'cronograma-de-entregas',
    title: 'Cronograma de entregas: organize etapas e responsáveis',
    description: 'Transforme um projeto em marcos claros, com prazos e acompanhamento.',
    answer: 'Um cronograma útil divide o resultado em entregas verificáveis, define responsáveis, dependências, datas e critérios para considerar cada etapa concluída.',
    segmentSlugs: ['gestores'],
    toolHref: '/agenda-online',
    toolLabel: 'Criar cronograma',
    steps: ['Liste resultados esperados', 'Divida em etapas e dependências', 'Defina responsáveis e datas', 'Revise progresso e impedimentos'],
    faqs: [
      { question: 'Como estimar prazos?', answer: 'Use referências anteriores, valide com responsáveis e reserve margem para riscos conhecidos.' },
      { question: 'O cronograma deve mudar?', answer: 'Sim, quando fatos mudarem. Registre a revisão e comunique impactos às pessoas envolvidas.' }
    ]
  }
];

export function getIntentPage(slug: string) {
  return intentPages.find((page) => page.slug === slug);
}

export function getRelatedIntentPages(page: IntentPage, limit = 3) {
  const segments = new Set(page.segmentSlugs);
  return intentPages
    .filter((candidate) => candidate.slug !== page.slug)
    .map((candidate) => ({
      candidate,
      score:
        candidate.segmentSlugs.filter((slug) => segments.has(slug)).length * 2 +
        (candidate.toolHref.split('?')[0] === page.toolHref.split('?')[0] ? 1 : 0)
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.candidate.slug.localeCompare(right.candidate.slug))
    .slice(0, Math.max(0, limit))
    .map(({ candidate }) => candidate);
}
