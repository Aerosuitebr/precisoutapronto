import type { Guide } from '@/lib/guides';

const UPDATED_AT = '2026-08-07';
const EDITORIAL = {
  publishedAt: UPDATED_AT,
  updatedAt: UPDATED_AT,
  author: 'Equipe editorial Resolva Jato',
  reviewer: 'Revisão editorial interna'
} as const;

const BACEN_PIX = { label: 'Banco Central — Pix', href: 'https://www.bcb.gov.br/estabilidadefinanceira/pix' };
const SEBRAE_FINANCAS = { label: 'Sebrae — organização financeira', href: 'https://sebrae.com.br/sites/PortalSebrae/ufs/ap/artigos/controle-financeiro-para-pequenas-empresas,1f7b8e2e1b5a9810VgnVCM1000001b00320aRCRD' };

export const clusterGuides: Guide[] = [
  {
    slug: 'modelo-de-orcamento-para-prestacao-de-servico',
    title: 'Modelo de orçamento para prestação de serviço: exemplo preenchido',
    description: 'Veja um orçamento de serviço preenchido e aprenda a organizar escopo, preço, prazo, validade e condições de pagamento.',
    answer: 'Um orçamento de serviço precisa identificar cliente e prestador, descrever cada entrega, informar quantidade, preço, prazo, validade e condições. A clareza do escopo evita que atividades extras sejam tratadas como parte do preço original.',
    category: 'Cobrança e vendas', readTime: '7 min', toolHref: '/orcamento-com-pix', toolLabel: 'Criar orçamento com Pix', ...EDITORIAL,
    sections: [
      { title: 'Defina a entrega antes do preço', paragraphs: ['Descreva o resultado que será entregue, formato, quantidade e limite de ajustes. Troque termos vagos por itens que cliente e prestador consigam conferir.'], bullets: ['Identificação das partes', 'Itens e quantidades', 'Prazo de execução', 'Validade e pagamento'] },
      { title: 'Mostre subtotal e total', paragraphs: ['Separe materiais, mão de obra e serviços adicionais quando isso ajudar a decisão. Informe entrada, parcelas e vencimentos sem esconder taxas no rodapé.'] },
      { title: 'Registre a versão aprovada', paragraphs: ['Envie um link ou PDF identificável e guarde a aprovação. Se o escopo mudar, gere uma nova versão em vez de alterar silenciosamente a anterior.'] }
    ],
    example: { title: 'Orçamento de pintura residencial', lines: ['Cliente: Marina Souza · Prestador: Pintura Lima MEI', 'Preparação e pintura de 2 quartos · 42 m²', 'Mão de obra: R$ 1.680,00 · Materiais: R$ 620,00', 'Total: R$ 2.300,00 · 40% na aprovação e saldo na entrega', 'Execução: 4 dias úteis · Validade: 10 dias'] },
    faq: [
      { question: 'Orçamento precisa ter assinatura?', answer: 'Não em todos os casos, mas registrar aceite, versão e data reduz dúvidas sobre o combinado.' },
      { question: 'Posso cobrar para fazer orçamento?', answer: 'Pode haver cobrança por visita ou projeto técnico, desde que o cliente saiba antes e concorde com a condição.' },
      { question: 'Devo incluir materiais?', answer: 'Informe claramente se estão incluídos, estimados ou serão comprados pelo cliente.' }
    ],
    relatedGuides: ['como-fazer-orcamento-com-pix', 'orcamento-aprovado-tem-validade', 'orcamento-ou-proposta-comercial']
  },
  {
    slug: 'como-cobrar-cliente-pelo-whatsapp',
    title: 'Como cobrar cliente pelo WhatsApp sem perder o profissionalismo',
    description: 'Use mensagens objetivas, registre vencimento e facilite o pagamento sem constranger o cliente.',
    answer: 'Uma boa cobrança pelo WhatsApp identifica o serviço, informa valor e vencimento, pergunta se houve algum problema e oferece um próximo passo simples. Comece cordialmente e aumente a firmeza apenas quando o atraso continuar.',
    category: 'Cobrança e vendas', readTime: '6 min', toolHref: '/gerador-de-qr-code-pix', toolLabel: 'Gerar cobrança Pix', ...EDITORIAL,
    sections: [
      { title: 'Envie contexto, não apenas a chave Pix', paragraphs: ['Lembre o que foi entregue, o valor e a data combinada. Um link de cobrança organizado reduz erros e parece menos improvisado do que uma chave isolada.'] },
      { title: 'Use uma sequência curta', paragraphs: ['No vencimento, envie um lembrete. Após o atraso, confirme se houve dificuldade. Persistindo, registre novo prazo e as consequências previstas no contrato.'], bullets: ['Lembrete no vencimento', 'Contato após 2 ou 3 dias', 'Novo prazo por escrito', 'Escalonamento coerente com o contrato'] },
      { title: 'Preserve o relacionamento e o histórico', paragraphs: ['Evite ameaças, exposição pública ou mensagens fora de horário. Guarde orçamento, aceite, nota ou recibo e conversas relevantes.'] }
    ],
    example: { title: 'Mensagem de lembrete', lines: ['Olá, Ana! Tudo bem?', 'O pagamento de R$ 480,00 referente à identidade visual vence hoje.', 'Segue novamente o link com o Pix: [link]. Se já pagou, pode desconsiderar. Obrigado!'] },
    faq: [
      { question: 'Posso cobrar todos os dias?', answer: 'Mensagens excessivas podem desgastar a relação. Use uma cadência razoável e documentada.' },
      { question: 'Devo mandar áudio?', answer: 'Texto facilita a conferência de valor, vencimento e link; áudio pode complementar, mas não substituir os dados.' },
      { question: 'Posso cobrar multa?', answer: 'Somente quando a condição foi informada e é aplicável ao caso. Para dúvidas, busque orientação profissional.' }
    ],
    sources: [BACEN_PIX], relatedGuides: ['cliente-nao-pagou-mensagem-de-cobranca', 'como-gerar-qr-code-pix-para-cobranca', 'como-reduzir-inadimplencia']
  },
  {
    slug: 'como-gerar-qr-code-pix-para-cobranca',
    title: 'Como gerar QR Code Pix para cobrança',
    description: 'Entenda os dados necessários, confira o valor e envie QR Code e Pix Copia e Cola ao cliente.',
    answer: 'Para gerar uma cobrança Pix, informe uma chave válida, nome e cidade do recebedor e, se desejar, valor e descrição. Depois, teste o QR Code e envie também o código Copia e Cola para facilitar o pagamento no mesmo celular.',
    category: 'Cobrança e vendas', readTime: '5 min', toolHref: '/gerador-de-qr-code-pix', toolLabel: 'Gerar QR Code Pix', ...EDITORIAL,
    sections: [
      { title: 'Preencha apenas o necessário', paragraphs: ['Use a chave correta e confira nome, cidade, valor e identificador. Não publique dados pessoais além do necessário para a cobrança.'] },
      { title: 'Teste antes de enviar', paragraphs: ['Abra o leitor Pix do seu banco, escaneie e confira recebedor e valor sem concluir o pagamento. Corrija qualquer divergência.'] },
      { title: 'Envie duas opções', paragraphs: ['O QR Code funciona bem em telas separadas; o Copia e Cola ajuda quem recebeu a cobrança no próprio celular. Inclua o contexto do serviço e o vencimento.'] }
    ],
    example: { title: 'Dados de uma cobrança', lines: ['Recebedor: Ana Lima Design', 'Valor: R$ 180,00', 'Descrição: sinal do projeto de logotipo', 'Envio: QR Code + Pix Copia e Cola'] },
    faq: [
      { question: 'Preciso de API bancária?', answer: 'Não para montar um código estático. Recursos de conciliação e confirmação automática dependem de serviços adicionais.' },
      { question: 'O QR Code confirma pagamento?', answer: 'Não. Confirme a entrada no aplicativo ou extrato da instituição financeira.' },
      { question: 'Posso deixar sem valor?', answer: 'Sim, mas o pagador precisará digitar o valor e aumenta o risco de erro.' }
    ],
    sources: [BACEN_PIX], relatedGuides: ['como-cobrar-cliente-pelo-whatsapp', 'como-fazer-orcamento-com-pix']
  },
  {
    slug: 'cliente-nao-pagou-mensagem-de-cobranca',
    title: 'Cliente não pagou: mensagens de cobrança para cada etapa',
    description: 'Modelos de lembrete, cobrança após o vencimento e negociação de novo prazo com linguagem profissional.',
    answer: 'Quando o cliente não paga, confirme se o pagamento foi processado, reenvie os dados e estabeleça um novo prazo por escrito. A mensagem deve ser factual, cordial e proporcional ao tempo de atraso.',
    category: 'Cobrança e vendas', readTime: '6 min', toolHref: '/checklist-cobranca-mei', toolLabel: 'Abrir checklist de cobrança', ...EDITORIAL,
    sections: [
      { title: 'Primeiro lembrete', paragraphs: ['Comece assumindo que pode ter ocorrido esquecimento ou falha. Identifique a cobrança e ofereça o link novamente.'] },
      { title: 'Depois do vencimento', paragraphs: ['Informe quantos dias se passaram e peça uma previsão objetiva. Se aceitar parcelamento ou nova data, registre a condição.'] },
      { title: 'Antes de escalar', paragraphs: ['Revise contrato, comprovantes de entrega e histórico. Medidas formais devem ser compatíveis com o caso e, quando necessário, orientadas por profissional habilitado.'] }
    ],
    example: { title: 'Mensagem após cinco dias', lines: ['Olá, Carlos. O pagamento de R$ 750,00 do serviço entregue em 2/8 continua pendente.', 'Você consegue regularizar até 12/8? Segue novamente o link: [link].', 'Se houve algum problema, me avise para combinarmos uma solução por escrito.'] },
    faq: [
      { question: 'Devo ameaçar protesto?', answer: 'Não use ameaças improvisadas. Avalie documentos, proporcionalidade e orientação adequada antes de medidas formais.' },
      { question: 'Posso negociar parcelas?', answer: 'Sim. Registre valores, datas e efeito do acordo sobre a dívida original.' },
      { question: 'Quando suspender o serviço?', answer: 'Observe o contrato, o estágio da entrega e os riscos da interrupção antes de agir.' }
    ],
    relatedGuides: ['como-cobrar-cliente-pelo-whatsapp', 'como-reduzir-inadimplencia', 'modelo-de-orcamento-para-prestacao-de-servico']
  },
  {
    slug: 'orcamento-aprovado-tem-validade',
    title: 'Orçamento aprovado tem validade? Entenda prazo e aceite',
    description: 'Saiba para que serve a validade do orçamento e como registrar alterações depois do aceite.',
    answer: 'A validade indica até quando preço e condições permanecem disponíveis. Depois do aceite, o documento e as mensagens trocadas podem integrar o acordo; mudanças relevantes devem ser registradas em nova versão ou aditivo.',
    category: 'Cobrança e vendas', readTime: '6 min', toolHref: '/orcamento-com-pix', toolLabel: 'Criar orçamento com validade', ...EDITORIAL,
    sections: [
      { title: 'Validade não é prazo de execução', paragraphs: ['A validade limita o período para aceitar as condições. O prazo de execução começa conforme o marco indicado, como aprovação, entrada ou envio de materiais.'] },
      { title: 'Registre o aceite', paragraphs: ['Identifique versão, data e meio de aprovação. Evite alterar preço ou escopo no mesmo arquivo após o cliente aceitar.'] },
      { title: 'Atualize quando custos mudarem', paragraphs: ['Se a validade venceu, confirme disponibilidade e gere nova versão. Explique alterações de forma objetiva.'] }
    ],
    faq: [
      { question: 'Qual validade devo usar?', answer: 'Use prazo coerente com variação de custos e agenda; sete, dez ou quinze dias são exemplos, não regras universais.' },
      { question: 'Aceite por WhatsApp vale?', answer: 'Mensagens podem ajudar a demonstrar concordância, mas a força do conjunto depende do contexto e dos documentos.' },
      { question: 'Posso mudar o preço após o aceite?', answer: 'Mudanças devem ser justificadas e acordadas, especialmente quando alteram o escopo original.' }
    ],
    relatedGuides: ['modelo-de-orcamento-para-prestacao-de-servico', 'orcamento-ou-proposta-comercial', 'contrato-de-prestacao-de-servicos-gratis']
  },
  {
    slug: 'orcamento-ou-proposta-comercial',
    title: 'Diferença entre orçamento e proposta comercial',
    description: 'Escolha o documento certo para apresentar preço, solução, escopo e condições ao cliente.',
    answer: 'O orçamento concentra itens, quantidades, preço e condições. A proposta comercial explica contexto, solução, benefícios, entregas, cronograma e investimento. Serviços simples podem usar orçamento; vendas consultivas costumam pedir uma proposta.',
    category: 'Cobrança e vendas', readTime: '6 min', toolHref: '/gerador-de-proposta-comercial', toolLabel: 'Criar proposta comercial', ...EDITORIAL,
    sections: [
      { title: 'Quando usar orçamento', paragraphs: ['Use quando a necessidade já está clara e o cliente precisa comparar itens, preço, prazo e pagamento.'] },
      { title: 'Quando usar proposta', paragraphs: ['Use quando você precisa demonstrar entendimento do problema, justificar a solução e conectar entregas a resultados.'] },
      { title: 'Contrato é uma terceira etapa', paragraphs: ['Orçamento e proposta ajudam a vender. Um contrato pode detalhar responsabilidades, propriedade intelectual, cancelamento e riscos.'] }
    ],
    example: { title: 'Escolha rápida', lines: ['Manutenção com itens definidos → orçamento', 'Projeto de marketing com diagnóstico → proposta comercial', 'Prestação recorrente e responsabilidades → contrato após o aceite'] },
    faq: [
      { question: 'Posso usar os dois?', answer: 'Sim. A proposta apresenta a solução e um quadro de investimento pode funcionar como orçamento.' },
      { question: 'Proposta precisa ser longa?', answer: 'Não. Ela precisa ser suficiente para a decisão, sem apresentação institucional excessiva.' },
      { question: 'Qual documento vem primeiro?', answer: 'Depende da venda. Em geral, orçamento ou proposta precede a formalização contratual.' }
    ],
    relatedGuides: ['proposta-comercial-para-mei', 'modelo-de-orcamento-para-prestacao-de-servico', 'contrato-de-prestacao-de-servicos-gratis']
  },
  {
    slug: 'recibo-simples-tem-validade',
    title: 'Recibo simples tem validade? O que ele comprova',
    description: 'Entenda quais dados dão clareza ao recibo e por que ele não substitui automaticamente nota fiscal ou contrato.',
    answer: 'Um recibo simples pode comprovar o recebimento de determinado valor quando identifica partes, quantia, motivo, data e autoria. Sua utilidade depende da clareza e do conjunto de evidências; ele não substitui automaticamente obrigações fiscais.',
    category: 'Documentos profissionais', readTime: '6 min', toolHref: '/gerador-de-recibo', toolLabel: 'Gerar recibo', ...EDITORIAL,
    sections: [
      { title: 'O que o recibo deve demonstrar', paragraphs: ['O texto precisa responder quem recebeu, de quem, quanto, por qual motivo e quando. Use valor numérico e por extenso para reduzir ambiguidades.'] },
      { title: 'Assinatura e evidências digitais', paragraphs: ['Assinatura, histórico de envio e comprovante de pagamento reforçam o conjunto. Preserve o arquivo final, não apenas uma captura de tela.'] },
      { title: 'Recibo, nota e contrato', paragraphs: ['Recibo trata da quitação descrita; nota fiscal atende finalidade fiscal; contrato registra obrigações. Um documento não elimina automaticamente a necessidade dos outros.'] }
    ],
    example: { title: 'Recibo simples', lines: ['Recebi de João Pereira a quantia de R$ 350,00 (trezentos e cinquenta reais).', 'Referente à manutenção elétrica realizada em 5 de agosto de 2026.', 'São Paulo, 7 de agosto de 2026 · Ana Lima · CPF/CNPJ quando necessário'] },
    faq: [
      { question: 'Recibo sem assinatura vale?', answer: 'Outras evidências podem existir, mas a assinatura ajuda a demonstrar autoria e concordância.' },
      { question: 'Recibo substitui nota fiscal?', answer: 'Não necessariamente. Verifique a obrigação fiscal aplicável à atividade e ao município.' },
      { question: 'Posso emitir por Pix?', answer: 'Sim. Identifique Pix como forma de pagamento e descreva a operação quitada.' }
    ],
    relatedGuides: ['modelo-de-recibo-mei', 'como-assinar-documentos-digitalmente', 'contrato-de-prestacao-de-servicos-gratis']
  },
  {
    slug: 'como-assinar-documentos-digitalmente',
    title: 'Como assinar documentos digitalmente com mais segurança',
    description: 'Conheça opções de assinatura, preserve o arquivo final e registre autoria, integridade e aceite.',
    answer: 'Para assinar digitalmente, escolha um método compatível com o risco do documento, confirme identidade das partes, use o mesmo arquivo final e preserve evidências de data, autoria e integridade. Casos formais podem exigir solução ou certificado específico.',
    category: 'Documentos profissionais', readTime: '7 min', toolHref: '/gerador-de-contrato', toolLabel: 'Preparar documento para assinatura', ...EDITORIAL,
    sections: [
      { title: 'Finalize antes de assinar', paragraphs: ['Revise nomes, valores, datas e anexos. Gere uma versão final e evite editar o conteúdo depois que uma das partes assinar.'] },
      { title: 'Escolha o nível de evidência', paragraphs: ['Clique de aceite, assinatura eletrônica e certificado digital oferecem evidências diferentes. Considere valor, risco, exigência legal e possibilidade de contestação.'] },
      { title: 'Guarde o pacote completo', paragraphs: ['Preserve documento, comprovante de assinatura, trilha de auditoria e mensagens que contextualizam o acordo.'] }
    ],
    faq: [
      { question: 'Assinatura desenhada é suficiente?', answer: 'Ela pode compor a evidência, mas não prova sozinha identidade e integridade em todos os contextos.' },
      { question: 'Preciso de certificado ICP-Brasil?', answer: 'Nem todo documento exige certificado. Algumas operações ou níveis de segurança podem exigir formato específico.' },
      { question: 'Posso assinar PDF pelo celular?', answer: 'Sim, desde que o processo preserve o arquivo final e as evidências necessárias.' }
    ],
    sources: [{ label: 'ITI — assinatura eletrônica', href: 'https://www.gov.br/iti/pt-br/assuntos/assinatura-eletronica' }], relatedGuides: ['contrato-de-prestacao-de-servicos-gratis', 'recibo-simples-tem-validade']
  },
  {
    slug: 'como-organizar-pagamentos-e-prazos',
    title: 'Como organizar pagamentos e prazos trabalhando por conta',
    description: 'Crie uma rotina semanal para acompanhar propostas, entregas, vencimentos e cobranças.',
    answer: 'Organize cada trabalho com cliente, etapa, valor, vencimento e status. Revise a lista em um horário fixo toda semana e separe o que precisa de entrega, cobrança ou confirmação.',
    category: 'Gestão autônoma', readTime: '7 min', toolHref: '/agenda-online', toolLabel: 'Organizar agenda', ...EDITORIAL,
    sections: [
      { title: 'Use uma linha por compromisso', paragraphs: ['Registre cliente, serviço, próxima ação, responsável, data e valor. Evite guardar prazos apenas na conversa do WhatsApp.'] },
      { title: 'Separe entrega de recebimento', paragraphs: ['Um serviço pode estar entregue e ainda não recebido. Mantenha status distintos para produção, aprovação, faturamento e pagamento.'] },
      { title: 'Faça uma revisão semanal', paragraphs: ['Reserve vinte minutos para identificar vencimentos, clientes sem resposta e capacidade da próxima semana.'] }
    ],
    example: { title: 'Controle mínimo', lines: ['Cliente: Loja Aurora · Próxima ação: aprovar layout · 9/8', 'Valor total: R$ 1.200 · Entrada recebida: R$ 600', 'Saldo: R$ 600 · Vencimento: 16/8 · Status: aguardando aprovação'] },
    faq: [
      { question: 'Agenda substitui controle financeiro?', answer: 'Não. A agenda acompanha ações e datas; o financeiro registra entradas, saídas e conciliação.' },
      { question: 'Quantos status usar?', answer: 'Comece com poucos: proposta, em execução, aguardando cliente, entregue, a receber e concluído.' },
      { question: 'Devo revisar todo dia?', answer: 'Compromissos próximos, sim; uma revisão semanal mais ampla evita que pendências antigas desapareçam.' }
    ],
    sources: [SEBRAE_FINANCAS], relatedGuides: ['checklist-de-clientes-para-autonomos', 'como-reduzir-inadimplencia']
  },
  {
    slug: 'checklist-de-clientes-para-autonomos',
    title: 'Planilha e checklist de clientes para autônomos',
    description: 'Saiba quais campos acompanhar do primeiro contato ao pagamento e pós-venda.',
    answer: 'Um controle de clientes útil reúne contato, necessidade, proposta enviada, valor, próxima ação, prazo, status do pagamento e observações relevantes. Colete apenas dados necessários e mantenha acesso protegido.',
    category: 'Gestão autônoma', readTime: '6 min', toolHref: '/agenda-online', toolLabel: 'Abrir agenda online', ...EDITORIAL,
    sections: [
      { title: 'Campos essenciais', paragraphs: ['Registre nome, canal preferido, serviço, valor estimado, origem do contato e próxima ação. A coluna mais importante é a próxima ação com data.'], bullets: ['Contato e origem', 'Serviço de interesse', 'Proposta e valor', 'Próxima ação', 'Status do pagamento'] },
      { title: 'Acompanhe o funil sem complicar', paragraphs: ['Use etapas simples: novo contato, diagnóstico, proposta, negociação, aprovado e perdido. Revise contatos parados.'] },
      { title: 'Proteja dados do cliente', paragraphs: ['Não registre documentos, dados bancários ou informações sensíveis sem necessidade. Restrinja o acesso e elimine dados que perderam a finalidade.'] }
    ],
    faq: [
      { question: 'Preciso de CRM?', answer: 'Não no início. Uma estrutura simples funciona se for atualizada e gerar próximas ações claras.' },
      { question: 'Posso guardar CPF?', answer: 'Colete apenas quando houver finalidade legítima e necessidade para o processo.' },
      { question: 'Como saber por que perco vendas?', answer: 'Registre um motivo curto ao encerrar oportunidades: preço, prazo, escopo, concorrente ou sem retorno.' }
    ],
    sources: [{ label: 'ANPD — materiais sobre proteção de dados', href: 'https://www.gov.br/anpd/pt-br/documentos-e-publicacoes' }], relatedGuides: ['como-organizar-pagamentos-e-prazos', 'como-reduzir-inadimplencia']
  },
  {
    slug: 'como-reduzir-inadimplencia',
    title: 'Como reduzir inadimplência em serviços',
    description: 'Reduza atrasos com escopo claro, entrada, marcos de pagamento, lembretes e registro do aceite.',
    answer: 'A inadimplência diminui quando preço, vencimento e consequência do atraso estão claros antes do início. Entrada, pagamentos por etapa e lembretes antecipados reduzem a exposição sem transformar a relação em desconfiança.',
    category: 'Gestão autônoma', readTime: '7 min', toolHref: '/orcamento-com-pix', toolLabel: 'Criar orçamento com pagamento', ...EDITORIAL,
    sections: [
      { title: 'Qualifique antes de começar', paragraphs: ['Confirme responsável pela aprovação e pagamento, dados de faturamento e processo do cliente. Não inicie trabalho grande apenas com uma mensagem vaga.'] },
      { title: 'Distribua o risco', paragraphs: ['Use entrada ou marcos ligados a entregas verificáveis. Evite deixar todo o valor para depois da entrega final.'], bullets: ['Entrada na aprovação', 'Parcela em marco intermediário', 'Saldo antes ou na entrega final', 'Vencimentos no documento'] },
      { title: 'Lembre antes de vencer', paragraphs: ['Envie lembrete com contexto, valor e link. Depois do vencimento, siga uma cadência documentada e proporcional.'] }
    ],
    faq: [
      { question: 'Quanto pedir de entrada?', answer: 'Depende de custo inicial, duração, confiança e risco. O percentual deve ser claro e compatível com o projeto.' },
      { question: 'Pagamento por etapa funciona?', answer: 'Sim, quando cada etapa tem entrega e critério de aceite objetivos.' },
      { question: 'Devo recusar cliente sem entrada?', answer: 'Defina uma política coerente com o risco e a capacidade de absorver atraso; exceções devem ser conscientes.' }
    ],
    sources: [SEBRAE_FINANCAS], relatedGuides: ['como-cobrar-cliente-pelo-whatsapp', 'cliente-nao-pagou-mensagem-de-cobranca', 'como-organizar-pagamentos-e-prazos']
  }
];
