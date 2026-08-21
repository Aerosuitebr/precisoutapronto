export interface QuickQuoteItem {
  nome: string;
  quantidade: number;
  valorUnitario: number;
}

const ITEM_WITH_MONEY = /^(.*?)(?:\s+|[:=–—-]\s*)(?:r\$\s*)?(\d{1,7}(?:[.,]\d{1,2})?)\s*$/i;
const QUANTITY_AT_START = /^\s*(\d{1,3})\s*(?:x|un(?:idades?)?\.?|itens?)\s+/i;

function parseMoney(raw: string) {
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw;
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 && value <= 10_000_000 ? value : 0;
}

/**
 * Converte anotações curtas copiadas do WhatsApp em itens editáveis.
 * Não usa IA, não envia texto ao servidor e ignora linhas sem preço explícito.
 */
export function parseQuickQuoteText(input: string): QuickQuoteItem[] {
  const bounded = input.slice(0, 2000);
  const chunks = bounded
    .split(/\r?\n|;|,(?=\s*[^,;\n]{1,80}\s+(?:r\$\s*)?\d)/i)
    .map((part) => part.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 20);

  return chunks.flatMap((chunk) => {
    const money = chunk.match(ITEM_WITH_MONEY);
    if (!money) return [];
    const valorUnitario = parseMoney(money[2]);
    if (!valorUnitario) return [];

    const withoutMoney = money[1].trim();
    const quantity = withoutMoney.match(QUANTITY_AT_START);
    const quantidade = quantity ? Math.max(1, Math.min(999, Number(quantity[1]))) : 1;
    const nome = withoutMoney.replace(QUANTITY_AT_START, '').trim().slice(0, 160);
    if (nome.length < 2) return [];

    return [{ nome, quantidade, valorUnitario }];
  });
}
