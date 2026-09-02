import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { PROFESSION_LANDINGS } from '@/lib/orcamentos/profession-presets';
import { BRAND_AUTHOR_PATH, BRAND_SITE } from '@/lib/brand';

const PATH = '/pesquisa/orcamentos-prestadores';
const reviewedAt = '2026-09-02';
const withExamples = PROFESSION_LANDINGS.filter((item) => item.example).length;
const withPriceGuides = PROFESSION_LANDINGS.filter((item) => item.priceGuide).length;
const checklistItems = PROFESSION_LANDINGS.reduce((total, item) => total + item.checklist.length, 0);

export const metadata: Metadata = {
  title: { absolute: 'O que não pode faltar em um orçamento de serviço: análise dos modelos | Precisou, Tá Pronto' },
  description: `Análise editorial de ${PROFESSION_LANDINGS.length} modelos de orçamento para prestadores: escopo, materiais, prazo, pagamento, validade e aprovação.`,
  alternates: { canonical: PATH },
  openGraph: { title: 'Análise dos modelos de orçamento para prestadores', description: 'Dados e metodologia do inventário editorial do Precisou, Tá Pronto.', url: PATH, type: 'article' }
};

const findings = [
  { title: 'Escopo observável', body: 'Quantidade, ambiente, metragem, etapa ou entrega reduzem interpretações diferentes sobre o que está incluído.' },
  { title: 'Materiais separados', body: 'Marca, quantidade, fornecimento e substituições precisam ficar distinguíveis da mão de obra.' },
  { title: 'Prazo e validade', body: 'Prazo de execução e validade comercial respondem perguntas diferentes e devem aparecer separadamente.' },
  { title: 'Pagamento por marco', body: 'Entrada, parcelas e saldo ficam mais claros quando associados a uma entrega verificável.' },
  { title: 'Mudança de escopo', body: 'Itens descobertos após vistoria devem virar complemento aprovado, não uma autorização genérica.' },
  { title: 'Aceite rastreável', body: 'Um documento compartilhável e uma resposta explícita preservam melhor o combinado que um preço solto no chat.' }
] as const;

export default function QuoteResearchPage() {
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: 'Inventário editorial de modelos de orçamento para prestadores', description: `Análise de ${PROFESSION_LANDINGS.length} modelos publicados pelo Precisou, Tá Pronto.`, url: `${BRAND_SITE}${PATH}`, dateModified: reviewedAt, creator: { '@type': 'Organization', name: 'Precisou, Tá Pronto', url: BRAND_SITE }, variableMeasured: ['escopo', 'materiais', 'prazo', 'pagamento', 'validade', 'aprovação'] },
    { '@type': 'Article', headline: 'O que não pode faltar em um orçamento de serviço', datePublished: reviewedAt, dateModified: reviewedAt, author: { '@type': 'Organization', name: 'Equipe editorial Precisou, Tá Pronto', url: `${BRAND_SITE}${BRAND_AUTHOR_PATH}` }, mainEntityOfPage: `${BRAND_SITE}${PATH}` }
  ] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><SiteHeader /><main><article><header className="border-b border-slate-200 bg-slate-950 text-white"><div className="mx-auto max-w-5xl px-4 py-16 sm:px-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">Pesquisa editorial aberta</p><h1 className="precisoutapronto-display mt-3 max-w-4xl text-4xl font-extrabold sm:text-5xl">O que não pode faltar em um orçamento de serviço</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">Analisamos o inventário de {PROFESSION_LANDINGS.length} modelos para identificar a estrutura que continua importante quando a profissão, o preço e o tipo de serviço mudam.</p><p className="mt-4 text-sm text-slate-400">Publicado e revisado em <time dateTime={reviewedAt}>2 de setembro de 2026</time>.</p></div></header><div className="mx-auto max-w-5xl px-4 py-14 sm:px-6"><section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-5"><strong className="text-3xl text-emerald-950">{PROFESSION_LANDINGS.length}</strong><p className="mt-1 text-sm text-emerald-900">modelos no inventário</p></div><div className="rounded-2xl bg-sky-50 p-5"><strong className="text-3xl text-sky-950">{checklistItems}</strong><p className="mt-1 text-sm text-sky-900">itens de checklist analisados</p></div><div className="rounded-2xl bg-amber-50 p-5"><strong className="text-3xl text-amber-950">{withExamples + withPriceGuides}</strong><p className="mt-1 text-sm text-amber-900">blocos aprofundados de exemplo ou preço</p></div></section><section className="mt-14"><h2 className="precisoutapronto-display text-3xl font-extrabold text-slate-950">Seis decisões recorrentes</h2><div className="mt-7 grid gap-4 sm:grid-cols-2">{findings.map((finding) => <div key={finding.title} className="rounded-2xl border border-slate-200 p-5"><h3 className="flex gap-2 font-extrabold text-slate-950"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />{finding.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{finding.body}</p></div>)}</div></section><section className="mt-14 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8"><h2 className="precisoutapronto-display text-2xl font-extrabold text-slate-950">Metodologia e limites</h2><p className="mt-4 leading-7 text-slate-700">A unidade analisada é cada modelo ativo no catálogo do produto em {reviewedAt}. As contagens vêm do código publicado e são recalculadas durante o build. Esta é uma análise do inventário editorial, não uma pesquisa com usuários e não demonstra aumento de aprovação ou faturamento.</p><p className="mt-4 leading-7 text-slate-700">Os modelos foram revisados para identificar campos e decisões recorrentes. Preços aparecem apenas onde há guia específico e são referências, nunca tabela oficial.</p><p className="mt-4 text-sm text-slate-600">Responsável: <Link href={BRAND_AUTHOR_PATH} className="font-bold text-emerald-700">Equipe editorial</Link> · <Link href="/criterios-editoriais" className="font-bold text-emerald-700">critérios editoriais</Link> · cite a URL canônica e a data de revisão.</p></section><section className="mt-14 border-t border-slate-200 pt-10"><h2 className="precisoutapronto-display text-2xl font-extrabold text-slate-950">Aplique a estrutura</h2><div className="mt-5 flex flex-wrap gap-3"><Link href="/modelos-de-orcamento" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Explorar os modelos <ArrowRight className="h-4 w-4" /></Link><Link href="/orcamento-com-pix" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800">Criar orçamento grátis</Link></div></section></div></article></main><SiteFooter /></>;
}
