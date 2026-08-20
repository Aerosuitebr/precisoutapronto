import type { OrcamentoItem, OrcamentoPayload, OrcamentoStatus } from './types';
import { calcOrcamentoTotal, isValidEmail } from './types';
import { ORCAMENTO_PIX_KEY_TYPES } from './public-map';
import type { PixKeyType } from '@/lib/pix/types';

export interface ValidationResult {
  ok: boolean;
  error?: string;
  data?: OrcamentoPayload & { total: number };
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseItens(value: unknown): OrcamentoItem[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const itens: OrcamentoItem[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return null;
    const row = raw as Record<string, unknown>;
    const nome = asString(row.nome);
    const quantidade = Number(row.quantidade);
    const valorUnitario = Number(row.valorUnitario);
    if (!nome || !Number.isFinite(quantidade) || quantidade <= 0) return null;
    if (!Number.isFinite(valorUnitario) || valorUnitario < 0) return null;
    itens.push({
      id: asString(row.id) || crypto.randomUUID(),
      nome,
      quantidade,
      valorUnitario
    });
  }
  return itens;
}

export function validateOrcamentoPayload(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Payload inválido.' };
  }
  const data = body as Record<string, unknown>;
  const profissionalNome = asString(data.profissionalNome);
  const profissionalWhatsapp = asString(data.profissionalWhatsapp).replace(/\D+/g, '');
  const clienteNome = asString(data.clienteNome);
  const clienteContato = asString(data.clienteContato);
  const clienteEmail = asString(data.clienteEmail).toLowerCase();
  const validade = asString(data.validade);
  const observacoes = asString(data.observacoes);
  const ownerEmail = asString(data.ownerEmail).toLowerCase() || null;
  const pixKey = asString(data.pixKey);
  const pixKeyTypeRaw = asString(data.pixKeyType).toLowerCase();
  const pixMerchantName = asString(data.pixMerchantName);
  const pixMerchantCity = asString(data.pixMerchantCity);
  const profissionalLogoDataUrl = asString(data.profissionalLogoDataUrl);
  const sourceOccupation = asString(data.sourceOccupation).slice(0, 120);
  const recruitedFromDocument = asString(data.recruitedFromDocument);
  const itens = parseItens(data.itens);

  const clienteWhatsapp = clienteContato.replace(/\D+/g, '');

  if (!profissionalNome) return { ok: false, error: 'Informe o nome do profissional ou empresa.' };
  if (profissionalWhatsapp.length < 10) {
    return { ok: false, error: 'Informe o seu WhatsApp com DDD. É nele que você recebe o aviso.' };
  }
  if (ownerEmail && !isValidEmail(ownerEmail)) {
    return { ok: false, error: 'Informe um e-mail de alertas válido, ou deixe o campo em branco.' };
  }
  if (!clienteNome) return { ok: false, error: 'Informe o nome do cliente.' };
  if (clienteWhatsapp.length < 10) {
    return { ok: false, error: 'Informe o WhatsApp do cliente com DDD. É para enviar o link a ele.' };
  }
  if (clienteEmail && !isValidEmail(clienteEmail)) {
    return { ok: false, error: 'Informe um e-mail do cliente válido, ou deixe o campo em branco.' };
  }
  if (!itens) return { ok: false, error: 'Adicione ao menos um item com quantidade e valor válidos.' };
  if (profissionalLogoDataUrl && !/^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(profissionalLogoDataUrl)) {
    return { ok: false, error: 'Logo inválido. Use PNG, JPG ou WebP.' };
  }
  if (profissionalLogoDataUrl.length > 550_000) {
    return { ok: false, error: 'O logo deve ter no máximo 400 KB.' };
  }
  if (recruitedFromDocument && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(recruitedFromDocument)) {
    return { ok: false, error: 'Origem de recrutamento inválida.' };
  }

  let pixKeyType = '';
  if (pixKey) {
    if (!ORCAMENTO_PIX_KEY_TYPES.includes(pixKeyTypeRaw as PixKeyType)) {
      return { ok: false, error: 'Informe o tipo da chave Pix (CPF, CNPJ, e-mail, telefone ou aleatória).' };
    }
    if (!pixMerchantName) {
      return { ok: false, error: 'Informe o nome do recebedor Pix.' };
    }
    if (!pixMerchantCity) {
      return { ok: false, error: 'Informe a cidade do recebedor Pix.' };
    }
    pixKeyType = pixKeyTypeRaw;
  }

  return {
    ok: true,
    data: {
      profissionalNome,
      profissionalWhatsapp,
      clienteNome,
      clienteContato: clienteWhatsapp,
      clienteEmail,
      itens,
      validade,
      observacoes,
      ownerEmail,
      profissionalLogoDataUrl,
      sourceOccupation,
      recruitedFromDocument,
      pixKey,
      pixKeyType,
      pixMerchantName: pixKey ? pixMerchantName : '',
      pixMerchantCity: pixKey ? pixMerchantCity : '',
      total: calcOrcamentoTotal(itens)
    }
  };
}

export function validateStatusPatch(body: unknown): {
  ok: boolean;
  error?: string;
  status?: OrcamentoStatus;
  feedbackCliente?: string | null;
} {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Payload inválido.' };
  const data = body as Record<string, unknown>;
  const status = asString(data.status) as OrcamentoStatus;
  if (status !== 'approved' && status !== 'declined') {
    return { ok: false, error: 'Status inválido. Use approved ou declined.' };
  }
  const feedbackCliente = asString(data.feedbackCliente) || null;
  if (status === 'declined' && !feedbackCliente) {
    return { ok: false, error: 'Descreva o motivo ou o ajuste desejado.' };
  }
  return { ok: true, status, feedbackCliente };
}
