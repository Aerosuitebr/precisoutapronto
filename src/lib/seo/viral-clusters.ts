export type ViralCluster = {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  answer: string;
  primary: { href: string; label: string };
  resources: Array<{ href: string; title: string; description: string; intent: string }>;
  sections: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
};

export const viralClusters: ViralCluster[] = [
  {
    path: '/rescisao', title: 'Cálculo de Rescisão Trabalhista: Calculadora e Guias',
    description: 'Calcule rescisão CLT e entenda saldo de salário, férias, 13º, aviso-prévio, FGTS e modalidades de desligamento.',
    eyebrow: 'Central de rescisão CLT', h1: 'Rescisão trabalhista, do cálculo à conferência.',
    answer: 'Comece pela calculadora para obter uma estimativa e use os guias para entender cada verba. O resultado depende do motivo do desligamento, datas, remuneração, férias, aviso e regras aplicáveis ao vínculo.',
    primary: { href: '/calculadora-de-rescisao', label: 'Calcular rescisão grátis' },
    resources: [
      { href: '/calculadora-de-rescisao', title: 'Calculadora de rescisão', description: 'Estime as principais verbas sem cadastro.', intent: 'Ferramenta' },
      { href: '/guias/como-calcular-rescisao', title: 'Como calcular rescisão', description: 'Entenda a composição do cálculo.', intent: 'Passo a passo' },
      { href: '/guias/calculo-rescisao-pedido-de-demissao', title: 'Pedido de demissão', description: 'Confira verbas, aviso e o que não é liberado.', intent: 'Modalidade' },
      { href: '/guias/calculo-rescisao-sem-justa-causa', title: 'Demissão sem justa causa', description: 'Organize verbas, aviso e efeitos no FGTS.', intent: 'Modalidade' },
      { href: '/guias/calculo-rescisao-comum-acordo', title: 'Rescisão por comum acordo', description: 'Veja o tratamento específico de aviso e FGTS.', intent: 'Modalidade' },
      { href: '/guias/calculo-rescisao-com-fgts', title: 'Rescisão com FGTS', description: 'Separe saldo, depósitos, multa e saque.', intent: 'Verba específica' },
      { href: '/modelos/como-calcular-rescisao', title: 'Informações para calcular', description: 'Organize datas, salário e modalidade.', intent: 'Checklist' },
      { href: '/guias/aviso-previo-proporcional-como-calcular', title: 'Aviso-prévio na rescisão', description: 'Veja base de 30 dias e acréscimos.', intent: 'Verba específica' },
      { href: '/calculadora-de-ferias', title: 'Calculadora de férias', description: 'Confira férias e adicional de um terço.', intent: 'Cálculo relacionado' },
      { href: '/calculadora-de-decimo-terceiro', title: 'Calculadora de 13º', description: 'Estime os avos do décimo terceiro.', intent: 'Cálculo relacionado' }
    ],
    sections: [
      { title: 'Uma intenção diferente para cada dúvida', body: 'Quem procura “calculadora de rescisão” quer resposta imediata; quem busca aviso-prévio, férias ou FGTS precisa compreender uma parcela. O cluster conecta essas jornadas sem repetir a mesma página.' },
      { title: 'Estimativa não é homologação', body: 'Médias, convenções coletivas, descontos e fatos específicos podem alterar o resultado. As páginas explicam os critérios e deixam claro quando buscar conferência profissional.' }
    ],
    faqs: [
      { question: 'A calculadora serve para demissão sem justa causa?', answer: 'Sim, selecione a modalidade correspondente e confira os dados informados.' },
      { question: 'FGTS sempre entra no valor a receber?', answer: 'Depende da modalidade e da forma como saldo, saque e multa são apresentados.' },
      { question: 'O resultado é definitivo?', answer: 'Não. É uma estimativa educacional que deve ser conferida no caso concreto.' }
    ]
  },
  {
    path: '/redacao-enem', title: 'Redação ENEM: Corretor, Nota e Guias por Competência',
    description: 'Analise sua redação ENEM, entenda as cinco competências e aprenda a melhorar tese, argumentos, coesão e proposta de intervenção.',
    eyebrow: 'Central de redação ENEM', h1: 'Treine, entenda a nota e melhore cada competência.',
    answer: 'Use o corretor para receber uma estimativa por competência e consulte os guias para revisar estrutura, repertório, coesão e intervenção. A análise é formativa e não representa nota oficial do Inep.',
    primary: { href: '/corretor-de-redacao-enem', label: 'Analisar redação grátis' },
    resources: [
      { href: '/corretor-de-redacao-enem', title: 'Corretor de redação ENEM', description: 'Estimativa de C1 a C5 com pontos fortes e alertas.', intent: 'Ferramenta' },
      { href: '/modelos/como-fazer-redacao-enem', title: 'Como fazer redação ENEM', description: 'Estruture tese, argumentos e intervenção.', intent: 'Passo a passo' },
      { href: '/para/estudantes', title: 'Ferramentas para estudantes', description: 'Redação, ABNT, estudos e currículo.', intent: 'Jornada do estudante' },
      { href: '/gerador-de-referencias-abnt', title: 'Referências ABNT', description: 'Organize fontes para trabalhos acadêmicos.', intent: 'Ferramenta relacionada' }
    ],
    sections: [
      { title: 'Da busca genérica à competência específica', body: 'A página pilar atende “corretor de redação”; os conteúdos explicativos respondem como começar, desenvolver argumentos e revisar a proposta de intervenção.' },
      { title: 'Feedback com limites transparentes', body: 'A ferramenta ajuda no treino e identifica padrões do texto, mas não substitui a correção oficial nem garante a nota da prova.' }
    ],
    faqs: [
      { question: 'O corretor dá nota oficial?', answer: 'Não. A nota é uma estimativa formativa baseada em critérios estruturados.' },
      { question: 'Posso analisar mais de uma versão?', answer: 'Sim. Compare revisões para acompanhar a evolução do texto.' },
      { question: 'Quais competências são avaliadas?', answer: 'Domínio da escrita, compreensão do tema, argumentação, coesão e proposta de intervenção.' }
    ]
  },
  {
    path: '/pix', title: 'Ferramentas Pix: QR Code, Cobrança, Orçamento e Recibo',
    description: 'Gere QR Code Pix, envie cobrança pelo WhatsApp, crie orçamento com aprovação e emita recibo do pagamento.',
    eyebrow: 'Central de cobrança Pix', h1: 'Do valor combinado ao Pix e ao recibo.',
    answer: 'Para uma cobrança avulsa, gere QR Code e Pix Copia e Cola. Para serviços com itens e aprovação, use orçamento com Pix. Depois do pagamento, emita o recibo correspondente.',
    primary: { href: '/gerador-de-qr-code-pix', label: 'Gerar QR Code Pix' },
    resources: [
      { href: '/gerador-de-qr-code-pix', title: 'Gerador de QR Code Pix', description: 'QR e Copia e Cola seguindo o padrão BR Code.', intent: 'Cobrança rápida' },
      { href: '/orcamento-com-pix', title: 'Orçamento com aprovação e Pix', description: 'Itens, aceite no celular e cobrança no mesmo fluxo.', intent: 'Venda de serviço' },
      { href: '/guias/como-gerar-qr-code-pix-para-cobranca', title: 'Como gerar QR Code Pix', description: 'Dados necessários, teste e envio ao cliente.', intent: 'Passo a passo' },
      { href: '/guias/como-fazer-orcamento-com-pix', title: 'Como fazer orçamento com Pix', description: 'Preço, validade, aprovação e cobrança.', intent: 'Guia comercial' },
      { href: '/recibos/recibo-pagamento-pix', title: 'Recibo de pagamento Pix', description: 'Conecte a transferência à obrigação quitada.', intent: 'Pós-pagamento' },
      { href: '/gerador-de-recibo', title: 'Gerador de recibo', description: 'Registre o pagamento e baixe o PDF.', intent: 'Comprovante' }
    ],
    sections: [
      { title: 'Não envie uma chave sem contexto', body: 'Uma cobrança clara informa recebedor, valor e finalidade. Em trabalhos maiores, orçamento, aprovação e recibo reduzem dúvidas e mensagens dispersas.' },
      { title: 'Privacidade e conferência', body: 'Teste o QR Code antes de enviar e evite publicar chaves ou dados bancários em páginas indexáveis. O processamento do gerador acontece no navegador.' }
    ],
    faqs: [
      { question: 'O QR Code Pix expira?', answer: 'O payload gerado pela ferramenta é estático; regras de vencimento dependem da modalidade usada pelo provedor.' },
      { question: 'Precisa de API bancária?', answer: 'Não para gerar o QR Code estático e o código Copia e Cola.' },
      { question: 'Pix substitui recibo?', answer: 'O comprovante demonstra a transferência; o recibo esclarece a finalidade da quitação.' }
    ]
  },
  {
    path: '/pdf', title: 'Ferramentas PDF Online: Juntar, Dividir, Comprimir e Editar',
    description: 'Junte, divida, comprima e edite PDF online com processamento local no navegador e sem enviar seus documentos ao servidor.',
    eyebrow: 'PDF Pronto', h1: 'Edite e organize seu PDF sem enviar documentos para nenhum servidor.',
    answer: 'Escolha a tarefa: juntar arquivos, extrair ou remover páginas, reduzir tamanho, girar ou reorganizar o documento. O processamento acontece localmente no seu navegador.',
    primary: { href: '/editor-de-pdf-online', label: 'Abrir editor de PDF' },
    resources: [
      { href: '/juntar-pdf-online', title: 'Juntar PDF online', description: 'Combine arquivos e reorganize páginas.', intent: 'Unir documentos' },
      { href: '/dividir-pdf-online', title: 'Dividir PDF online', description: 'Extraia, remova ou reorganize páginas.', intent: 'Separar páginas' },
      { href: '/comprimir-pdf-online', title: 'Comprimir PDF online', description: 'Reduza o tamanho com controle de qualidade.', intent: 'Diminuir arquivo' },
      { href: '/editor-de-pdf-online', title: 'Editor de PDF online', description: 'Gire, reorganize e prepare documentos.', intent: 'Editar páginas' },
      { href: '/dividir-pdf-online?acao=extrair', title: 'Extrair páginas do PDF', description: 'Selecione somente as páginas necessárias e gere um novo arquivo.', intent: 'Extrair páginas' },
      { href: '/dividir-pdf-online?acao=remover', title: 'Remover páginas do PDF', description: 'Exclua páginas sem alterar o documento original.', intent: 'Limpar documento' },
      { href: '/editor-de-pdf-online?acao=girar', title: 'Girar páginas do PDF', description: 'Corrija a orientação de páginas individuais ou em lote.', intent: 'Corrigir orientação' },
      { href: '/editor-de-pdf-online?acao=organizar', title: 'Organizar páginas do PDF', description: 'Reordene páginas visualmente antes de baixar.', intent: 'Reorganizar documento' },
      { href: '/converter-imagem-online', title: 'Converter imagem para PDF', description: 'Exporte JPG, PNG ou WEBP como PDF.', intent: 'Conversão' }
    ],
    sections: [
      { title: 'Cada tarefa tem uma URL própria', body: 'Quem busca juntar PDF não precisa atravessar um editor genérico. As páginas específicas abrem diretamente o fluxo certo e explicam limites e privacidade.' },
      { title: 'Processamento local como diferencial', body: 'Os arquivos permanecem no navegador durante as operações suportadas. Isso reduz exposição e também evita espera de upload em tarefas simples.' }
    ],
    faqs: [
      { question: 'Os PDFs são enviados ao servidor?', answer: 'Não nas ferramentas deste cluster; o processamento acontece localmente no navegador.' },
      { question: 'Funciona no celular?', answer: 'Sim, respeitando memória e tamanho disponível no aparelho.' },
      { question: 'Comprimir reduz a qualidade?', answer: 'O modo sem perda preserva a estrutura; modos visuais podem reduzir resolução para economizar mais espaço.' }
    ]
  }
];

export function getViralCluster(path: string) { return viralClusters.find((cluster) => cluster.path === path); }
