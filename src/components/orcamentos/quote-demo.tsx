'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QuotePreview } from './quote-preview';
import { trackEvent } from '@/lib/analytics';

export function QuoteDemo() {
  const [response, setResponse] = useState('');
  return <div className="mx-auto max-w-xl space-y-5 px-4 py-12">
    <p className="text-sm font-semibold text-emerald-800">Demonstração com dados fictícios</p>
    <h1 className="text-3xl font-black">Veja como seu cliente recebe o orçamento</h1>
    <QuotePreview name="Elétrica Silva — exemplo" client="Cliente de exemplo" items={[
      { id: 'service', nome: 'Instalação de tomadas', quantidade: 1, valorUnitario: 350 },
      { id: 'materials', nome: 'Materiais elétricos', quantidade: 1, valorUnitario: 140 }
    ]} />
    <div className="flex flex-wrap gap-3">{['Aprovar orçamento', 'Pedir ajuste'].map((label) => <button key={label} className="min-h-12 rounded-xl border border-emerald-700 px-5 font-bold text-emerald-900" onClick={() => { setResponse(label === 'Aprovar orçamento' ? 'Aprovação simulada. Em um orçamento real, o profissional recebe sua resposta e o Pix aparece se ele tiver configurado a cobrança.' : 'Pedido de ajuste simulado. Em um orçamento real, você pode informar o que precisa mudar.'); trackEvent('quote_demo_action', { action: label === 'Aprovar orçamento' ? 'approve' : 'adjust' }); }}>{label}</button>)}</div>
    <p role="status" className="text-sm leading-6 text-slate-600">{response || 'Experimente os botões. Nenhuma mensagem ou cobrança será enviada.'}</p>
    <Link href="/orcamento-para/eletricista?utm_source=demo&utm_medium=product&utm_campaign=first_quote#montar" className="inline-flex min-h-12 items-center rounded-xl bg-emerald-700 px-6 font-bold text-white" onClick={() => trackEvent('quote_demo_create_clicked')}>Usar este modelo</Link>
    <p className="text-xs text-slate-500">Os preços acima são ilustrativos. No seu orçamento, informe seus próprios valores.</p>
  </div>;
}
