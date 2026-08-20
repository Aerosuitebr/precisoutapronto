import type { Metadata } from 'next';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { OrcamentosApp } from '@/components/orcamentos/orcamentos-app';

export const metadata: Metadata = {
  title: 'Orçamento Pix Copia e Cola online grátis',
  description: 'Crie um orçamento com aprovação pelo celular e cobrança Pix Copia e Cola liberada após o aceite.',
  alternates: { canonical: '/orcamento-pix-copia-e-cola' }
};

export default function OrcamentoPixCopiaColaPage() {
  return <><SiteHeader /><main><section className="bg-[#031f4b] px-4 py-16 text-white"><div className="mx-auto max-w-6xl"><p className="text-sm font-bold uppercase tracking-[.18em] text-emerald-300">Orçamento + pagamento</p><h1 className="mt-3 max-w-4xl text-4xl font-extrabold sm:text-5xl">Orçamento com Pix Copia e Cola</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-blue-100">Envie o orçamento no WhatsApp. Quando o cliente aprovar, o mesmo link mostra QR Code e código Pix Copia e Cola.</p><a href="#montar" className="mt-7 inline-flex rounded-xl bg-emerald-400 px-5 py-3 font-bold text-emerald-950">Montar orçamento grátis</a></div></section><section id="montar" className="scroll-mt-20 bg-slate-50 p-3 sm:p-6"><div className="mx-auto max-w-[1600px]"><OrcamentosApp publicAccess /></div></section><section className="mx-auto max-w-4xl px-4 py-16"><h2 className="text-2xl font-bold">Pix só depois da aprovação</h2><p className="mt-3 leading-7 text-slate-600">A chave e o código de pagamento ficam protegidos enquanto o orçamento aguarda resposta. Depois do aceite, o cliente pode copiar o código ou escanear o QR Code no próprio link.</p></section></main><SiteFooter /></>;
}
