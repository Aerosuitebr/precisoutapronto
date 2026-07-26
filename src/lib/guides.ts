export type Guide = {
  slug: string;
  title: string;
  description: string;
  answer: string;
  category: string;
  readTime: string;
  toolHref: string;
  toolLabel: string;
  sections: Array<{ title: string; paragraphs: string[]; bullets?: string[] }>;
  faq: Array<{ question: string; answer: string }>;
};

export const guides: Guide[] = [
  {
    slug: 'modelo-de-recibo-mei',
    title: 'Modelo de recibo para MEI: o que incluir e como preencher',
    description:
      'Veja quais dados colocar em um recibo de pagamento do MEI e gere um documento organizado em poucos minutos.',
    answer:
      'Um recibo para MEI deve identificar quem recebeu, quem pagou, o valor, a finalidade, a data e a forma de pagamento. O documento comprova a quitação descrita, mas não substitui uma nota fiscal quando ela for obrigatória.',
    category: 'Financeiro',
    readTime: '6 min',
    toolHref: '/gerador-de-recibo',
    toolLabel: 'Gerar recibo agora',
    sections: [
      {
        title: 'Dados essenciais do recibo',
        paragraphs: [
          'O recibo precisa ser específico o bastante para não deixar dúvida sobre o pagamento. Use nome ou razão social, CPF ou CNPJ quando necessário, valor por extenso e uma descrição objetiva do serviço ou produto.',
          'Também registre a data do recebimento e a forma de pagamento. Em uma transferência Pix, por exemplo, você pode indicar apenas “Pix”, sem inserir chave, dados bancários ou informações sensíveis.'
        ],
        bullets: ['Identificação de pagador e recebedor', 'Valor numérico e por extenso', 'Motivo do pagamento', 'Data, local e assinatura']
      },
      {
        title: 'Recibo e nota fiscal não são a mesma coisa',
        paragraphs: [
          'O recibo demonstra que um valor foi pago. A nota fiscal registra uma operação para fins fiscais. A obrigação de emitir nota depende da atividade, do cliente e das regras do município ou estado.',
          'Quando houver dúvida tributária, confirme a regra aplicável com a prefeitura ou um profissional contábil.'
        ]
      },
      {
        title: 'Como reduzir erros',
        paragraphs: [
          'Evite descrições genéricas como “serviços diversos”. Prefira algo verificável, como “manutenção preventiva realizada em 12 de maio”. Revise nomes, valores e datas antes de exportar o PDF.'
        ]
      }
    ],
    faq: [
      { question: 'Recibo precisa de assinatura?', answer: 'A assinatura reforça a autoria e a confirmação do recebimento. Em fluxos digitais, preserve também o histórico de envio e aceite.' },
      { question: 'Posso emitir recibo de pagamento por Pix?', answer: 'Sim. Informe Pix como forma de pagamento e descreva claramente a operação quitada.' },
      { question: 'O recibo substitui nota fiscal?', answer: 'Não necessariamente. A nota fiscal atende obrigações fiscais específicas; confirme a exigência da sua atividade.' }
    ]
  },
  {
    slug: 'contrato-de-prestacao-de-servicos-gratis',
    title: 'Contrato de prestação de serviços: estrutura e modelo grátis',
    description:
      'Entenda as cláusulas essenciais de um contrato de serviços e monte um documento claro para cliente e prestador.',
    answer:
      'Um contrato de prestação de serviços deve definir partes, escopo, entregas, prazo, preço, forma de pagamento, responsabilidades e regras de encerramento. Quanto mais objetivo o escopo, menor o risco de expectativa desalinhada.',
    category: 'Jurídico',
    readTime: '8 min',
    toolHref: '/gerador-de-contrato',
    toolLabel: 'Montar contrato',
    sections: [
      {
        title: 'Comece pelo escopo',
        paragraphs: [
          'O escopo é a parte mais importante do contrato. Liste o que será entregue, o formato, a quantidade de revisões e o que fica fora da contratação.',
          'Evite promessas abertas. Em vez de “cuidar das redes sociais”, detalhe canais, frequência de publicação, produção de arte, aprovação e relatórios.'
        ]
      },
      {
        title: 'Preço, prazo e aceite',
        paragraphs: [
          'Defina valor, vencimento, meio de pagamento e consequência de atraso. Para entregas por etapas, relacione cada parcela a um marco verificável.',
          'Inclua como o cliente aprovará o serviço e em quanto tempo deverá enviar informações ou feedback.'
        ],
        bullets: ['Datas e marcos objetivos', 'Quantidade de ajustes', 'Critério de aceite', 'Condições para cancelamento']
      },
      {
        title: 'Use linguagem compreensível',
        paragraphs: [
          'Um bom contrato não precisa ser obscuro. Frases curtas, títulos claros e termos consistentes facilitam a revisão pelas duas partes. Para situações de maior risco, procure orientação jurídica.'
        ]
      }
    ],
    faq: [
      { question: 'Contrato digital tem validade?', answer: 'Documentos eletrônicos podem ser válidos quando autoria, integridade e concordância podem ser demonstradas.' },
      { question: 'É obrigatório reconhecer firma?', answer: 'Nem todo contrato exige reconhecimento de firma. A necessidade depende do negócio e do nível de segurança desejado.' },
      { question: 'Posso editar o modelo?', answer: 'Sim. O modelo deve ser adaptado ao serviço real, nunca usado sem revisão.' }
    ]
  },
  {
    slug: 'como-calcular-rescisao',
    title: 'Como calcular rescisão trabalhista: guia dos principais valores',
    description:
      'Conheça saldo de salário, férias, 13º, aviso-prévio e FGTS antes de fazer uma estimativa de rescisão.',
    answer:
      'O cálculo de rescisão depende do motivo e da data do desligamento. Em geral, são avaliados saldo de salário, 13º proporcional, férias vencidas e proporcionais com 1/3, aviso-prévio e verbas ligadas ao FGTS.',
    category: 'Trabalho',
    readTime: '9 min',
    toolHref: '/calculadora-de-rescisao',
    toolLabel: 'Simular rescisão',
    sections: [
      {
        title: 'Identifique o tipo de desligamento',
        paragraphs: [
          'Pedido de demissão, dispensa sem justa causa, justa causa e acordo têm conjuntos diferentes de verbas. Antes de calcular, confirme a modalidade e as datas de admissão e desligamento.',
          'A remuneração variável, adicionais e regras coletivas também podem alterar a base.'
        ]
      },
      {
        title: 'Verbas mais frequentes',
        paragraphs: [
          'O saldo de salário corresponde aos dias trabalhados no mês. O 13º e as férias proporcionais consideram os avos adquiridos, enquanto férias vencidas seguem o período aquisitivo.',
          'Aviso-prévio e multa do FGTS variam conforme a forma de encerramento.'
        ],
        bullets: ['Saldo de salário', '13º proporcional', 'Férias + 1/3', 'Aviso-prévio', 'FGTS quando aplicável']
      },
      {
        title: 'Use a simulação como conferência',
        paragraphs: [
          'Calculadoras oferecem uma estimativa inicial, não uma homologação. Compare o resultado com documentos da empresa e procure orientação profissional em caso de divergência.'
        ]
      }
    ],
    faq: [
      { question: 'A calculadora mostra o valor líquido?', answer: 'A estimativa pode não incluir todos os descontos e particularidades. Confira a indicação exibida no resultado.' },
      { question: 'Horas extras entram no cálculo?', answer: 'Médias de verbas habituais podem afetar a base, conforme o caso concreto.' },
      { question: 'O aviso-prévio é sempre de 30 dias?', answer: 'A duração pode aumentar conforme o tempo de serviço e a situação do desligamento.' }
    ]
  },
  {
    slug: 'curriculo-pronto-para-baixar',
    title: 'Currículo pronto para baixar: estrutura simples e profissional',
    description:
      'Monte um currículo objetivo, legível e pronto para PDF, mesmo sem experiência profissional.',
    answer:
      'Um currículo eficiente apresenta contato, objetivo, experiências, formação e competências em ordem fácil de escanear. Para a maioria das vagas, uma página bem organizada é melhor do que um documento longo e genérico.',
    category: 'Carreira',
    readTime: '7 min',
    toolHref: '/gerador-de-curriculo',
    toolLabel: 'Criar currículo',
    sections: [
      {
        title: 'O que colocar no topo',
        paragraphs: [
          'Use nome, cidade, telefone, e-mail profissional e um link relevante, como LinkedIn ou portfólio. Não inclua documentos pessoais, endereço completo ou informações sem relação com a vaga.'
        ]
      },
      {
        title: 'Experiência orientada a resultados',
        paragraphs: [
          'Descreva responsabilidades com verbos de ação e, quando possível, resultados verificáveis. Adapte a ordem e as palavras-chave à descrição da vaga.',
          'Quem ainda não trabalhou pode destacar projetos, cursos, atividades voluntárias e competências demonstráveis.'
        ],
        bullets: ['Texto direto e sem erros', 'Datas consistentes', 'PDF com nome profissional', 'Conteúdo adaptado à vaga']
      },
      {
        title: 'Design que ajuda a leitura',
        paragraphs: [
          'Prefira contraste alto, espaços bem definidos e tipografia legível. Barras de habilidade e excesso de ícones ocupam espaço sem provar competência.'
        ]
      }
    ],
    faq: [
      { question: 'Currículo deve ter foto?', answer: 'Use foto apenas quando a vaga ou o contexto realmente justificar. Em muitos processos ela é desnecessária.' },
      { question: 'Qual nome usar no arquivo?', answer: 'Um padrão simples é Nome-Sobrenome-Curriculo.pdf.' },
      { question: 'Preciso colocar objetivo?', answer: 'Um objetivo curto e específico pode ajudar; evite frases genéricas.' }
    ]
  },
  {
    slug: 'como-fazer-orcamento-com-pix',
    title: 'Como fazer um orçamento com Pix e enviar pelo WhatsApp',
    description:
      'Organize itens, validade, condições e cobrança Pix em um orçamento fácil de aprovar.',
    answer:
      'Um orçamento com Pix deve separar descrição, quantidade, preço, total, validade e condições. A chave ou QR Code entra como opção de pagamento após o cliente compreender e aprovar o que está sendo cobrado.',
    category: 'Negócios',
    readTime: '6 min',
    toolHref: '/orcamento-com-pix',
    toolLabel: 'Criar orçamento com Pix',
    sections: [
      {
        title: 'Facilite a decisão do cliente',
        paragraphs: [
          'Apresente os itens de forma comparável e destaque o total. Se houver opções, deixe claro o que muda entre elas. Uma validade evita que custos antigos sejam cobrados meses depois.'
        ]
      },
      {
        title: 'Pagamento vem depois do aceite',
        paragraphs: [
          'O QR Code não substitui a confirmação do escopo. Primeiro garanta que o cliente entendeu entrega, prazo e valor; depois ofereça a forma de pagamento.',
          'No WhatsApp, acompanhe o link com uma mensagem curta e contextual.'
        ]
      },
      {
        title: 'Mantenha um histórico',
        paragraphs: [
          'Guarde a versão enviada, o aceite e o comprovante. Isso reduz dúvidas e facilita o acompanhamento financeiro.'
        ]
      }
    ],
    faq: [
      { question: 'Orçamento é contrato?', answer: 'O orçamento registra uma proposta. Dependendo do aceite e do contexto, ele pode integrar a contratação, mas não substitui cláusulas necessárias em negócios mais complexos.' },
      { question: 'Quanto tempo de validade usar?', answer: 'Escolha um prazo compatível com a variação dos seus custos e sua agenda.' },
      { question: 'Posso cobrar entrada por Pix?', answer: 'Sim, desde que o valor e a finalidade da entrada estejam claramente descritos.' }
    ]
  },
  {
    slug: 'proposta-comercial-para-mei',
    title: 'Proposta comercial para MEI: estrutura que facilita o aceite',
    description:
      'Aprenda a apresentar problema, solução, escopo, investimento e próximos passos em uma proposta comercial.',
    answer:
      'Uma proposta comercial para MEI deve explicar a necessidade do cliente, a solução oferecida, entregas, prazo, investimento, validade e próximo passo. O documento vende clareza, não volume de texto.',
    category: 'Negócios',
    readTime: '7 min',
    toolHref: '/gerador-de-proposta-comercial',
    toolLabel: 'Criar proposta comercial',
    sections: [
      {
        title: 'Conecte problema e solução',
        paragraphs: [
          'Abra a proposta mostrando que você entendeu o contexto do cliente. Em seguida, relacione cada entrega a um benefício prático.',
          'Evite uma apresentação longa da sua empresa antes de explicar o que será resolvido.'
        ]
      },
      {
        title: 'Apresente o investimento sem ambiguidade',
        paragraphs: [
          'Informe valor, impostos quando aplicável, datas e formas de pagamento. Se oferecer pacotes, diferencie-os por resultado ou escopo, não apenas por uma lista extensa de recursos.'
        ],
        bullets: ['Escopo verificável', 'Cronograma', 'Investimento', 'Validade', 'Próximo passo']
      },
      {
        title: 'Termine com uma ação clara',
        paragraphs: [
          'O cliente precisa saber como aprovar, tirar dúvidas ou solicitar ajustes. Um único próximo passo reduz o atrito.'
        ]
      }
    ],
    faq: [
      { question: 'Proposta precisa ter CNPJ?', answer: 'Identifique corretamente o proponente. Os dados necessários variam conforme a operação e a formalização adotada.' },
      { question: 'Quanto tempo vale uma proposta?', answer: 'Defina um prazo compatível com custos, disponibilidade e condições apresentadas.' },
      { question: 'Proposta substitui contrato?', answer: 'Em trabalhos simples ela pode registrar pontos importantes, mas contratos detalham responsabilidades e riscos com mais profundidade.' }
    ]
  },
  {
    slug: 'como-precificar-servico-freelancer',
    title: 'Como precificar serviço freelancer sem esquecer custos e margem',
    description:
      'Calcule custo, horas produtivas, impostos, margem e riscos antes de definir o preço de um serviço.',
    answer:
      'O preço freelancer deve cobrir custos fixos e variáveis, impostos, tempo não faturável, risco e margem. Dividir uma meta mensal por todas as horas do mês costuma subestimar o valor, porque nem toda hora disponível é vendida.',
    category: 'Financeiro',
    readTime: '8 min',
    toolHref: '/calculadora-de-preco-freelancer',
    toolLabel: 'Calcular preço',
    sections: [
      {
        title: 'Descubra seu custo real',
        paragraphs: [
          'Some ferramentas, internet, equipamentos, taxas, impostos, formação e uma parcela das despesas operacionais. Depois estime quantas horas realmente podem ser vendidas.',
          'Reuniões, prospecção, administração e revisões também consomem tempo.'
        ]
      },
      {
        title: 'Preço por hora ou por projeto',
        paragraphs: [
          'A hora é útil como referência interna. Para o cliente, um preço por projeto costuma comunicar melhor o valor e reduzir discussões sobre cada minuto.',
          'Inclua uma margem para incerteza quando o escopo ainda tiver riscos.'
        ]
      },
      {
        title: 'Revise depois de cada entrega',
        paragraphs: [
          'Compare horas previstas e realizadas. Esse histórico melhora os próximos orçamentos e revela serviços pouco rentáveis.'
        ]
      }
    ],
    faq: [
      { question: 'Devo mostrar meu valor por hora?', answer: 'Não é obrigatório. Você pode usar a hora internamente e apresentar um valor fechado com escopo definido.' },
      { question: 'Como cobrar revisões?', answer: 'Inclua uma quantidade no escopo e defina o preço de rodadas adicionais.' },
      { question: 'Preço baixo ajuda a conseguir clientes?', answer: 'Pode facilitar uma primeira decisão, mas preços abaixo do custo tornam a operação insustentável.' }
    ]
  },
  {
    slug: 'mei-ou-clt-como-comparar',
    title: 'MEI ou CLT: como comparar remuneração e benefícios',
    description:
      'Compare salário líquido, benefícios, impostos, custos e riscos antes de avaliar uma proposta como MEI ou CLT.',
    answer:
      'Comparar MEI e CLT exige colocar na mesma base salário líquido, férias, 13º, FGTS, benefícios, impostos, custos operacionais e períodos sem faturamento. O maior valor mensal isolado não representa necessariamente a melhor proposta.',
    category: 'Trabalho',
    readTime: '9 min',
    toolHref: '/mei-ou-clt',
    toolLabel: 'Comparar cenários',
    sections: [
      {
        title: 'Converta tudo para uma base anual',
        paragraphs: [
          'Some doze salários, 13º, férias e benefícios no cenário CLT. No cenário empresarial, considere faturamento, tributos, contador quando necessário, equipamentos, seguros e reserva para descanso.'
        ]
      },
      {
        title: 'Considere proteção e autonomia',
        paragraphs: [
          'A relação CLT possui direitos e deveres próprios. A prestação empresarial envolve autonomia, risco e organização do próprio negócio. O contrato real deve corresponder à forma como o trabalho acontece.'
        ]
      },
      {
        title: 'Use números como ponto de partida',
        paragraphs: [
          'Uma calculadora ajuda a organizar hipóteses, mas não decide sozinha. Estabilidade, flexibilidade, carreira e tolerância a risco também importam.'
        ]
      }
    ],
    faq: [
      { question: 'Qual percentual a mais compensa ser MEI?', answer: 'Não existe percentual universal. Benefícios, impostos, risco e custos variam muito.' },
      { question: 'Todo profissional pode ser MEI?', answer: 'Não. A atividade precisa estar entre as ocupações permitidas e respeitar os requisitos vigentes.' },
      { question: 'A comparação substitui um contador?', answer: 'Não. Ela organiza cenários; decisões tributárias e contratuais exigem análise específica.' }
    ]
  },
  {
    slug: 'aviso-previo-proporcional-como-calcular',
    title: 'Aviso-prévio proporcional: como calcular pelo tempo de casa',
    description:
      'Entenda a base de 30 dias e o acréscimo por ano trabalhado antes de estimar o aviso na rescisão.',
    answer:
      'O aviso-prévio proporcional costuma partir de 30 dias e soma três dias por ano completo de contrato, até o limite legal. A forma de cumprimento (trabalhado ou indenizado) e a modalidade de desligamento mudam o impacto no cálculo.',
    category: 'Trabalho',
    readTime: '7 min',
    toolHref: '/calculadora-de-rescisao',
    toolLabel: 'Calcular rescisão',
    sections: [
      {
        title: 'Base de 30 dias e acréscimo anual',
        paragraphs: [
          'Em muitos casos CLT, o aviso começa em 30 dias. A cada ano completo de vínculo, entram três dias adicionais, respeitando o teto previsto na legislação.',
          'Anos incompletos normalmente não geram o acréscimo integral. Por isso a data de admissão e a data de desligamento precisam estar corretas.'
        ],
        bullets: ['Confirme anos completos de casa', 'Separe aviso trabalhado de indenizado', 'Revise a modalidade de desligamento']
      },
      {
        title: 'Trabalhado versus indenizado',
        paragraphs: [
          'No aviso trabalhado, a pessoa permanece na função durante o período. No indenizado, o empregador paga o equivalente sem exigir a prestação do serviço.',
          'Essa escolha altera o fluxo de caixa e a data efetiva de saída. A calculadora usa a hipótese que você informar.'
        ]
      },
      {
        title: 'O que a estimativa não resolve sozinha',
        paragraphs: [
          'Acordos coletivos, médias de variáveis e regras específicas da categoria podem mudar o resultado. Use a simulação para organizar números e valide com um profissional antes da homologação.'
        ]
      }
    ],
    faq: [
      {
        question: 'Todo desligamento gera aviso-prévio?',
        answer: 'Não. A modalidade (pedido, sem justa causa, acordo e afins) define se há aviso e como ele é pago ou cumprido.'
      },
      {
        question: 'Os três dias por ano têm limite?',
        answer: 'Sim. A legislação estabelece um teto para o acréscimo proporcional. Confirme o limite vigente na sua situação.'
      },
      {
        question: 'Posso estimar isso sem TRCT?',
        answer: 'Sim, como referência. O documento oficial e a conferência profissional continuam necessários.'
      }
    ]
  },
  {
    slug: 'quanto-cobrar-por-hora-freelancer',
    title: 'Quanto cobrar por hora como freelancer: método prático',
    description:
      'Calcule a hora mínima considerando custos fixos, horas vendáveis, impostos e margem antes de precificar um projeto.',
    answer:
      'A hora mínima do freelancer deve cobrir custos fixos e variáveis, impostos, tempo não faturável e margem. Dividir a meta mensal por todas as horas do calendário costuma gerar preço abaixo do custo real.',
    category: 'Financeiro',
    readTime: '8 min',
    toolHref: '/calculadora-de-preco-freelancer',
    toolLabel: 'Calcular preço',
    sections: [
      {
        title: 'Some o custo mensal real',
        paragraphs: [
          'Inclua ferramentas, internet, equipamentos, espaço, impostos estimados, formação e uma reserva para imprevistos.',
          'Se você trabalha de casa, rateie parte da energia, internet e depreciação do computador.'
        ]
      },
      {
        title: 'Separe horas disponíveis de horas vendáveis',
        paragraphs: [
          'Prospecção, reuniões, administração e revisões consomem tempo. Uma base comum é vender bem menos do que a carga total da semana.',
          'Use a hora como referência interna. Para o cliente, um valor por projeto costuma comunicar melhor o resultado.'
        ],
        bullets: ['Meta de renda líquida', 'Horas realmente vendáveis', 'Margem para risco de escopo']
      },
      {
        title: 'Teste o preço em propostas reais',
        paragraphs: [
          'Depois de calcular a hora, monte o preço do projeto e compare com entregas anteriores. Se o histórico mostra estouro de horas, o preço atual está baixo ou o escopo está frouxo.'
        ]
      }
    ],
    faq: [
      {
        question: 'Devo publicar minha hora nas redes?',
        answer: 'Não é obrigatório. Muitos profissionais usam a hora só para gestão e vendem pacotes fechados.'
      },
      {
        question: 'E se o cliente pedir desconto?',
        answer: 'Reduza escopo, prazo ou entregáveis antes de cortar margem abaixo do custo.'
      },
      {
        question: 'Hora técnica e hora comercial são iguais?',
        answer: 'Não. A hora comercial precisa absorver tempo não faturável e risco. A hora técnica isolada quase sempre fica curta.'
      }
    ]
  },
  {
    slug: 'custos-fixos-do-freelancer-como-ratear',
    title: 'Custos fixos do freelancer: como ratear no preço',
    description:
      'Aprenda a distribuir aluguel, internet, softwares e outros custos fixos no preço de cada serviço ou produto.',
    answer:
      'Ratear custos fixos significa dividir despesas recorrentes pelas unidades ou horas que você realmente vende. Sem esse passo, o preço cobre só o custo direto e deixa a operação no prejuízo.',
    category: 'Financeiro',
    readTime: '7 min',
    toolHref: '/calculadora-de-preco-freelancer',
    toolLabel: 'Simular rateio',
    sections: [
      {
        title: 'Liste o que se repete todo mês',
        paragraphs: [
          'Softwares, internet, celular, coworking, contador, marketing e assinaturas entram nessa conta.',
          'Anote o valor médio dos últimos três meses para evitar distorções de um mês atípico.'
        ]
      },
      {
        title: 'Escolha a base de rateio',
        paragraphs: [
          'Você pode dividir pelo número de projetos, pelas horas vendáveis ou pelas unidades produzidas.',
          'O importante é usar uma base realista. Se você vende oito projetos no mês, ratear por vinte cria uma falsa sensação de preço baixo.'
        ],
        bullets: ['Projetos por mês', 'Horas vendáveis', 'Unidades entregues']
      },
      {
        title: 'Revise quando a rotina mudar',
        paragraphs: [
          'Novas ferramentas, aumento de aluguel ou queda de demanda alteram o rateio. Atualize a calculadora sempre que o custo fixo ou o volume de vendas mudar de patamar.'
        ]
      }
    ],
    faq: [
      {
        question: 'Custo fixo entra no preço por hora?',
        answer: 'Sim. Se não entrar, você financia a operação com a margem e pode trabalhar no prejuízo.'
      },
      {
        question: 'E custos variáveis?',
        answer: 'Materiais, frete e comissões devem ir no custo direto do projeto, separados do rateio fixo.'
      },
      {
        question: 'Posso ratear só uma vez por ano?',
        answer: 'Pode começar assim, mas o ideal é revisar quando houver mudança relevante de custo ou volume.'
      }
    ]
  },
  {
    slug: 'quando-o-mei-compensa-mais-que-a-clt',
    title: 'Quando o MEI compensa mais que a CLT',
    description:
      'Veja sinais práticos para comparar MEI e CLT além do valor mensal: benefícios, risco, custos e autonomia.',
    answer:
      'O MEI tende a compensar quando o líquido anual, após tributos e custos, supera o pacote CLT equivalente e a atividade se enquadra nas regras. Benefícios, estabilidade e risco comercial ainda precisam entrar na conta.',
    category: 'Trabalho',
    readTime: '8 min',
    toolHref: '/mei-ou-clt',
    toolLabel: 'Comparar MEI e CLT',
    sections: [
      {
        title: 'Compare em base anual',
        paragraphs: [
          'No CLT, some salários, 13º, férias e benefícios. No MEI, some faturamento, DAS, custos mensais e uma reserva para períodos sem demanda.',
          'Um valor mensal isolado quase sempre favorece o lado errado da decisão.'
        ]
      },
      {
        title: 'Olhe proteção e autonomia',
        paragraphs: [
          'CLT oferece estrutura de direitos típicos da relação de emprego. MEI exige organização do próprio negócio, emissão de documentos e gestão de clientes.',
          'Se o trabalho é subordinado na prática, a forma contratual precisa ser analisada com cuidado profissional.'
        ],
        bullets: ['Limite de faturamento', 'Ocupação permitida', 'Custo de ferramentas e deslocamento']
      },
      {
        title: 'Use a simulação como ponto de partida',
        paragraphs: [
          'A calculadora organiza hipóteses de líquido. A decisão final deve considerar carreira, tolerância a risco e orientação contábil.'
        ]
      }
    ],
    faq: [
      {
        question: 'Existe um percentual mágico que justifica o MEI?',
        answer: 'Não. O percentual muda com benefícios, impostos, custos e a regularidade do faturamento.'
      },
      {
        question: 'Posso ser MEI em qualquer atividade?',
        answer: 'Não. É preciso respeitar a lista de ocupações e os requisitos vigentes.'
      },
      {
        question: 'A calculadora decide por mim?',
        answer: 'Não. Ela organiza números. A escolha final depende do seu contexto e de aconselhamento profissional.'
      }
    ]
  }
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
