import type { ReceiptPreset } from './defaults';

export type ReceiptProfessionContext = {
  slug: ReceiptPreset;
  name: string;
  title: string;
  description: string;
  checklist: string[];
  faqs: Array<{ q: string; a: string }>;
};

export const RECEIPT_PROFESSION_CONTEXTS: ReceiptProfessionContext[] = [
  { slug: 'prestacao-de-servicos', name: 'Prestação de serviços', title: 'Recibo de prestação de serviços online em PDF', description: 'Crie um recibo de serviço com valor por extenso, forma de pagamento e assinatura, pronto para baixar em PDF.', checklist: ['Cliente e prestador', 'Serviço e período', 'Valor, pagamento e assinatura'], faqs: [{ q: 'Serve para pagamento parcial?', a: 'Sim. Identifique a parcela e o saldo que ainda estiver pendente.' }, { q: 'Recibo substitui nota fiscal?', a: 'Não. Verifique as obrigações fiscais da sua atividade.' }] },
  { slug: 'aluguel-residencial', name: 'Aluguel residencial', title: 'Recibo de aluguel residencial online grátis', description: 'Gere um recibo de aluguel com imóvel, competência, valor, locador, locatário e assinatura.', checklist: ['Endereço do imóvel', 'Mês de referência', 'Encargos e forma de pagamento'], faqs: [{ q: 'Posso incluir condomínio e IPTU?', a: 'Sim. Discrimine cada valor para deixar clara a composição do pagamento.' }, { q: 'Precisa da assinatura do locador?', a: 'A assinatura de quem recebeu reforça a comprovação do pagamento.' }] },
  { slug: 'diarista-e-domestica', name: 'Diarista e doméstica', title: 'Recibo para diarista e doméstica em PDF', description: 'Preencha datas trabalhadas, valor da diária, adicionais e pagamento em um recibo pronto para assinar.', checklist: ['Datas ou período trabalhado', 'Diárias e adicionais', 'Pagador, recebedor e assinatura'], faqs: [{ q: 'Posso reunir várias diárias?', a: 'Sim. Liste as datas ou indique claramente o período coberto.' }, { q: 'O recibo define vínculo de trabalho?', a: 'Não por si só. A relação depende das condições reais da prestação e da legislação aplicável.' }] },
  { slug: 'psicologo-e-terapia', name: 'Psicólogo e terapia', title: 'Recibo de psicólogo e terapia em PDF', description: 'Crie um comprovante profissional de atendimento com período, valor, dados necessários e assinatura, sem expor informações clínicas.', checklist: ['Profissional e pagador', 'Data ou período do atendimento', 'Valor e assinatura'], faqs: [{ q: 'Devo informar o diagnóstico?', a: 'Não. Evite dados clínicos; descreva apenas o atendimento necessário ao comprovante.' }, { q: 'Quais dados profissionais incluir?', a: 'Informe identificação e registro profissional quando aplicável, além dos dados essenciais do pagamento.' }] }
];

export function findReceiptProfessionContext(slug: string) {
  return RECEIPT_PROFESSION_CONTEXTS.find((item) => item.slug === slug);
}
