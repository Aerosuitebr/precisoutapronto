'use client';

import { formatCurrency } from '@/lib/formatters';
import type { OrcamentoItem } from '@/lib/orcamentos/types';

export function QuotePreview({ items, name = 'Seu negócio', client = 'Seu cliente', compact = false }: {
  items: OrcamentoItem[]; name?: string; client?: string; compact?: boolean;
}) {
  const filled = items.filter((item) => item.nome.trim());
  return <section aria-label="Prévia do orçamento" className={compact ? 'px-4 pb-2 pt-3' : 'rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm'}>
    {!compact && <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Prévia · ainda não enviado</p>}
    <h2 className="mt-2 text-xl font-bold">{name || 'Seu negócio'}</h2>
    <p className="mt-1 text-sm text-slate-600">Para: {client || 'Seu cliente'}</p>
    <ul className={compact ? 'mt-2 divide-y divide-slate-100' : 'my-5 divide-y divide-slate-100'}>{filled.map((item) => <li key={item.id} className={compact ? 'flex justify-between gap-3 py-2 text-sm' : 'flex justify-between gap-4 py-3 text-sm'}><span>{item.quantidade} × {item.nome}</span><strong className="shrink-0">{formatCurrency(item.quantidade * item.valorUnitario)}</strong></li>)}</ul>
    <p className={compact ? 'flex justify-between border-t pt-2 font-bold' : 'flex justify-between border-t pt-4 font-bold'}><span>Total</span><span>{formatCurrency(filled.reduce((sum, item) => sum + item.quantidade * item.valorUnitario, 0))}</span></p>
    {!compact && <p className="mt-4 text-xs leading-5 text-slate-500">Após gerar e enviar o link, seu cliente poderá aprovar ou pedir um ajuste. Pix, prazo e condições são opcionais.</p>}
  </section>;
}
