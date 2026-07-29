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
    segmentSlugs: ['mei', 'autonomos', 'empresas', 'advogados', 'prestadores'],
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
  }
];

export function getIntentPage(slug: string) {
  return intentPages.find((page) => page.slug === slug);
}
