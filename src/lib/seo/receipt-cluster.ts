export type ReceiptClusterPage = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  answer: string;
  fields: string[];
  steps: string[];
  example: string[];
  sections: Array<{ title: string; paragraphs: string[] }>;
  faqs: Array<{ question: string; answer: string }>;
  related: string[];
};

export const receiptClusterPages: ReceiptClusterPage[] = [
  {
    slug: 'recibo-prestacao-de-servico',
    title: 'Recibo de prestação de serviço: modelo online em PDF',
    description: 'Crie um recibo de prestação de serviço com dados do cliente, descrição do trabalho, valor, forma de pagamento e assinatura.',
    eyebrow: 'Recibo para serviços',
    answer: 'O recibo de prestação de serviço comprova o pagamento de um trabalho específico. Ele deve identificar cliente e prestador, descrever o serviço sem ambiguidade e registrar valor, data e forma de pagamento.',
    fields: ['Nome e documento do cliente', 'Nome ou razão social do prestador', 'Serviço realizado e período', 'Valor numérico e por extenso', 'Data, forma de pagamento e assinatura'],
    steps: ['Identifique cliente e prestador', 'Descreva exatamente o serviço quitado', 'Informe valor, data e pagamento', 'Revise, assine e gere o PDF'],
    example: ['Recebi de Mercado Central Ltda.', 'R$ 850,00 (oitocentos e cinquenta reais)', 'Referente à manutenção elétrica realizada em agosto de 2026', 'Pagamento via Pix em 10/08/2026'],
    sections: [
      { title: 'Descreva o serviço com precisão', paragraphs: ['Evite expressões vagas como “serviços diversos”. Informe o trabalho, o período ou a entrega a que o pagamento se refere.', 'Quando o pagamento for parcial, registre a parcela e o saldo pendente para não sugerir quitação total.'] },
      { title: 'Recibo não substitui contrato nem nota fiscal', paragraphs: ['O contrato registra o combinado; o recibo registra o pagamento. Já a nota fiscal atende obrigações tributárias específicas.', 'Confirme com a prefeitura ou contador quando a emissão fiscal for obrigatória para a atividade.'] }
    ],
    faqs: [
      { question: 'Prestador autônomo pode emitir recibo?', answer: 'Sim. Identifique corretamente as partes e o serviço, sem ignorar eventuais obrigações fiscais.' },
      { question: 'O recibo pode ser enviado pelo WhatsApp?', answer: 'Sim. Envie o PDF e preserve uma cópia junto ao histórico da conversa.' },
      { question: 'Precisa reconhecer firma?', answer: 'Normalmente não para situações comuns, mas assinatura e elementos de autoria fortalecem o documento.' }
    ],
    related: ['recibo-para-autonomo', 'recibo-pagamento-pix', 'recibo-com-assinatura']
  },
  {
    slug: 'recibo-para-autonomo',
    title: 'Recibo para autônomo: faça online e baixe em PDF',
    description: 'Modelo de recibo para autônomo registrar serviços e pagamentos com valor por extenso, identificação e assinatura.',
    eyebrow: 'Profissional autônomo',
    answer: 'O autônomo pode emitir recibo para comprovar um pagamento recebido. O documento deve mostrar quem pagou, quem recebeu, por qual trabalho, qual valor e em que data.',
    fields: ['Nome e CPF do profissional', 'Nome e documento do cliente', 'Descrição objetiva do trabalho', 'Valor e forma de pagamento', 'Data, local e assinatura'],
    steps: ['Preencha seus dados profissionais', 'Identifique o cliente', 'Descreva trabalho e valor', 'Gere e guarde o PDF'],
    example: ['Recebi de João Martins', 'R$ 320,00 (trezentos e vinte reais)', 'Referente à instalação de duas luminárias', 'Pagamento integral via transferência'],
    sections: [
      { title: 'Quando o autônomo deve usar recibo', paragraphs: ['O recibo é útil em pagamentos por serviço, sinal, parcela ou reembolso claramente identificado.', 'Ele organiza o histórico do profissional e dá ao cliente uma prova objetiva da quitação descrita.'] },
      { title: 'Cuidados fiscais', paragraphs: ['Recibo e nota fiscal têm finalidades diferentes. Dependendo da atividade e do contratante, podem existir obrigações tributárias ou previdenciárias adicionais.', 'Use o documento como comprovante do pagamento, não como substituto automático de uma obrigação fiscal.'] }
    ],
    faqs: [
      { question: 'Autônomo sem CNPJ pode emitir recibo?', answer: 'Sim. Pode usar nome e CPF, observando as obrigações aplicáveis ao serviço.' },
      { question: 'Posso emitir um recibo para cada parcela?', answer: 'Sim. Identifique o número da parcela e deixe claro se ainda existe saldo.' },
      { question: 'É necessário assinar?', answer: 'A assinatura reforça autoria e confirmação do recebimento.' }
    ],
    related: ['recibo-prestacao-de-servico', 'como-preencher-recibo', 'recibo-em-pdf']
  },
  {
    slug: 'recibo-pagamento-pix',
    title: 'Recibo de Pix: o comprovante serve? Gere o PDF',
    description: 'O comprovante do Pix mostra a transferência. O recibo explica o que foi quitado. Crie o PDF grátis, sem cadastro, e envie para o pagador.',
    eyebrow: 'Pagamento via Pix',
    answer: 'O comprovante bancário mostra a transferência; o recibo explica qual obrigação aquele Pix quitou. Os dois documentos se complementam quando o motivo do pagamento precisa ficar claro.',
    fields: ['Pagador e recebedor', 'Valor transferido', 'Serviço, produto ou parcela quitada', 'Data do recebimento', 'Indicação “pago via Pix”'],
    steps: ['Confirme o Pix recebido', 'Identifique a finalidade', 'Registre partes, valor e data', 'Gere o recibo e envie ao pagador'],
    example: ['Recebi de Ana Souza', 'R$ 1.200,00 (mil e duzentos reais)', 'Referente à primeira parcela do projeto de identidade visual', 'Pago via Pix em 10/08/2026'],
    sections: [
      { title: 'Comprovante Pix e recibo são diferentes', paragraphs: ['O comprovante do banco confirma a movimentação entre contas, mas pode não explicar contrato, parcela ou serviço.', 'O recibo conecta o valor à obrigação quitada e pode declarar se o pagamento foi total ou parcial.'] },
      { title: 'Gere o recibo depois do Pix', paragraphs: ['Abra o gerador, informe pagador, recebedor, valor, data e o que aquele Pix quitou, e baixe o PDF para enviar no WhatsApp.', 'Não precisa cadastro para começar. A conta grátis só entra se você quiser histórico ou PDF sem a marca.'] },
      { title: 'Não exponha dados bancários', paragraphs: ['Não é necessário inserir chave Pix, conta completa ou identificadores sensíveis no recibo.', 'Informe apenas a forma de pagamento e os dados necessários para identificar as partes e a operação.'] }
    ],
    faqs: [
      { question: 'O comprovante do Pix serve como recibo?', answer: 'Não por si só. Ele prova que o dinheiro saiu de uma conta para outra. O recibo registra quem pagou, quem recebeu, o valor, a data e o que aquele Pix quitou (serviço, aluguel, parcela). Use os dois juntos.' },
      { question: 'Como gerar um recibo de Pix online?', answer: 'Abra o gerador, informe pagador, recebedor, valor, finalidade e a data do Pix. Marque “pago via Pix”, revise e baixe o PDF para enviar no WhatsApp.' },
      { question: 'Preciso colocar a chave Pix?', answer: 'Não. Evite expor dados bancários desnecessários. Basta indicar a forma de pagamento e identificar as partes.' },
      { question: 'Posso emitir depois do pagamento?', answer: 'Sim. Use a data real do recebimento e confira o valor transferido.' }
    ],
    related: ['recibo-prestacao-de-servico', 'recibo-com-assinatura', 'recibo-tem-validade-juridica']
  },
  {
    slug: 'modelo-de-recibo-simples',
    title: 'Modelo de recibo simples: preencha e baixe grátis',
    description: 'Use um modelo de recibo simples com pagador, recebedor, valor por extenso, motivo, data e assinatura.',
    eyebrow: 'Modelo simples',
    answer: 'Um recibo simples pode ser curto, mas não deve ser genérico. A versão mínima identifica as partes, o valor, o motivo do pagamento, a data e a assinatura de quem recebeu.',
    fields: ['Quem recebeu', 'Quem pagou', 'Valor em número e por extenso', 'Motivo do pagamento', 'Data e assinatura'],
    steps: ['Escolha um modelo limpo', 'Preencha partes e valor', 'Explique o pagamento', 'Revise e baixe'],
    example: ['Recebi de Carlos Pereira a quantia de R$ 150,00', 'Referente ao conserto de uma torneira', 'São Paulo, 10 de agosto de 2026', 'Assinatura do recebedor'],
    sections: [
      { title: 'Simples não significa incompleto', paragraphs: ['O documento pode caber em poucas linhas desde que elimine dúvidas sobre valor, pessoas e finalidade.', 'Inclua documentos pessoais somente quando forem necessários para diferenciar as partes.'] },
      { title: 'Use uma descrição verificável', paragraphs: ['Prefira “pagamento da parcela 2 de 3” a “valor combinado”.', 'Uma descrição objetiva reduz discussões futuras sobre o alcance da quitação.'] }
    ],
    faqs: [
      { question: 'Recibo simples tem validade?', answer: 'Pode comprovar o pagamento descrito quando contém dados consistentes e autoria verificável.' },
      { question: 'Valor por extenso é obrigatório?', answer: 'Nem sempre, mas ajuda a evitar divergências e adulterações.' },
      { question: 'Posso imprimir o modelo?', answer: 'Sim. Você pode baixar o PDF e imprimir ou compartilhar digitalmente.' }
    ],
    related: ['como-preencher-recibo', 'recibo-em-pdf', 'recibo-tem-validade-juridica']
  },
  {
    slug: 'como-preencher-recibo',
    title: 'Como preencher um recibo corretamente: passo a passo',
    description: 'Aprenda a preencher recibo sem erros: partes, valor por extenso, finalidade, quitação, data e assinatura.',
    eyebrow: 'Passo a passo',
    answer: 'Para preencher um recibo, identifique pagador e recebedor, escreva o valor, descreva a finalidade, declare o alcance da quitação e finalize com data, local e assinatura.',
    fields: ['Dados completos das partes', 'Valor sem divergência', 'Finalidade específica', 'Quitação total ou parcial', 'Data, local e assinatura'],
    steps: ['Confirme quem paga e quem recebe', 'Digite o valor e confira o extenso', 'Descreva a operação e a quitação', 'Revise data e assinatura'],
    example: ['Recebi de [pagador] a quantia de [valor]', 'Referente a [serviço, produto ou parcela]', 'Pagamento [integral/parcial] realizado por [forma]', '[cidade], [data]. [assinatura]'],
    sections: [
      { title: 'Evite campos contraditórios', paragraphs: ['Confira se o número corresponde ao valor por extenso e se a data coincide com o recebimento.', 'Nomes, documentos e descrição devem se referir à mesma operação.'] },
      { title: 'Declare a extensão da quitação', paragraphs: ['Se o recibo cobre apenas um sinal ou parcela, escreva isso explicitamente.', 'Não use “plena quitação” quando ainda houver saldo, entrega ou obrigação pendente.'] }
    ],
    faqs: [
      { question: 'Quem deve assinar o recibo?', answer: 'Normalmente assina quem declara ter recebido o valor.' },
      { question: 'Posso corrigir depois de assinado?', answer: 'Prefira emitir uma nova versão e preservar o histórico, evitando rasuras.' },
      { question: 'Precisa colocar CPF?', answer: 'Use quando necessário para identificar as partes ou atender à finalidade do documento.' }
    ],
    related: ['modelo-de-recibo-simples', 'recibo-com-assinatura', 'recibo-tem-validade-juridica']
  },
  {
    slug: 'recibo-tem-validade-juridica',
    title: 'Recibo tem validade jurídica? Entenda os requisitos',
    description: 'Entenda quando um recibo comprova pagamento, quais dados fortalecem sua validade e a diferença para nota fiscal e contrato.',
    eyebrow: 'Validade do recibo',
    answer: 'Um recibo pode servir como prova de pagamento quando identifica as partes, o valor, a finalidade e a autoria da declaração. Sua força depende da consistência do documento e do conjunto de evidências do caso.',
    fields: ['Identificação das partes', 'Valor e obrigação quitada', 'Data do pagamento', 'Autoria ou assinatura', 'Integridade e histórico do documento'],
    steps: ['Descreva a operação sem ambiguidade', 'Identifique corretamente as partes', 'Colete assinatura ou evidência de autoria', 'Preserve PDF e histórico de envio'],
    example: ['Pagamento integral do serviço descrito', 'Valor numérico e por extenso coincidentes', 'Data e identificação das partes', 'Assinatura ou fluxo digital verificável'],
    sections: [
      { title: 'O que fortalece um recibo', paragraphs: ['Clareza, coerência e autoria são mais importantes do que linguagem excessivamente formal.', 'Contrato, conversa, comprovante bancário e entrega podem complementar o recibo em uma eventual discussão.'] },
      { title: 'Limites do documento', paragraphs: ['O recibo não transforma uma operação irregular em regular e não substitui automaticamente nota fiscal ou contrato.', 'Situações de maior valor, risco ou conflito merecem orientação jurídica ou contábil específica.'] }
    ],
    faqs: [
      { question: 'Recibo sem firma reconhecida vale?', answer: 'O reconhecimento não é requisito geral para todo recibo, embora possa reforçar a identificação em certos contextos.' },
      { question: 'Recibo digital é válido?', answer: 'Pode ser, especialmente quando autoria, integridade e concordância podem ser demonstradas.' },
      { question: 'Recibo substitui nota fiscal?', answer: 'Não. Os documentos cumprem finalidades diferentes.' }
    ],
    related: ['recibo-com-assinatura', 'recibo-em-pdf', 'como-preencher-recibo']
  },
  {
    slug: 'recibo-em-pdf',
    title: 'Recibo em PDF: crie, baixe e envie online',
    description: 'Faça um recibo em PDF com valor por extenso e assinatura, pronto para baixar, imprimir ou enviar pelo WhatsApp.',
    eyebrow: 'Documento em PDF',
    answer: 'O PDF preserva a aparência do recibo e facilita envio, impressão e arquivamento. Gere o arquivo somente depois de revisar valor, partes, finalidade e data.',
    fields: ['Texto revisado', 'Layout legível', 'Valor por extenso', 'Data e assinatura', 'Nome de arquivo identificável'],
    steps: ['Preencha os dados do recibo', 'Confira a visualização', 'Adicione assinatura quando aplicável', 'Baixe e arquive o PDF'],
    example: ['recibo-cliente-servico-2026-08.pdf', 'Uma via para quem paga', 'Uma via para quem recebe', 'Histórico armazenado com segurança'],
    sections: [
      { title: 'Vantagens do formato PDF', paragraphs: ['O arquivo mantém tipografia, espaçamento e paginação em celulares e computadores diferentes.', 'Um nome de arquivo claro ajuda a localizar o recibo por cliente, finalidade e data.'] },
      { title: 'Cuidados ao compartilhar', paragraphs: ['Envie o documento apenas às pessoas envolvidas e evite dados pessoais desnecessários.', 'Guarde a versão final, não apenas uma captura de tela ou prévia da conversa.'] }
    ],
    faqs: [
      { question: 'Posso editar o PDF depois?', answer: 'O ideal é corrigir no gerador e exportar uma nova versão, preservando a integridade.' },
      { question: 'Serve para imprimir?', answer: 'Sim. O PDF foi feito para manter o layout na impressão.' },
      { question: 'Posso enviar pelo WhatsApp?', answer: 'Sim. Envie como documento para preservar a qualidade do arquivo.' }
    ],
    related: ['modelo-de-recibo-simples', 'recibo-com-assinatura', 'recibo-pagamento-pix']
  },
  {
    slug: 'recibo-com-assinatura',
    title: 'Recibo com assinatura: gere e assine online',
    description: 'Crie recibo com assinatura digital ou espaço para assinatura manual, baixe em PDF e preserve a confirmação do pagamento.',
    eyebrow: 'Assinatura do recibo',
    answer: 'A assinatura vincula a declaração a quem afirma ter recebido o valor. Ela pode ser manual ou inserida em fluxo digital, desde que autoria e integridade possam ser demonstradas.',
    fields: ['Nome de quem assina', 'Qualidade da assinatura', 'Data da declaração', 'Documento sem alterações posteriores', 'Histórico de entrega ou aceite'],
    steps: ['Preencha e revise o recibo', 'Escolha assinatura manual ou digital', 'Finalize o documento', 'Guarde PDF e evidências do envio'],
    example: ['Recebedor identificado no texto', 'Assinatura ao final do documento', 'Data igual à declaração de recebimento', 'PDF final preservado pelas partes'],
    sections: [
      { title: 'Assinatura manual ou digital', paragraphs: ['Na versão manual, imprima e assine após revisar o conteúdo. No fluxo digital, evite colar assinaturas de terceiros sem autorização.', 'A assinatura deve corresponder à pessoa que declara o recebimento ou a representante com poderes para isso.'] },
      { title: 'Proteja a versão final', paragraphs: ['Depois de assinado, não altere valores ou finalidade. Qualquer correção deve gerar uma nova versão claramente identificada.', 'Preserve o arquivo, a data de envio e eventuais confirmações recebidas.'] }
    ],
    faqs: [
      { question: 'Assinatura digitalizada vale?', answer: 'Ela pode ajudar a demonstrar autoria, mas a força depende do contexto e das demais evidências.' },
      { question: 'Quem recebe precisa assinar?', answer: 'Em regra, assina quem declara ter recebido o pagamento.' },
      { question: 'Posso deixar espaço para assinatura manual?', answer: 'Sim. Gere o PDF com o espaço e assine após imprimir.' }
    ],
    related: ['recibo-tem-validade-juridica', 'recibo-em-pdf', 'como-preencher-recibo']
  }
];

export function getReceiptClusterPage(slug: string) {
  return receiptClusterPages.find((page) => page.slug === slug);
}
