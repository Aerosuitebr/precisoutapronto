export type SeoLandingId =
  | 'orcamento-com-pix'
  | 'gerador-de-qr-code-pix'
  | 'para-mei'
  | 'para-freelancers'
  | 'para-estudantes'
  | 'gerador-de-curriculo'
  | 'gerador-de-contrato'
  | 'gerador-de-proposta'
  | 'gerador-de-recibo'
  | 'contrato-de-aluguel'
  | 'recibo-de-pagamento'
  | 'proposta-comercial-mei'
  | 'recibo-de-aluguel';

export interface SeoLandingContent {
  id: SeoLandingId;
  path: string;
  toolHref: string;
  eyebrow: string;
  title: string;
  description: string;
  heroBullets: string[];
  primaryCta: string;
  secondaryCta?: { label: string; href: string };
  sections: Array<{ title: string; body: string; bullets?: string[] }>;
  faqs: Array<{ q: string; a: string }>;
  related: Array<{ href: string; label: string; blurb: string }>;
}

export const SEO_LANDINGS = {
  'orcamento-com-pix': {
    id: 'orcamento-com-pix',
    path: '/orcamento-com-pix',
    toolHref: '/orcamento-com-pix#montar',
    eyebrow: 'Orçamento digital + Pix',
    title: 'Orçamento com Pix Grátis: Gere e Envie por WhatsApp',
    description:
      'Crie um orçamento profissional grátis, envie pelo WhatsApp e receba a aprovação do cliente. Teste 2 vezes sem cadastro.',
    heroBullets: [
      'Cliente aprova sem instalar app',
      'QR Pix e Copia e Cola prontos',
      'Link público para mandar no WhatsApp'
    ],
    primaryCta: 'Criar e enviar orçamento grátis',
    secondaryCta: { label: 'Gerador de QR Code Pix', href: '/gerador-de-qr-code-pix' },
    sections: [
      {
        title: 'Do preço à cobrança, no mesmo fluxo',
        body: 'Pare de mandar tabela no Word e Pix solto. O Precisou, Tá Pronto une orçamento, aprovação e cobrança.',
        bullets: [
          'Página limpa para o cliente no celular',
          'Status aprovado ou pedido de ajuste',
          'Aviso de volta no seu WhatsApp'
        ]
      },
      {
        title: 'Feito para quem fecha no zap',
        body: 'MEIs, freelancers e prestadores que vivem de orçamento rápido, sem ERP e sem mensalidade cara.'
      }
    ],
    faqs: [
      {
        q: 'O cliente precisa criar conta?',
        a: 'Não. Ele abre o link, aprova ou pede ajuste e avisa você no WhatsApp.'
      },
      {
        q: 'É grátis?',
        a: 'Sim. Você experimenta o orçamento sem cadastro. Conta só entra depois de duas gerações, para salvar o histórico.'
      },
      {
        q: 'Preciso criar conta para testar?',
        a: 'Não. Preencha, veja o preview e use duas gerações livres. A conta só entra depois disso, para continuar salvando.'
      },
      {
        q: 'Serve para qualquer serviço?',
        a: 'Sim: elétrica, design, reforma, aulas, consultoria. Basta listar itens e valores.'
      }
    ],
    related: [
      { href: '/pix', label: 'Central Pix', blurb: 'Cobrança, orçamento e recibo' },
      { href: '/para/mei', label: 'Para MEI', blurb: 'Cobrar e organizar o dia a dia' },
      { href: '/para/freelancers', label: 'Para freelancers', blurb: 'Proposta + contrato + Pix' },
      { href: '/gerador-de-qr-code-pix', label: 'Gerador de QR Code Pix', blurb: 'QR e Copia e Cola grátis' },
      { href: '/gerador-de-recibo', label: 'Gerador de recibo', blurb: 'PDF com valor por extenso' }
    ]
  },
  'gerador-de-qr-code-pix': {
    id: 'gerador-de-qr-code-pix',
    path: '/gerador-de-qr-code-pix',
    toolHref: '/gerador-de-qr-code-pix#gerar',
    eyebrow: 'Gerador de QR Code Pix',
    title: 'Gerador de QR Code Pix Grátis: Copia e Cola',
    description:
      'Crie QR Code Pix e código Copia e Cola no navegador. Padrão Banco Central, sem cadastro para gerar e copiar.',
    heroBullets: [
      'QR Code e Pix Copia e Cola na hora',
      'Sem API bancária e sem instalar app',
      'Funciona com CPF, CNPJ, e-mail, telefone ou chave aleatória'
    ],
    primaryCta: 'Gerar QR Code Pix agora',
    secondaryCta: { label: 'Orçamento com Pix', href: '/orcamento-com-pix' },
    sections: [
      {
        title: 'Cobrança Pix pronta para WhatsApp',
        body: 'Preencha a chave, o nome e a cidade. O Precisou, Tá Pronto monta o BR Code (padrão EMV do Banco Central) e mostra o QR na tela.',
        bullets: [
          'Valor fixo ou aberto (cliente digita no app)',
          'Copia e Cola para colar no banco',
          'Mensagem de cobrança pronta para WhatsApp'
        ]
      },
      {
        title: 'Quando usar o gerador e quando usar o orçamento',
        body: 'Use o gerador de QR para cobranças rápidas. Se precisa de itens, validade e aprovação do cliente, use o orçamento com Pix.'
      }
    ],
    faqs: [
      {
        q: 'O gerador de QR Code Pix é gratuito?',
        a: 'Sim. Você gera o QR e copia o código Pix sem pagar. Conta é opcional e só pedida depois de duas gerações ou para enviar pelo WhatsApp.'
      },
      {
        q: 'O QR Code funciona em qualquer banco?',
        a: 'Sim, o payload segue o padrão BR Code EMV do Banco Central e abre nos apps participantes do Pix.'
      },
      {
        q: 'Meus dados da chave Pix ficam salvos?',
        a: 'Nesta página, a geração monta o código no seu navegador. Não enviamos a chave para API bancária.'
      },
      {
        q: 'Posso deixar o valor em branco?',
        a: 'Sim. Sem valor, o pagador informa o valor no app do banco na hora do pagamento.'
      }
    ],
    related: [
      { href: '/pix', label: 'Central Pix', blurb: 'Do QR Code ao recibo' },
      { href: '/orcamento-com-pix', label: 'Orçamento + Pix', blurb: 'Aprovação + cobrança' },
      { href: '/gerador-de-recibo', label: 'Gerador de recibo', blurb: 'Comprovante em PDF' },
      { href: '/para/mei', label: 'Para MEI', blurb: 'Rotina de cobrança' }
    ]
  },
  'para-mei': {
    id: 'para-mei',
    path: '/para/mei',
    toolHref: '/orcamento-com-pix',
    eyebrow: 'Para MEI',
    title: 'Ferramentas grátis para MEI cobrar e profissionalizar',
    description:
      'Orçamento com Pix, recibo, contrato e proposta. Tudo pensado para quem atende pelo WhatsApp.',
    heroBullets: [
      'Orçamento que o cliente aprova no celular',
      'Recibo e contrato sem papelaria',
      'Sem cartão para começar'
    ],
    primaryCta: 'Começar como MEI',
    secondaryCta: { label: 'Gerador de QR Code Pix', href: '/gerador-de-qr-code-pix' },
    sections: [
      {
        title: 'Seu cliente já está no WhatsApp',
        body: 'Mande o link do orçamento, receba a aprovação e cobre com Pix na hora, sem planilha.'
      },
      {
        title: 'Documentos com cara de empresa',
        body: 'Recibo, contrato de serviços e proposta comercial em PDF, prontos para enviar.',
        bullets: ['Recibo com valor por extenso', 'Contrato editável', 'Proposta com validade']
      }
    ],
    faqs: [
      {
        q: 'Preciso de CNPJ na plataforma?',
        a: 'Não para testar. Você usa seus dados no documento; o cadastro é só e-mail e senha.'
      },
      {
        q: 'Funciona no celular?',
        a: 'Sim. Você monta no desktop ou celular; o cliente abre o orçamento no celular.'
      }
    ],
    related: [
      { href: '/checklist-cobranca-mei', label: 'Checklist de cobrança', blurb: 'Do orçamento ao recibo' },
      { href: '/orcamento-com-pix', label: 'Orçamento + Pix', blurb: 'Fluxo completo de cobrança' },
      { href: '/gerador-de-recibo', label: 'Recibo', blurb: 'PDF profissional' },
      { href: '/para/freelancers', label: 'Freelancers', blurb: 'Mesmo stack, outro ângulo' }
    ]
  },
  'para-freelancers': {
    id: 'para-freelancers',
    path: '/para/freelancers',
    toolHref: '/gerador-de-proposta-comercial',
    eyebrow: 'Para freelancers',
    title: 'Proposta, contrato e Pix sem parecer amador',
    description:
      'Feche trabalhos com proposta comercial, contrato e orçamento com Pix. Layouts com cara de agência.',
    heroBullets: [
      'Proposta com totais e validade',
      'Contrato de prestação de serviços',
      'Orçamento aprovável + Pix'
    ],
    primaryCta: 'Montar proposta agora',
    secondaryCta: { label: 'Criar orçamento', href: '/orcamento-com-pix' },
    sections: [
      {
        title: 'Do briefing ao pagamento',
        body: 'Envie a proposta, alinhe o contrato e cobre com link de orçamento + Pix, tudo no Precisou, Tá Pronto.'
      },
      {
        title: 'Menos Word, mais fechamento',
        body: 'Modelos prontos e PDF em um clique, com cara profissional, de graça.'
      }
    ],
    faqs: [
      {
        q: 'Consigo logo na proposta?',
        a: 'Sim, a ferramenta de propostas aceita logo e dados da sua marca.'
      },
      {
        q: 'E se o cliente pedir ajuste?',
        a: 'No orçamento público ele pode pedir ajuste; você recebe o aviso e atualiza o link.'
      }
    ],
    related: [
      { href: '/orcamento-com-pix', label: 'Orçamento + Pix', blurb: 'Cobrança no WhatsApp' },
      { href: '/gerador-de-contrato', label: 'Contratos', blurb: 'Modelos editáveis' },
      {
        href: '/gerador-de-proposta-comercial',
        label: 'Propostas',
        blurb: 'Cara de agência'
      }
    ]
  },
  'para-estudantes': {
    id: 'para-estudantes',
    path: '/para/estudantes',
    toolHref: '/corretor-de-redacao-enem',
    eyebrow: 'Para estudantes',
    title: 'Documentos acadêmicos, ABNT e currículo em um só lugar',
    description:
      'Crie fichamentos de jurisprudência, estudos de caso, pareceres acadêmicos, capas ABNT e currículos em minutos.',
    heroBullets: [
      'Fichamento, estudo de caso e parecer jurídico',
      'Capa, referências ABNT e currículo',
      'PDF editável para estudar, entregar ou imprimir'
    ],
    primaryCta: 'Analisar redação ENEM',
    secondaryCta: { label: 'Abrir currículo', href: '/gerador-de-curriculo' },
    sections: [
      {
        title: 'Prática jurídica e trabalhos acadêmicos',
        body: 'Estruture fichamentos, estudos de caso, pareceres, relatórios de audiência e roteiros de peças.'
      },
      {
        title: 'Currículo para estágio e primeiro emprego',
        body: 'Layouts limpos, tipografia profissional e exportação em PDF.'
      }
    ],
    faqs: [
      {
        q: 'A capa segue a ABNT?',
        a: 'O modelo universitário segue a estrutura usual de capa/folha de rosto. Confira as regras da sua instituição.'
      },
      {
        q: 'Preciso pagar?',
        a: 'Não. Gere documentos profissionais de graça; a busca de recursos também é gratuita.'
      }
    ],
    related: [
      { href: '/corretor-de-redacao-enem', label: 'Corretor de redação ENEM', blurb: 'Nota estimada por competência' },
      { href: '/gerador-de-curriculo', label: 'Currículo', blurb: 'PDF profissional' },
      { href: '/documentos-juridicos-online', label: 'Docs jurídicos', blurb: 'Direito, estágio e OAB' },
      { href: '/para/mei', label: 'Para MEI', blurb: 'Se você já presta serviço' }
    ]
  },
  'gerador-de-curriculo': {
    id: 'gerador-de-curriculo',
    path: '/gerador-de-curriculo',
    toolHref: '/gerador-de-curriculo#ferramenta',
    eyebrow: 'Currículo online',
    title: 'Gerador de currículo grátis em PDF',
    description:
      'Monte um currículo profissional com preview ao vivo e baixe em PDF, com layouts prontos, sem Word.',
    heroBullets: [
      'Preview em tempo real',
      'Layouts com tipografia limpa',
      'PDF com um clique'
    ],
    primaryCta: 'Montar currículo grátis',
    sections: [
      {
        title: 'Parece emprego, não modelo genérico',
        body: 'Escolha o layout, preencha experiência e formação, exporte. Ideal para estágio e recolocação.'
      }
    ],
    faqs: [
      {
        q: 'Posso editar depois?',
        a: 'Sim. Com conta grátis você salva e volta a editar.'
      }
    ],
    related: [
      { href: '/para/estudantes', label: 'Para estudantes', blurb: 'Capa ABNT + currículo' },
      { href: '/orcamento-com-pix', label: 'Orçamento + Pix', blurb: 'Se você já atende clientes' }
    ]
  },
  'gerador-de-contrato': {
    id: 'gerador-de-contrato',
    path: '/gerador-de-contrato',
    toolHref: '/gerador-de-contrato#ferramenta',
    eyebrow: 'Contratos',
    title: 'Gerador de contrato online grátis',
    description:
      'Contratos de serviços, aluguel, trabalho e mais: editáveis, com assinaturas no PDF.',
    heroBullets: ['Vários tipos prontos', 'Cláusulas com seus dados', 'PDF para assinar'],
    primaryCta: 'Montar contrato grátis',
    sections: [
      {
        title: 'Sem fila na papelaria',
        body: 'Preencha as partes, ajuste cláusulas e baixe. Modelo orientativo: revise antes de assinar.'
      }
    ],
    faqs: [
      {
        q: 'Substitui advogado?',
        a: 'Não. É um modelo orientativo para agilizar. Para casos complexos, consulte um profissional.'
      }
    ],
    related: [
      { href: '/gerador-de-proposta-comercial', label: 'Propostas', blurb: 'Antes do contrato' },
      { href: '/orcamento-com-pix', label: 'Orçamento + Pix', blurb: 'Depois da aprovação' }
    ]
  },
  'gerador-de-proposta': {
    id: 'gerador-de-proposta',
    path: '/gerador-de-proposta-comercial',
    toolHref: '/gerador-de-proposta-comercial#ferramenta',
    eyebrow: 'Propostas comerciais',
    title: 'Gerador de proposta comercial grátis',
    description:
      'Propostas com cara de agência: itens, totais, validade e PDF pronto para enviar ao cliente.',
    heroBullets: ['3 estilos de layout', 'Totais organizados', 'Logo opcional'],
    primaryCta: 'Montar proposta grátis',
    sections: [
      {
        title: 'Pareça grande sem equipe de design',
        body: 'Ideal para freelancers e pequenas agências que precisam enviar preço com presença.'
      }
    ],
    faqs: [
      {
        q: 'Dá para incluir desconto?',
        a: 'Sim. Organize itens, subtotal e condições de pagamento no próprio editor.'
      }
    ],
    related: [
      { href: '/para/freelancers', label: 'Para freelancers', blurb: 'Fluxo completo' },
      { href: '/gerador-de-contrato', label: 'Contrato', blurb: 'Feche o combinado' }
    ]
  },
  'gerador-de-recibo': {
    id: 'gerador-de-recibo',
    path: '/gerador-de-recibo',
    toolHref: '/gerador-de-recibo#ferramenta',
    eyebrow: 'Recibos',
    title: 'Gerador de recibo online grátis em PDF',
    description:
      'Emita recibo profissional com valor por extenso, modelos prontos e assinatura no PDF.',
    heroBullets: ['Valor por extenso automático', '3 modelos', 'PDF com assinatura'],
    primaryCta: 'Emitir recibo grátis',
    sections: [
      {
        title: 'Recibo limpo em segundos',
        body: 'Preencha recebedor, pagador e valor. Baixe o PDF e envie no WhatsApp ou e-mail.'
      }
    ],
    faqs: [
      {
        q: 'Serve como comprovante?',
        a: 'É um recibo formal entre as partes. Guarde o PDF e combine com sua rotina fiscal/contábil.'
      }
    ],
    related: [
      { href: '/para/mei', label: 'Para MEI', blurb: 'Rotina de cobrança' },
      { href: '/orcamento-com-pix', label: 'Orçamento + Pix', blurb: 'Antes do recibo' }
    ]
  }
} satisfies Record<string, SeoLandingContent>;

export function listSeoLandings() {
  return Object.values(SEO_LANDINGS);
}
