import { buildDefaultClauses } from './clauses';
import { createEmptyContrato } from './defaults';
import type { ContractData } from './types';

export interface ContractProfessionContext {
  slug: string;
  name: string;
  title: string;
  description: string;
  objectDescription: string;
  paymentTerms: string;
  checklist: string[];
  faqs: Array<{ q: string; a: string }>;
}

export const CONTRACT_PROFESSION_CONTEXTS: ContractProfessionContext[] = [
  { slug: 'prestacao-de-servicos', name: 'Prestação de serviços', title: 'Contrato de prestação de serviços online', description: 'Defina escopo, prazo, pagamento, responsabilidades e encerramento em um contrato editável.', objectDescription: 'Prestação dos serviços descritos no escopo aprovado entre as partes, incluindo entregas, limites e critérios de aceite.', paymentTerms: 'Pagamento conforme valores, etapas e vencimentos acordados entre as partes.', checklist: ['Escopo e entregas', 'Prazo e pagamento', 'Responsabilidades e rescisão'], faqs: [{ q: 'O modelo serve para qualquer serviço?', a: 'É uma base adaptável. Atividades reguladas ou de maior risco exigem revisão jurídica específica.' }, { q: 'Posso editar todas as cláusulas?', a: 'Sim. Revise cada cláusula para refletir a negociação real.' }] },
  { slug: 'designer', name: 'Designer', title: 'Contrato para designer com revisões e direitos de uso', description: 'Formalize identidade visual, peças gráficas e projetos de design com entregáveis e revisões claros.', objectDescription: 'Criação dos materiais de design definidos no briefing aprovado, incluindo entregáveis, formatos finais e até 2 rodadas de ajustes.', paymentTerms: '50% na assinatura para reserva e início do projeto e 50% antes da entrega dos arquivos finais.', checklist: ['Briefing e entregáveis', 'Quantidade de revisões', 'Arquivos editáveis e direitos de uso'], faqs: [{ q: 'Como tratar revisões extras?', a: 'Defina o limite incluído e estabeleça que alterações adicionais serão orçadas separadamente.' }, { q: 'O cliente recebe arquivos editáveis?', a: 'Declare expressamente quais formatos serão entregues e se os arquivos-fonte estão incluídos.' }] },
  { slug: 'social-media', name: 'Social media', title: 'Contrato para social media com calendário e aprovações', description: 'Organize quantidade de peças, canais, aprovações, acessos e responsabilidades do cliente.', objectDescription: 'Planejamento e produção mensal de conteúdo para redes sociais, conforme quantidade de peças, canais e calendário definidos no escopo.', paymentTerms: 'Mensalidade paga antecipadamente até a data acordada, com serviços adicionais cobrados à parte.', checklist: ['Canais e volume mensal', 'Prazo para aprovação', 'Acessos, mídia e atendimento fora do escopo'], faqs: [{ q: 'Gestão de anúncios está incluída?', a: 'Somente se constar no escopo. Separe verba de mídia e honorários de gestão.' }, { q: 'Como evitar atraso por falta de aprovação?', a: 'Defina prazo para o cliente responder e o efeito do atraso no calendário.' }] },
  { slug: 'freelancer', name: 'Freelancer', title: 'Contrato para freelancer com escopo e pagamento', description: 'Proteja o projeto com entregas, cronograma, revisões, pagamento e encerramento bem definidos.', objectDescription: 'Execução do projeto freelancer descrito na proposta aprovada, respeitando entregas, cronograma e limites de revisão.', paymentTerms: 'Entrada na contratação e saldo por etapa ou na entrega, conforme cronograma financeiro acordado.', checklist: ['Entregas e fora de escopo', 'Cronograma e dependências', 'Entrada, revisões e cancelamento'], faqs: [{ q: 'Proposta substitui contrato?', a: 'A proposta ajuda a vender; o contrato detalha responsabilidades, mudanças e encerramento.' }, { q: 'Posso cobrar entrada?', a: 'Sim. Registre valor, vencimento e condição para início do trabalho.' }] }
];

export function findContractProfessionContext(slug: string) {
  return CONTRACT_PROFESSION_CONTEXTS.find((item) => item.slug === slug);
}

export function createContextualContract(context: ContractProfessionContext): ContractData {
  const base: ContractData = { ...createEmptyContrato('prestacao-servicos'), title: context.title, objectDescription: context.objectDescription, paymentTerms: context.paymentTerms, partyB: { ...createEmptyContrato().partyB, profession: context.slug === 'prestacao-de-servicos' ? '' : context.name.toLowerCase() } };
  return { ...base, clauses: buildDefaultClauses(base) };
}
