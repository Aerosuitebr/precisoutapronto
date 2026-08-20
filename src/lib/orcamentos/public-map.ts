import type { PixKeyType } from '@/lib/pix/types';
import { buildPixBrCode } from '@/lib/pix/brcode';
import type { OrcamentoItem, OrcamentoPublic, OrcamentoStatus } from './types';

export const ORCAMENTO_PIX_KEY_TYPES: PixKeyType[] = ['cpf', 'cnpj', 'email', 'phone', 'random'];

export type OrcamentoRow = {
  id: string;
  profissionalNome: string;
  profissionalWhatsapp: string;
  clienteNome: string;
  clienteContato: string;
  clienteEmail: string;
  itens: unknown;
  total: number;
  validade: string;
  observacoes: string;
  pixKey?: string | null;
  pixKeyType?: string | null;
  pixMerchantName?: string | null;
  pixMerchantCity?: string | null;
  status: string;
  feedbackCliente: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function pixFields(row: OrcamentoRow, includePix: boolean) {
  if (!includePix) {
    return { pixKey: '', pixKeyType: '', pixMerchantName: '', pixMerchantCity: '' };
  }
  return {
    pixKey: row.pixKey?.trim() || '',
    pixKeyType: row.pixKeyType?.trim() || '',
    pixMerchantName: row.pixMerchantName?.trim() || '',
    pixMerchantCity: row.pixMerchantCity?.trim() || ''
  };
}

export function toOrcamentoPublic(row: OrcamentoRow, options?: { includePix?: boolean }): OrcamentoPublic {
  const includePix = options?.includePix ?? row.status === 'approved';
  return {
    id: row.id,
    profissionalNome: row.profissionalNome,
    profissionalWhatsapp: row.profissionalWhatsapp,
    clienteNome: row.clienteNome,
    clienteContato: row.clienteContato,
    clienteEmail: row.clienteEmail || '',
    itens: row.itens as unknown as OrcamentoItem[],
    total: row.total,
    validade: row.validade,
    observacoes: row.observacoes,
    ...pixFields(row, includePix),
    status: row.status as OrcamentoStatus,
    feedbackCliente: row.feedbackCliente,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export function orcamentoPixBrCode(input: {
  pixKey?: string;
  pixKeyType?: string;
  pixMerchantName?: string;
  pixMerchantCity?: string;
  total: number;
  profissionalNome: string;
  id?: string;
}) {
  const key = input.pixKey?.trim() || '';
  if (!key) return '';
  const keyType = ORCAMENTO_PIX_KEY_TYPES.includes(input.pixKeyType as PixKeyType)
    ? (input.pixKeyType as PixKeyType)
    : 'random';
  return buildPixBrCode({
    key,
    keyType,
    merchantName: input.pixMerchantName?.trim() || input.profissionalNome,
    merchantCity: input.pixMerchantCity?.trim() || 'BRASIL',
    amount: input.total,
    description: 'Orcamento',
    txid: (input.id || 'ORC').replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || 'ORC'
  });
}
