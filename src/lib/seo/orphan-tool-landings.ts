export type OrphanPublicLanding = {
  toolId: string;
  path: string;
  toolName: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  subtitle: string;
  howToTitle: string;
  howToSteps: string[];
  faqs: Array<{ q: string; a: string }>;
  related: Array<{ href: string; label: string }>;
  ogEyebrow: string;
  ogTitle: string;
  ogSubtitle: string;
  applicationCategory: string;
};

/** Landings públicas para ferramentas que antes só existiam em /ferramentas (noindex). */
export const ORPHAN_PUBLIC_LANDINGS: OrphanPublicLanding[] = [
  {
    toolId: 'editor-pdf',
    path: '/editor-de-pdf-online',
    toolName: 'Editor de PDF',
    metaTitle: 'Editor de PDF online grátis (juntar, girar, extrair)',
    metaDescription:
      'Edite PDF no navegador: texto, imagens, juntar arquivos, girar e extrair páginas. Arquivo processado localmente, sem upload para servidor.',
    keywords: [
      'editor de pdf online',
      'juntar pdf grátis',
      'girar pdf',
      'extrair páginas pdf',
      'editar pdf no navegador'
    ],
    h1: 'Editor de PDF online grátis',
    subtitle:
      'Junte, gire, extraia e edite páginas de PDF direto no navegador. O arquivo fica no seu dispositivo.',
    howToTitle: 'Como editar um PDF aqui',
    howToSteps: [
      'Abra ou arraste o PDF para a área da ferramenta.',
      'Escolha a ação: editar, juntar, girar ou extrair páginas.',
      'Revise o resultado na prévia.',
      'Baixe o PDF atualizado. Duas gerações livres sem conta.'
    ],
    faqs: [
      {
        q: 'O PDF é enviado para um servidor?',
        a: 'Não. O processamento acontece no seu navegador. O arquivo não sobe para a nuvem do Resolva Jato.'
      },
      {
        q: 'É grátis?',
        a: 'Sim. Você usa duas gerações sem cadastro. Depois, a conta grátis libera continuidade e histórico.'
      },
      {
        q: 'Consigo juntar vários PDFs?',
        a: 'Sim. A ferramenta permite unir arquivos e reordenar páginas antes de baixar.'
      }
    ],
    related: [
      { href: '/gerador-de-curriculo', label: 'Gerador de currículo' },
      { href: '/gerador-de-contrato', label: 'Gerador de contrato' },
      { href: '/recursos', label: 'Catálogo de ferramentas' }
    ],
    ogEyebrow: 'RESOLVA JATO · PDF',
    ogTitle: 'Edite PDFs sem instalar nada.',
    ogSubtitle: 'Juntar, girar e extrair · no navegador',
    applicationCategory: 'BusinessApplication'
  },
  {
    toolId: 'referencias-abnt',
    path: '/gerador-de-referencias-abnt',
    toolName: 'Referências ABNT',
    metaTitle: 'Gerador de referências ABNT grátis (NBR 6023)',
    metaDescription:
      'Monte referências bibliográficas no padrão ABNT para sites, livros e artigos. Ordenação automática para TCC e trabalhos acadêmicos.',
    keywords: [
      'gerador de referências abnt',
      'referência abnt online',
      'bibliografia abnt',
      'nbr 6023',
      'referência bibliográfica grátis'
    ],
    h1: 'Gerador de referências ABNT grátis',
    subtitle:
      'Preencha os dados da obra e gere a referência no padrão usual da NBR 6023, pronta para colar no trabalho.',
    howToTitle: 'Como gerar uma referência ABNT',
    howToSteps: [
      'Escolha o tipo: site, livro, artigo ou outro.',
      'Informe autor, título, ano e demais dados.',
      'Gere a referência formatada.',
      'Copie para a lista bibliográfica do seu TCC ou trabalho.'
    ],
    faqs: [
      {
        q: 'Segue a NBR 6023?',
        a: 'A formatação segue as regras gerais da NBR 6023. Confira sempre o manual da sua instituição.'
      },
      {
        q: 'Serve para TCC?',
        a: 'Sim. É pensado para trabalhos acadêmicos, fichamentos e listas de referências.'
      },
      {
        q: 'Preciso de conta?',
        a: 'Não para começar. Duas gerações são livres; a conta grátis guarda o histórico depois.'
      }
    ],
    related: [
      { href: '/corretor-de-redacao-enem', label: 'Corretor de redação ENEM' },
      { href: '/gerador-de-curriculo', label: 'Gerador de currículo' },
      { href: '/para/estudantes', label: 'Para estudantes' }
    ],
    ogEyebrow: 'RESOLVA JATO · ABNT',
    ogTitle: 'Referências ABNT em segundos.',
    ogSubtitle: 'Sites, livros e artigos · padrão NBR 6023',
    applicationCategory: 'EducationalApplication'
  },
  {
    toolId: 'agenda',
    path: '/agenda-online',
    toolName: 'Agenda',
    metaTitle: 'Agenda online grátis para compromissos e prazos',
    metaDescription:
      'Organize compromissos, lembretes e visão semanal de prazos no navegador. Ideal para freelancers, MEI e rotina de estudos.',
    keywords: [
      'agenda online grátis',
      'calendário de compromissos',
      'organizador de prazos',
      'agenda para freelancer',
      'lembretes online'
    ],
    h1: 'Agenda online grátis',
    subtitle:
      'Registre compromissos e prazos com visão semanal. Útil para atendimentos, entregas e estudos.',
    howToTitle: 'Como usar a agenda',
    howToSteps: [
      'Crie um compromisso com data, horário e descrição.',
      'Organize a semana na visão de calendário.',
      'Ajuste lembretes conforme sua rotina.',
      'Volte quando precisar: a conta grátis sincroniza depois das gerações livres.'
    ],
    faqs: [
      {
        q: 'A agenda é gratuita?',
        a: 'Você experimenta sem cadastro. Recursos avançados e sincronização pedem conta; Premium libera o uso completo da agenda.'
      },
      {
        q: 'Serve para freelancers?',
        a: 'Sim. É comum usar para prazos de entrega, reuniões e cobranças da semana.'
      },
      {
        q: 'Funciona no celular?',
        a: 'Sim. A interface é responsiva para consultar e anotar pelo navegador do celular.'
      }
    ],
    related: [
      { href: '/gerador-de-proposta-comercial', label: 'Proposta comercial' },
      { href: '/orcamento-com-pix', label: 'Orçamento com Pix' },
      { href: '/para/freelancers', label: 'Para freelancers' }
    ],
    ogEyebrow: 'RESOLVA JATO · AGENDA',
    ogTitle: 'Organize prazos sem planilha solta.',
    ogSubtitle: 'Compromissos e visão semanal · no navegador',
    applicationCategory: 'BusinessApplication'
  },
  {
    toolId: 'divisor-conta',
    path: '/divisor-de-conta',
    toolName: 'Divisor de conta',
    metaTitle: 'Divisor de conta grátis (churrasco, restaurante, viagem)',
    metaDescription:
      'Divida a conta entre amigos com taxa de serviço. Ideal para churrasco, restaurante ou viagem, sem planilha.',
    keywords: [
      'divisor de conta',
      'dividir conta restaurante',
      'rateio churrasco',
      'dividir despesas viagem',
      'calculadora de rateio'
    ],
    h1: 'Divisor de conta em grupo grátis',
    subtitle:
      'Rateie valores entre amigos com taxa de serviço. Churrasco, restaurante ou viagem, sem briga na hora de pagar.',
    howToTitle: 'Como dividir a conta',
    howToSteps: [
      'Informe o total da conta e a taxa de serviço, se houver.',
      'Adicione as pessoas do rateio.',
      'Ajuste valores por pessoa se alguém consumiu diferente.',
      'Compartilhe o resultado no grupo.'
    ],
    faqs: [
      {
        q: 'Dá para incluir taxa de serviço?',
        a: 'Sim. Informe o percentual e o divisor inclui no rateio automaticamente.'
      },
      {
        q: 'Serve para viagem?',
        a: 'Sim. Use para despesas compartilhadas de hospedagem, comida e passeios.'
      },
      {
        q: 'Preciso criar conta?',
        a: 'Não para a primeira utilização. Duas gerações livres; depois o cadastro libera continuidade.'
      }
    ],
    related: [
      { href: '/gerador-de-qr-code-pix', label: 'Gerador de QR Code Pix' },
      { href: '/gerador-de-recibo', label: 'Gerador de recibo' },
      { href: '/recursos', label: 'Catálogo de ferramentas' }
    ],
    ogEyebrow: 'RESOLVA JATO · RATEIO',
    ogTitle: 'Divida a conta sem planilha.',
    ogSubtitle: 'Churrasco, restaurante ou viagem · grátis',
    applicationCategory: 'UtilitiesApplication'
  }
];

export function getOrphanLanding(pathOrId: string) {
  return ORPHAN_PUBLIC_LANDINGS.find((item) => item.path === pathOrId || item.toolId === pathOrId);
}
