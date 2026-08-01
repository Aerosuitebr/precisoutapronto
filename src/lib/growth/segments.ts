import {
  BriefcaseBusiness,
  Building2,
  Calculator,
  GraduationCap,
  HardHat,
  HeartPulse,
  Scale,
  Store,
  UserRoundCog,
  UsersRound
} from 'lucide-react';

export type GrowthSegment = {
  slug: string;
  name: string;
  shortDescription: string;
  headline: string;
  description: string;
  icon: typeof Store;
  toolIds: string[];
  tools: Array<{ href: string; label: string; description: string }>;
  intents: string[];
};

export const growthSegments: GrowthSegment[] = [
  {
    slug: 'mei',
    name: 'MEI',
    shortDescription: 'Cobrança, recibos e organização sem burocracia.',
    headline: 'Documentos e ferramentas para o dia a dia do MEI',
    description: 'Crie propostas, contratos, recibos e cobranças Pix em um fluxo simples.',
    icon: Store,
    toolIds: ['orcamentos', 'recibos', 'contratos', 'pix', 'precificacao'],
    tools: [
      { href: '/orcamento-com-pix', label: 'Orçamento com Pix', description: 'Envie, aprove e cobre pelo mesmo link.' },
      { href: '/gerador-de-recibo', label: 'Gerador de recibo', description: 'Comprovante profissional em PDF.' },
      { href: '/gerador-de-contrato', label: 'Contrato de serviço', description: 'Defina escopo, prazo e pagamento.' }
    ],
    intents: ['recibo-para-mei', 'contrato-de-prestacao-de-servicos', 'proposta-comercial-para-mei']
  },
  {
    slug: 'autonomos',
    name: 'Autônomos',
    shortDescription: 'Preço, proposta, contrato e recebimento.',
    headline: 'Um escritório digital para profissionais autônomos',
    description: 'Organize a jornada do primeiro orçamento até o comprovante de pagamento.',
    icon: BriefcaseBusiness,
    toolIds: ['precificacao', 'propostas', 'contratos', 'recibos', 'pix'],
    tools: [
      { href: '/calculadora-de-preco-freelancer', label: 'Calculadora de preço', description: 'Descubra seu valor mínimo sustentável.' },
      { href: '/gerador-de-proposta-comercial', label: 'Proposta comercial', description: 'Apresente escopo e investimento.' },
      { href: '/gerador-de-contrato', label: 'Contrato de serviço', description: 'Formalize o combinado com clareza.' }
    ],
    intents: ['quanto-cobrar-por-hora', 'contrato-de-prestacao-de-servicos', 'proposta-comercial-para-freelancer']
  },
  {
    slug: 'empresas',
    name: 'Empresas',
    shortDescription: 'Fluxos comerciais e documentos recorrentes.',
    headline: 'Documentos inteligentes para pequenas empresas',
    description: 'Padronize propostas, contratos, agendas e documentos comerciais da equipe.',
    icon: Building2,
    toolIds: ['propostas', 'contratos', 'agenda', 'cronograma-entregas', 'contabeis'],
    tools: [
      { href: '/gerador-de-proposta-comercial', label: 'Propostas', description: 'Padronize a apresentação comercial.' },
      { href: '/gerador-de-contrato', label: 'Contratos', description: 'Crie documentos consistentes.' },
      { href: '/documentos-contabeis-online', label: 'Documentos contábeis', description: 'Modelos para rotinas administrativas.' }
    ],
    intents: ['contrato-de-prestacao-de-servicos', 'proposta-comercial-para-empresa', 'recibo-de-pagamento']
  },
  {
    slug: 'rh',
    name: 'RH',
    shortDescription: 'Cálculos, currículos e rotinas de pessoas.',
    headline: 'Ferramentas práticas para RH e Departamento Pessoal',
    description: 'Apoie triagem, admissões e desligamentos com calculadoras e documentos organizados.',
    icon: UsersRound,
    toolIds: ['rescisao', 'curriculo', 'agenda', 'contratos'],
    tools: [
      { href: '/calculadora-de-rescisao', label: 'Cálculo de rescisão', description: 'Faça uma estimativa detalhada.' },
      { href: '/gerador-de-curriculo', label: 'Currículos', description: 'Crie e revise currículos profissionais.' },
      { href: '/calculadora-de-ferias', label: 'Cálculo de férias', description: 'Organize cenários e valores.' }
    ],
    intents: ['como-calcular-rescisao', 'curriculo-para-primeiro-emprego', 'calculo-de-ferias']
  },
  {
    slug: 'contadores',
    name: 'Contadores',
    shortDescription: 'Documentos, cálculos e apoio a clientes.',
    headline: 'Uma central de recursos para contadores',
    description: 'Reúna documentos contábeis, cálculos trabalhistas e materiais para orientar clientes.',
    icon: Calculator,
    toolIds: ['contabeis', 'rescisao', 'ferias', 'decimo-terceiro', 'mei-vs-clt'],
    tools: [
      { href: '/documentos-contabeis-online', label: 'Documentos contábeis', description: 'Modelos editáveis para rotinas frequentes.' },
      { href: '/calculadora-de-rescisao', label: 'Rescisão', description: 'Simule verbas trabalhistas.' },
      { href: '/mei-ou-clt', label: 'MEI ou CLT', description: 'Compare cenários com seu cliente.' }
    ],
    intents: ['documentos-contabeis-para-clientes', 'como-calcular-rescisao', 'mei-ou-clt']
  },
  {
    slug: 'advogados',
    name: 'Advogados',
    shortDescription: 'Modelos jurídicos e revisão estruturada.',
    headline: 'Produtividade documental para profissionais jurídicos',
    description: 'Comece por modelos organizados e adapte cada documento ao caso concreto.',
    icon: Scale,
    toolIds: ['juridicos', 'contratos', 'agenda'],
    tools: [
      { href: '/documentos-juridicos-online', label: 'Documentos jurídicos', description: 'Modelos e cláusulas editáveis.' },
      { href: '/gerador-de-contrato', label: 'Contratos', description: 'Monte uma primeira versão estruturada.' },
      { href: '/agenda-online', label: 'Agenda', description: 'Organize prazos e compromissos.' }
    ],
    intents: ['contrato-de-prestacao-de-servicos', 'contrato-de-aluguel', 'documentos-juridicos-online']
  },
  {
    slug: 'estudantes',
    name: 'Estudantes',
    shortDescription: 'ABNT, redação, estudos e primeiro currículo.',
    headline: 'Ferramentas para estudar e entrar no mercado',
    description: 'Organize trabalhos, referências, redações e seu primeiro currículo.',
    icon: GraduationCap,
    toolIds: ['trabalhos', 'referencias-abnt', 'redacao-enem', 'curriculo', 'cronograma-estudos'],
    tools: [
      { href: '/corretor-de-redacao-enem', label: 'Redação ENEM', description: 'Receba uma análise por competência.' },
      { href: '/gerador-de-curriculo', label: 'Primeiro currículo', description: 'Destaque formação e projetos.' },
      { href: '/documentos-juridicos-online', label: 'Docs acadêmicos', description: 'Modelos para prática e trabalhos.' }
    ],
    intents: ['curriculo-para-primeiro-emprego', 'referencias-abnt-online', 'como-fazer-redacao-enem']
  },
  {
    slug: 'prestadores',
    name: 'Prestadores',
    shortDescription: 'Orçamentos, cronogramas e contratos.',
    headline: 'Do orçamento à entrega para prestadores de serviço',
    description: 'Defina preço, formalize o escopo e acompanhe a entrega sem planilhas soltas.',
    icon: HardHat,
    toolIds: ['orcamentos', 'contratos', 'cronograma-entregas', 'recibos'],
    tools: [
      { href: '/orcamento-com-pix', label: 'Orçamento com Pix', description: 'Converta interesse em aprovação.' },
      { href: '/gerador-de-contrato', label: 'Contrato', description: 'Proteja escopo, prazo e pagamento.' },
      { href: '/agenda-online', label: 'Cronograma', description: 'Acompanhe etapas e compromissos.' }
    ],
    intents: ['orcamento-para-prestador-de-servico', 'contrato-de-prestacao-de-servicos', 'recibo-de-pagamento']
  },
  {
    slug: 'saude',
    name: 'Profissionais de saúde',
    shortDescription: 'Agenda, recibos e documentos profissionais.',
    headline: 'Rotinas documentais para profissionais de saúde',
    description: 'Organize agenda, recebimentos e documentos administrativos com mais consistência.',
    icon: HeartPulse,
    toolIds: ['agenda', 'recibos', 'contratos'],
    tools: [
      { href: '/agenda-online', label: 'Agenda', description: 'Organize atendimentos e lembretes.' },
      { href: '/gerador-de-recibo', label: 'Recibos', description: 'Registre pagamentos com clareza.' },
      { href: '/gerador-de-contrato', label: 'Contratos', description: 'Formalize serviços administrativos.' }
    ],
    intents: ['recibo-para-profissional-de-saude', 'contrato-de-prestacao-de-servicos', 'agenda-profissional-online']
  },
  {
    slug: 'gestores',
    name: 'Gestores',
    shortDescription: 'Agenda, processos e documentos da equipe.',
    headline: 'Ferramentas leves para organizar a operação',
    description: 'Centralize documentos, compromissos e entregas em fluxos simples.',
    icon: UserRoundCog,
    toolIds: ['agenda', 'cronograma-entregas', 'propostas', 'contratos'],
    tools: [
      { href: '/agenda-online', label: 'Agenda', description: 'Acompanhe os próximos compromissos.' },
      { href: '/agenda-online', label: 'Entregas', description: 'Visualize prazos e responsáveis.' },
      { href: '/gerador-de-proposta-comercial', label: 'Propostas', description: 'Padronize novas oportunidades.' }
    ],
    intents: ['cronograma-de-entregas', 'proposta-comercial-para-empresa', 'contrato-de-prestacao-de-servicos']
  }
];

export function getGrowthSegment(slug: string) {
  return growthSegments.find((segment) => segment.slug === slug);
}
