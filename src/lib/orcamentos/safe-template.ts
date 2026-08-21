export interface SafeQuoteTemplateItem {
  nome: string;
  quantidade: number;
}

/** Estrutura reutilizável de um orçamento, deliberadamente sem preços ou identidade. */
export function toSafeQuoteTemplate(itens: unknown): SafeQuoteTemplateItem[] {
  if (!Array.isArray(itens)) return [];
  return itens.slice(0, 20).flatMap((raw) => {
    if (!raw || typeof raw !== 'object') return [];
    const row = raw as Record<string, unknown>;
    const nome = typeof row.nome === 'string' ? row.nome.trim().slice(0, 160) : '';
    const quantidade = Number(row.quantidade);
    if (nome.length < 2 || !Number.isFinite(quantidade) || quantidade <= 0) return [];
    return [{ nome, quantidade: Math.min(999, Math.floor(quantidade)) }];
  });
}
