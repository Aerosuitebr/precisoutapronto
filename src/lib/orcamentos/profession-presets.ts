import type { OrcamentoPreset } from '@/components/orcamentos/orcamentos-app';
import { EXPANDED_PROFESSION_LANDINGS } from '@/lib/orcamentos/profession-expansion';
import { CYCLE_TWO_PROFESSION_LANDINGS } from '@/lib/orcamentos/profession-expansion-cycle-two';

export interface ProfessionLanding {
  slug: string;
  name: string;
  title: string;
  description: string;
  promise: string;
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
    title: 'Orçamento para eletricista com aprovação e Pix',
    description: 'Separe visita, materiais e mão de obra em um orçamento profissional para o cliente aprovar pelo celular e pagar por Pix.',
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
      client: 'Cliente: Padaria Boa Praça — exemplo fictício',
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
      { q: 'Devo cobrar a visita técnica?', a: 'Você pode criar um item separado para diagnóstico e informar se o valor será abatido após a aprovação do serviço.' },
      { q: 'Como registrar materiais?', a: 'Liste os principais materiais como itens ou use um item consolidado, deixando marcas e quantidades nas observações.' }
    ]
  },
  {
    slug: 'pintor',
    name: 'Pintor',
    title: 'Orçamento para pintor por ambiente e metragem',
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
    title: 'Orçamento para instalação de ar-condicionado',
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
    title: 'Orçamento para manutenção residencial',
    description: 'Reúna visita, reparos, peças e mão de obra em um orçamento simples para o morador aprovar pelo celular.',
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
      { q: 'Como evitar discussão sobre serviços extras?', a: 'Liste o que está incluído e informe que problemas ocultos ou novos pedidos exigem aprovação adicional.' },
      { q: 'Posso juntar vários reparos?', a: 'Sim. Use um item para cada reparo para o cliente aprovar o escopo com clareza.' }
    ]
  },
  {
    slug: 'fotografo',
    name: 'Fotógrafo',
    title: 'Orçamento para fotógrafo com pacote e prazo de entrega',
    description: 'Organize cobertura, quantidade de fotos, tratamento e entrega em um orçamento profissional com aprovação e entrada por Pix.',
    promise: 'Modelo preparado para eventos, ensaios e fotografia comercial.',
    preset: {
      occupation: 'fotógrafo',
      items: [{ nome: 'Cobertura fotográfica' }, { nome: 'Seleção e tratamento das fotos' }, { nome: 'Galeria e entrega digital' }],
      observacoes: 'Informe duração da cobertura, quantidade estimada de fotos e prazo de entrega.\nDeslocamento e horas adicionais serão cobrados separadamente.\nReserva da data mediante entrada via Pix.'
    },
    checklist: ['Duração e local definidos', 'Quantidade e formato das fotos', 'Prazo, entrada e uso de imagem claros'],
    faqs: [
      { q: 'Como cobrar horas adicionais?', a: 'Inclua o valor por hora nas observações e registre que a extensão da cobertura depende de disponibilidade.' },
      { q: 'Preciso informar a quantidade de fotos?', a: 'Sim. Use uma faixa estimada e deixe claro o formato e o canal de entrega.' }
    ]
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
    title: 'Orçamento para pedreiro por etapa da obra',
    description: 'Detalhe preparação, execução, materiais e acabamento em um orçamento profissional com cronograma e Pix.',
    promise: 'Modelo preparado para reformas, alvenaria e pequenos serviços de obra.',
    preset: {
      occupation: 'pedreiro',
      items: [{ nome: 'Preparação e proteção da área' }, { nome: 'Mão de obra de alvenaria' }, { nome: 'Materiais e acabamento' }],
      observacoes: 'Descreva metragem, etapas e condições atuais do local.\nServiços não visíveis na vistoria serão orçados à parte.\nDefina entrada, pagamentos por etapa e prazo estimado.'
    },
    checklist: ['Metragem e etapas descritas', 'Materiais e mão de obra separados', 'Pagamentos e prazo por etapa'],
    example: {
      client: 'Cliente: Marina Alves — exemplo fictício',
      items: [
        { description: 'Preparação da área', detail: 'Proteção, retirada de revestimento e descarte — 12 m²', value: 'R$ 780,00' },
        { description: 'Mão de obra de alvenaria', detail: 'Regularização e assentamento — 12 m²', value: 'R$ 1.680,00' },
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
      { q: 'É melhor cobrar por diária ou empreitada?', a: 'Depende do escopo. Para serviço definido, a empreitada facilita a aprovação; para atividade incerta, registre diária e estimativa.' },
      { q: 'Como prever imprevistos da obra?', a: 'Informe que condições ocultas exigem orçamento complementar e aprovação antes da continuidade.' }
    ]
  },
  ...EXPANDED_PROFESSION_LANDINGS,
  ...CYCLE_TWO_PROFESSION_LANDINGS
];

export function findProfessionLanding(slug: string) {
  return PROFESSION_LANDINGS.find((item) => item.slug === slug);
}
