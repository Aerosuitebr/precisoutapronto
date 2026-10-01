'use client';

import { formatCurrency } from '@/lib/formatters';
import type { OrcamentoItem } from '@/lib/orcamentos/types';

export function QuotePreview({ items, name = 'Seu negócio', client = 'Seu cliente' }: {
  items: OrcamentoItem[]; name?: string; client?: string;
}) {
  const filled = items.filter((item) => item.nome.trim());
  return <section aria-label="Prévia do orçamento" className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Prévia · ainda não enviado</p>
    <h2 className="mt-2 text-xl font-bold">{name || 'Seu negócio'}</h2>
    <p className="mt-1 text-sm text-slate-600">Para: {client || 'Seu cliente'}</p>
    <ul className="my-5 divide-y divide-slate-100">{filled.map((item) => <li key={item.id} className="flex justify-between gap-4 py-3 text-sm"><span>{item.quantidade} × {item.nome}</span><strong className="shrink-0">{formatCurrency(item.quantidade * item.valorUnitario)}</strong></li>)}</ul>
    <p className="flex justify-between border-t pt-4 font-bold"><span>Total</span><span>{formatCurrency(filled.reduce((sum, item) => sum + item.quantidade * item.valorUnitario, 0))}</span></p>
    <p className="mt-4 text-xs leading-5 text-slate-500">Após gerar e enviar o link, seu cliente poderá aprovar ou pedir um ajuste. Pix, prazo e condições são opcionais.</p>
  </section>;
}
