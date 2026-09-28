import type { OrcamentoPreset } from '@/components/orcamentos/orcamentos-app';
import { EXPANDED_PROFESSION_LANDINGS } from '@/lib/orcamentos/profession-expansion';
import { CYCLE_TWO_PROFESSION_LANDINGS } from '@/lib/orcamentos/profession-expansion-cycle-two';
import { CYCLE_THREE_PROFESSION_LANDINGS } from '@/lib/orcamentos/profession-expansion-cycle-three';

export interface ProfessionLanding {
  slug: string;
  name: string;
  title: string;
  description: string;
  promise: string;
  updatedAt?: string;
  preset: OrcamentoPreset;
  checklist: string[];
  faqs: Array<{ q: string; a: string }>;
  example?: {
    client: string;
    items: Array<{ description: string; detail: string; value: string }>;
    total: string;
    terms: string[];
  };
  sections?: Array<{ title: string; paragraphs: string[] }>;
  priceGuide?: {
    title: string;
    intro: string;
    rows: Array<{ service: string; range: string }>;
    footnote: string;
  };
  scopeGuide?: {
    title: string;
    intro: string;
    items: Array<{ label: string; detail: string }>;
  };
}

export const PROFESSION_LANDINGS: ProfessionLanding[] = [
  {
    slug: 'personal-trainer',
    name: 'Personal trainer',
    title: 'Orçamento para personal trainer com planos e Pix',
    description: 'Apresente avaliação, sessões, acompanhamento e condições de remarcação em um orçamento profissional para aprovação pelo celular.',
    promise: 'Modelo preparado para treino presencial, online e consultoria esportiva.',
    preset: {
      occupation: 'personal trainer',
      items: [
        { nome: 'Avaliação física inicial' },
        { nome: 'Pacote de sessões de treino' },
        { nome: 'Acompanhamento e ajustes do plano' }
      ],
      observacoes: 'Informe quantidade, duração e frequência das sessões.\nDefina validade do pacote e regra de cancelamento ou remarcação.\nPagamento via Pix conforme as condições combinadas.'
    },
    checklist: ['Quantidade e duração das sessões', 'Formato presencial ou online', 'Pagamento e remarcação definidos'],
    faqs: [
      { q: 'Como apresentar um pacote mensal?', a: 'Use a quantidade para registrar o número de sessões e deixe frequência, duração e validade nas observações.' },
      { q: 'Como tratar faltas e remarcações?', a: 'Registre antecedência mínima, prazo para reposição e situações em que a sessão será considerada realizada.' }
    ]
  },
  {
    slug: 'eletricista',
    name: 'Eletricista',
    title: 'Orçamento para eletricista: gerador grátis com Pix',
    description: 'Crie um orçamento de eletricista com visita, materiais e mão de obra. Envie pelo WhatsApp para aprovação e pagamento via Pix. Sem cadastro para começar.',
    updatedAt: '2026-09-28',
    promise: 'Modelo preparado para instalações, reparos e adequações elétricas.',
    preset: {
      occupation: 'eletricista',
      items: [
        { nome: 'Visita técnica e diagnóstico' },
        { nome: 'Materiais elétricos' },
        { nome: 'Mão de obra de instalação' }
      ],
      observacoes: 'Materiais e serviços adicionais serão executados somente após aprovação.\nPagamento via Pix.\nGarantia da mão de obra conforme o serviço descrito.'
    },
    checklist: ['Pontos e circuitos identificados', 'Materiais separados da mão de obra', 'Prazo e garantia registrados'],
    example: {
      client: 'Cliente: Padaria Boa Praça, exemplo fictício',
      items: [
        { description: 'Visita técnica e diagnóstico', detail: 'Inspeção do quadro e teste de 6 circuitos', value: 'R$ 180,00' },
        { description: 'Materiais elétricos', detail: '2 disjuntores, cabos e conectores especificados', value: 'R$ 420,00' },
        { description: 'Mão de obra', detail: 'Troca dos componentes e identificação do quadro', value: 'R$ 650,00' }
      ],
      total: 'R$ 1.250,00',
      terms: ['Validade: 7 dias', 'Execução estimada: 1 dia útil', '50% na aprovação e saldo na conclusão via Pix']
    },
    sections: [
      { title: 'O que muda em um orçamento elétrico', paragraphs: ['Descreva pontos, circuitos e ambientes para que o cliente saiba exatamente o alcance da mão de obra.', 'Separe diagnóstico, materiais e instalação. Adequações descobertas durante o serviço devem receber orçamento complementar antes da execução.'] },
      { title: 'Segurança e responsabilidade técnica', paragraphs: ['O modelo organiza a proposta comercial; ele não substitui inspeção, projeto, laudo ou responsabilidade técnica quando exigidos.', 'Normas, capacidade do circuito e condições do imóvel devem ser avaliadas por profissional habilitado para o serviço aplicável.'] }
    ],
    faqs: [
      { q: 'Como fazer um orçamento de eletricista para enviar no WhatsApp?', a: 'Preencha seus dados e os do cliente, separe visita, materiais e mão de obra e informe quantidades e valores. Revise prazo e condições, confira a prévia e gere o link para o cliente aprovar no celular.' },
      { q: 'O que entra em um orçamento para eletricista?', a: 'Descreva visita ou diagnóstico, materiais, mão de obra, ambientes ou pontos, prazo, validade e forma de pagamento. Defina os valores após a vistoria, considerando seus custos e as condições do serviço.' },
      { q: 'Devo cobrar a visita técnica?', a: 'Você pode criar um item separado para diagnóstico e informar se o valor será abatido após a aprovação do serviço.' },
      { q: 'Como registrar materiais?', a: 'Liste os principais materiais como itens ou use um item consolidado, deixando marcas e quantidades nas observações.' }
    ],
    scopeGuide: {
      title: 'O que entra em um orçamento para eletricista',
      intro: 'O cliente quer saber o que está incluso, o que fica de fora e quanto custa cada parte. Preencha estes campos no modelo. A ART e o laudo, quando exigidos, são do profissional habilitado, não desta página.',
      items: [
        { label: 'Visita técnica e diagnóstico', detail: 'Cobre inspeção, testes e o que será executado depois da vistoria.' },
        { label: 'Pontos, circuitos e ambientes', detail: 'Quantidade de tomadas, quadro, cômodos ou trechos de cabeamento.' },
        { label: 'Materiais', detail: 'Disjuntores, cabos e componentes. Deixe marcas e quantidades nas observações.' },
        { label: 'Mão de obra', detail: 'Instalação, identificação do quadro, testes e entrega.' },
        { label: 'Prazo e validade', detail: 'Dias para executar e por quanto tempo o preço vale.' },
        { label: 'Pagamento e Pix', detail: 'Entrada, saldo e se o cliente paga no mesmo link depois de aprovar.' },
        { label: 'ART, NR-10 e garantia', detail: 'Quando o serviço exigir responsabilidade técnica, registre no orçamento. Informe também o prazo de garantia da mão de obra.' }
      ]
    }
  },
  {
    slug: 'pintor',
    updatedAt: '2026-09-28',
    name: 'Pintor',
    title: 'Orçamento para pintor por ambiente e metragem grátis',
    description: 'Organize preparação, pintura, materiais e prazo em um link profissional com aprovação pelo celular e cobrança Pix.',
    promise: 'Modelo preparado para pintura residencial, comercial e pequenos reparos.',
    preset: {
      occupation: 'pintor',
      items: [
        { nome: 'Preparação e proteção dos ambientes' },
        { nome: 'Pintura de paredes e tetos' },
        { nome: 'Materiais de pintura' }
      ],
      observacoes: 'Informe ambientes, metragem aproximada, número de demãos e estado das superfícies.\nPrazo sujeito às condições de secagem.\nPagamento via Pix.'
    },
    checklist: ['Ambientes e metragem descritos', 'Número de demãos informado', 'Preparação e materiais discriminados'],
    example: {
      client: 'Cliente: Apartamento Exemplo, demonstração fictícia',
      items: [
        { description: 'Preparação e proteção', detail: 'Proteção de móveis e piso e correções superficiais na sala', value: 'R$ 250,00' },
        { description: 'Pintura das paredes', detail: '50 m² de paredes × R$ 18,00; duas demãos, sem teto', value: 'R$ 900,00' },
        { description: 'Materiais de proteção', detail: 'Fita e lona; tinta fornecida pelo cliente', value: 'R$ 100,00' }
      ],
      total: 'R$ 1.250,00',
      terms: ['Valores fictícios, não são tabela de preços', 'Validade: 7 dias; execução: 3 dias úteis, conforme secagem', 'Entrada de R$ 500,00 e saldo de R$ 750,00 após a conclusão']
    },
    sections: [
      { title: 'Como calcular a metragem para o orçamento de pintura', paragraphs: ['Meça largura e altura de cada parede e some as áreas. Registre como serão tratadas portas e janelas. A área do piso do cômodo não é a área das paredes.', 'No modelo, use a quantidade para os metros quadrados e o valor unitário para o seu preço por m². Informe se esse preço já cobre todas as demãos combinadas; não multiplique as demãos novamente.'] },
      { title: 'O que incluir e o que combinar à parte', paragraphs: ['Descreva preparação, proteção de móveis, número de demãos, acabamento e limpeza. Informe quem fornece tinta e materiais e identifique linha, cor e ambientes.', 'Infiltração, correções profundas, trabalho em altura e superfícies adicionais devem ter escopo e valor combinados antes da execução. Registre entrada, saldo e prazo no orçamento.'] }
    ],
    faqs: [
      { q: 'Como cobrar por metro quadrado?', a: 'Use a quantidade do item como a metragem e informe o preço unitário estimado por metro quadrado.' },
      { q: 'Tinta deve entrar no orçamento?', a: 'Sim. Deixe claro se a tinta será fornecida pelo pintor ou pelo cliente e registre a linha prevista.' }
    ]
  },
  {
    slug: 'pintura-residencial',
    name: 'Pintura residencial',
    title: 'Orçamento de pintura residencial por ambiente e metragem',
    description: 'Monte um orçamento de pintura residencial com preparação, metragem, demãos, materiais, prazo, aprovação e Pix.',
    promise: 'Modelo preparado para apartamentos, casas, paredes, tetos e pequenos reparos.',
    preset: {
      occupation: 'pintor residencial',
      items: [{ nome: 'Preparação e proteção dos ambientes' }, { nome: 'Pintura de paredes e tetos' }, { nome: 'Tintas e materiais' }],
      observacoes: 'Informe ambientes, metragem aproximada, número de demãos e estado das superfícies.\nProteção de móveis e correções profundas devem ser descritas no escopo.\nDefina entrada, prazo e pagamento via Pix.'
    },
    checklist: ['Ambientes e metragem descritos', 'Demãos e preparação informadas', 'Tintas, prazo e limpeza definidos'],
    faqs: [{ q: 'Como calcular a pintura residencial?', a: 'Meça as superfícies, desconte aberturas quando relevante e considere preparação, quantidade de demãos e rendimento da tinta.' }, { q: 'O orçamento deve incluir a tinta?', a: 'Deixe explícito se materiais estão inclusos, quais linhas foram consideradas e quem fará a compra.' }]
  },
  {
    slug: 'instalacao-ar-condicionado',
    name: 'Instalador de ar-condicionado',
    title: 'Orçamento para instalação de ar-condicionado grátis',
    description: 'Apresente instalação, infraestrutura, materiais e deslocamento em um orçamento que o cliente aprova no WhatsApp.',
    promise: 'Modelo preparado para split, manutenção e infraestrutura frigorígena.',
    preset: {
      occupation: 'instalador de ar-condicionado',
      items: [
        { nome: 'Instalação de ar-condicionado split' },
        { nome: 'Kit de instalação e tubulação' },
        { nome: 'Deslocamento e teste de funcionamento' }
      ],
      observacoes: 'Modelo e capacidade do equipamento devem ser confirmados antes da instalação.\nServiços de alvenaria e elétrica fora do escopo serão orçados separadamente.\nPagamento via Pix.'
    },
    checklist: ['Capacidade e modelo do aparelho', 'Metragem de tubulação prevista', 'Elétrica e alvenaria com escopo claro'],
    faqs: [
      { q: 'Como cobrar tubulação adicional?', a: 'Crie um item com quantidade em metros e valor unitário. Assim o cliente entende o custo excedente.' },
      { q: 'O orçamento deve incluir elétrica?', a: 'Somente se estiver no seu escopo. Caso contrário, registre explicitamente que ponto elétrico e adequações não estão inclusos.' }
    ]
  },
  {
    slug: 'designer',
    name: 'Designer',
    title: 'Orçamento para designer com escopo e revisões',
    description: 'Transforme briefing, entregáveis, revisões e prazos em um orçamento profissional com aprovação e entrada por Pix.',
    promise: 'Modelo preparado para identidade visual, social media e materiais gráficos.',
    preset: {
      occupation: 'designer',
      items: [
        { nome: 'Direção criativa e briefing' },
        { nome: 'Criação das peças contratadas' },
        { nome: 'Entrega dos arquivos finais' }
      ],
      observacoes: 'Inclui até 2 rodadas de ajustes dentro do briefing aprovado.\nArquivos editáveis e licenças devem ser definidos no escopo.\n50% na entrada via Pix e saldo na entrega.'
    },
    checklist: ['Entregáveis e formatos definidos', 'Quantidade de revisões registrada', 'Entrada e direitos de uso claros'],
    faqs: [
      { q: 'Quantas revisões incluir?', a: 'Defina um limite objetivo e informe que alterações de briefing ou rodadas extras serão cobradas separadamente.' },
      { q: 'Posso cobrar entrada por Pix?', a: 'Sim. Registre o percentual nas observações e envie a cobrança depois da aprovação.' }
    ]
  },
  {
    slug: 'manutencao-residencial',
    name: 'Manutenção residencial',
    title: 'Orçamento para manutenção residencial: faixa de preço e Pix',
    description: 'Veja quanto custa manutenção residencial em 2026 e reúna visita, reparos e peças em um orçamento para o morador aprovar pelo celular.',
    promise: 'Modelo preparado para marido de aluguel, pequenos reparos e manutenção preventiva.',
    preset: {
      occupation: 'manutenção residencial',
      items: [
        { nome: 'Visita e avaliação técnica' },
        { nome: 'Mão de obra dos reparos' },
        { nome: 'Peças e materiais' }
      ],
      observacoes: 'O orçamento considera os reparos descritos após inspeção visual.\nProblemas ocultos ou serviços adicionais exigem nova aprovação.\nPagamento via Pix após a conclusão.'
    },
    checklist: ['Cada reparo identificado', 'Peças e mão de obra separadas', 'Condições para serviços adicionais'],
    faqs: [
      { q: 'Quanto custa manutenção residencial em 2026?', a: 'A visita costuma ficar entre R$ 80 e R$ 200, e um reparo simples entre R$ 120 e R$ 400, conforme cidade e peças. Liste cada reparo no orçamento para o morador aprovar o escopo sem surpresa.' },
      { q: 'Como evitar discussão sobre serviços extras?', a: 'Liste o que está incluído e informe que problemas ocultos ou novos pedidos exigem aprovação adicional.' },
      { q: 'Posso juntar vários reparos?', a: 'Sim. Use um item para cada reparo para o cliente aprovar o escopo com clareza.' }
    ],
    priceGuide: {
      title: 'Quanto custa manutenção residencial em 2026',
      intro: 'Faixas de referência para pequenos reparos. O total depende da vistoria, das peças e de quantos serviços entram no mesmo atendimento.',
      rows: [
        { service: 'Visita e avaliação', range: 'R$ 80 a R$ 200' },
        { service: 'Reparo simples (torneira, fechadura, tomada)', range: 'R$ 120 a R$ 400' },
        { service: 'Pacote de vários reparos no mesmo dia', range: 'combinar no orçamento' },
        { service: 'Peças e materiais', range: 'à parte, com comprovante' }
      ],
      footnote: 'Não é tabela oficial. Separe visita, mão de obra e peças no modelo abaixo para o morador aprovar no celular.'
    }
  },
  {
    slug: 'fotografo',
    name: 'Fotógrafo',
    title: 'Orçamento para fotógrafo: pacote, faixa de preço e prazo',
    description: 'Veja quanto custa um fotógrafo em 2026 e organize cobertura, tratamento e entrega em um orçamento com aprovação e entrada por Pix.',
    promise: 'Modelo preparado para eventos, ensaios e fotografia comercial.',
    preset: {
      occupation: 'fotógrafo',
      items: [{ nome: 'Cobertura fotográfica' }, { nome: 'Seleção e tratamento das fotos' }, { nome: 'Galeria e entrega digital' }],
      observacoes: 'Informe duração da cobertura, quantidade estimada de fotos e prazo de entrega.\nDeslocamento e horas adicionais serão cobrados separadamente.\nReserva da data mediante entrada via Pix.'
    },
    checklist: ['Duração e local definidos', 'Quantidade e formato das fotos', 'Prazo, entrada e uso de imagem claros'],
    faqs: [
      { q: 'Quanto custa um fotógrafo em 2026?', a: 'Ensaio simples costuma ficar entre R$ 400 e R$ 1.500. Evento ou casamento parte de faixas mais altas conforme duração e equipe. Informe cobertura, quantidade de fotos e prazo no orçamento para o cliente comparar pacotes.' },
      { q: 'Como cobrar horas adicionais?', a: 'Inclua o valor por hora nas observações e registre que a extensão da cobertura depende de disponibilidade.' },
      { q: 'Preciso informar a quantidade de fotos?', a: 'Sim. Use uma faixa estimada e deixe claro o formato e o canal de entrega.' }
    ],
    priceGuide: {
      title: 'Quanto custa um fotógrafo em 2026',
      intro: 'Faixas de referência para o cliente entender o pacote. Não substituem o orçamento do ensaio ou do evento.',
      rows: [
        { service: 'Ensaio (1 a 2 horas)', range: 'R$ 400 a R$ 1.500' },
        { service: 'Evento ou cobertura parcial', range: 'R$ 1.200 a R$ 4.000' },
        { service: 'Hora adicional', range: 'combinar no orçamento' },
        { service: 'Tratamento e galeria digital', range: 'incluso ou à parte' }
      ],
      footnote: 'Duração, deslocamento e prazo de entrega mudam o preço. Monte o pacote no modelo abaixo para o cliente aprovar e pagar a reserva por Pix.'
    }
  },
  {
    slug: 'mecanico',
    name: 'Mecânico',
    title: 'Orçamento para mecânico com peças e mão de obra',
    description: 'Separe diagnóstico, peças e serviços em um orçamento claro para o cliente aprovar antes do reparo.',
    promise: 'Modelo preparado para manutenção preventiva e reparos automotivos.',
    preset: {
      occupation: 'mecânico',
      items: [{ nome: 'Diagnóstico do veículo' }, { nome: 'Peças e componentes' }, { nome: 'Mão de obra do reparo' }],
      observacoes: 'Valores consideram o diagnóstico inicial e as peças descritas.\nDefeitos adicionais exigem nova aprovação antes da execução.\nInforme prazo e garantia dos serviços.'
    },
    checklist: ['Veículo e diagnóstico identificados', 'Peças separadas da mão de obra', 'Prazo e garantia registrados'],
    faqs: [
      { q: 'Posso alterar o orçamento após desmontar o veículo?', a: 'Sim, desde que explique o novo diagnóstico e obtenha nova aprovação antes de executar serviços extras.' },
      { q: 'Como apresentar peças opcionais?', a: 'Crie itens separados e informe marca, condição e garantia para o cliente comparar.' }
    ]
  },
  {
    slug: 'pedreiro',
    name: 'Pedreiro',
    title: 'Orçamento para pedreiro: etapas, faixa de preço e Pix',
    description: 'Veja quanto custa um pedreiro em 2026 e detalhe preparação, execução, materiais e acabamento em um orçamento com cronograma e Pix.',
    promise: 'Modelo preparado para reformas, alvenaria e pequenos serviços de obra.',
    preset: {
      occupation: 'pedreiro',
      items: [{ nome: 'Preparação e proteção da área' }, { nome: 'Mão de obra de alvenaria' }, { nome: 'Materiais e acabamento' }],
      observacoes: 'Descreva metragem, etapas e condições atuais do local.\nServiços não visíveis na vistoria serão orçados à parte.\nDefina entrada, pagamentos por etapa e prazo estimado.'
    },
    checklist: ['Metragem e etapas descritas', 'Materiais e mão de obra separados', 'Pagamentos e prazo por etapa'],
    example: {
      client: 'Cliente: Marina Alves, exemplo fictício',
      items: [
        { description: 'Preparação da área', detail: 'Proteção, retirada de revestimento e descarte, 12 m²', value: 'R$ 780,00' },
        { description: 'Mão de obra de alvenaria', detail: 'Regularização e assentamento, 12 m²', value: 'R$ 1.680,00' },
        { description: 'Acabamento', detail: 'Rejunte e limpeza final; materiais descritos à parte', value: 'R$ 540,00' }
      ],
      total: 'R$ 3.000,00',
      terms: ['Validade: 10 dias', 'Prazo estimado: 5 dias úteis', '30% na entrada, 40% após assentamento e 30% na entrega via Pix']
    },
    sections: [
      { title: 'O que muda em um orçamento de obra', paragraphs: ['Informe metragem, preparação, execução e acabamento em etapas separadas. Isso permite conferir o avanço e vincular pagamentos a entregas observáveis.', 'Registre quem compra os materiais, como será feito o descarte e quais condições do local já foram consideradas na vistoria.'] },
      { title: 'Imprevistos sem autorização em branco', paragraphs: ['Condições ocultas podem alterar o escopo, mas não devem virar cobrança automática. Descreva o achado, estime custo e prazo adicionais e peça aprovação antes de continuar.', 'O orçamento é uma proposta comercial e deve refletir a vistoria real; requisitos técnicos da obra precisam ser avaliados por profissional habilitado quando aplicável.'] }
    ],
    faqs: [
      { q: 'Quanto custa um pedreiro em 2026?', a: 'A diária costuma ficar entre R$ 250 e R$ 500, e um cômodo pequeno frequentemente parte de R$ 3.000. Material, descarte e acesso ao local mudam o total. Use a tabela como referência e feche o valor por etapa no orçamento.' },
      { q: 'O que entra em um orçamento para pedreiro?', a: 'Separe preparação, mão de obra, materiais, metragem, prazo por etapa e pagamento. A faixa de preço ajuda o cliente a comparar; o total do cômodo sai da vistoria no modelo.' },
      { q: 'É melhor cobrar por diária ou empreitada?', a: 'Depende do escopo. Para serviço definido, a empreitada facilita a aprovação; para atividade incerta, registre diária e estimativa.' },
      { q: 'Como prever imprevistos da obra?', a: 'Informe que condições ocultas exigem orçamento complementar e aprovação antes da continuidade.' }
    ],
    priceGuide: {
      title: 'Quanto custa um pedreiro em 2026',
      intro: 'Faixas de referência para conversa com o cliente. O valor final depende da vistoria, da metragem e de quem compra o material.',
      rows: [
        { service: 'Diária de mão de obra', range: 'R$ 250 a R$ 500' },
        { service: 'Reforma de cômodo pequeno', range: 'a partir de R$ 3.000' },
        { service: 'Preparação e proteção da área', range: 'R$ 400 a R$ 1.200' },
        { service: 'Acabamento e limpeza', range: 'R$ 300 a R$ 900' }
      ],
      footnote: 'Não é tabela oficial. Separe preparação, mão de obra e materiais no modelo abaixo para o cliente aprovar cada etapa.'
    },
    scopeGuide: {
      title: 'O que entra em um orçamento para pedreiro',
      intro: 'Quem busca orçamento de obra quer etapas, metragem e o que o preço cobre. Separe preparação, execução e acabamento para o cliente aprovar cada marco.',
      items: [
        { label: 'Preparação e proteção', detail: 'Isolamento da área, retirada de revestimento e condições do local na vistoria.' },
        { label: 'Metragem e etapas', detail: 'Área em m², alvenaria, regularização, assentamento e acabamento.' },
        { label: 'Materiais', detail: 'Quem compra bloco, argamassa e acabamento. O que fica fora do preço da mão de obra.' },
        { label: 'Descarte e acesso', detail: 'Entulho, restrição de horário e se o local exige andaime ou proteção extra.' },
        { label: 'Prazo por etapa', detail: 'Dias úteis de cada marco observável, não só a data final.' },
        { label: 'Pagamento e Pix', detail: 'Entrada, percentual após um marco e saldo na entrega.' },
        { label: 'Imprevistos', detail: 'Condição oculta não vira cobrança automática. Novo serviço só depois de aprovação.' }
      ]
    }
  },
  ...EXPANDED_PROFESSION_LANDINGS,
  ...CYCLE_TWO_PROFESSION_LANDINGS,
  ...CYCLE_THREE_PROFESSION_LANDINGS
];

export function findProfessionLanding(slug: string) {
  return PROFESSION_LANDINGS.find((item) => item.slug === slug);
}
