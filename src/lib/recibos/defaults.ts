import { emptyAddress } from '@/components/shared/address-fields';
import { createDefaultSignature } from '@/lib/signatures/types';
import type { ReceiptData, ReceiptParty, ReceiptTemplateId } from './types';

function createId() {
  return `rec_${Math.random().toString(36).slice(2, 10)}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nextNumber() {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `${year}-${seq}`;
}

const emptyParty = (): ReceiptParty => ({ name: '', document: '', email: '', phone: '' });

export function createEmptyReceipt(templateId: ReceiptTemplateId = 'profissional'): ReceiptData {
  return {
    id: createId(),
    title: 'Novo recibo',
    number: nextNumber(),
    amount: 0,
    amountInput: '',
    reference: '',
    paymentMethod: 'Pix',
    city: '',
    date: todayIso(),
    receiver: emptyParty(),
    address: { ...emptyAddress },
    payer: emptyParty(),
    notes: '',
    templateId,
    fontId: 'arial',
    inkSaver: false,
    signature: createDefaultSignature(),
    updatedAt: new Date().toISOString()
  };
}

export const SAMPLE_RECEIPT: ReceiptData = {
  id: 'rec_exemplo_publico',
  title: 'Recibo de exemplo',
  number: '2026-001',
  amount: 1500,
  amountInput: 'R$ 1.500,00',
  reference: 'Serviços de design gráfico e identidade visual',
  paymentMethod: 'Pix',
  city: 'São Paulo',
  date: '2026-08-07',
  receiver: {
    name: 'Ana Lima Design',
    document: '123.456.789-09',
    email: 'ana@analimadesign.com.br',
    phone: '(11) 99999-1010'
  },
  address: {
    cep: '01310-100',
    street: 'Av. Paulista',
    number: '1000',
    complement: 'Conjunto 52',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP'
  },
  payer: {
    name: 'Mercado Central Ltda',
    document: '12.345.678/0001-90',
    email: 'financeiro@mercadocentral.com.br',
    phone: '(11) 3333-4444'
  },
  notes: 'Pagamento referente à primeira parcela do contrato.',
  templateId: 'profissional',
  fontId: 'arial',
  inkSaver: false,
  signature: createDefaultSignature('Ana Lima Design'),
  updatedAt: '2026-08-07T12:00:00.000Z'
};

export const PAYMENT_METHODS = ['Pix', 'Dinheiro', 'Transferência bancária', 'Cartão de crédito', 'Cartão de débito', 'Boleto', 'Cheque'];

export type RentalReceiptPreset = 'aluguel-residencial' | 'aluguel-comercial' | 'aluguel-pix';

export function createRentalReceipt(preset: RentalReceiptPreset): ReceiptData {
  const receipt = createEmptyReceipt(preset === 'aluguel-comercial' ? 'compacto' : 'profissional');
  const commercial = preset === 'aluguel-comercial';
  const pix = preset === 'aluguel-pix';
  return {
    ...receipt,
    title: commercial ? 'Recibo de aluguel comercial' : 'Recibo de aluguel residencial',
    reference: commercial
      ? 'Aluguel comercial do imóvel [endereço], competência [mês/ano]'
      : 'Aluguel residencial do imóvel [endereço], competência [mês/ano]',
    paymentMethod: pix ? 'Pix' : receipt.paymentMethod,
    notes: pix
      ? 'Pagamento recebido via Pix. Anexe ou guarde o comprovante da transação junto deste recibo.'
      : commercial
        ? 'Identifique razão social, CNPJ e unidade/sala comercial quando aplicável.'
        : 'Identifique o endereço completo do imóvel e o mês de referência.',
    updatedAt: new Date().toISOString()
  };
}
