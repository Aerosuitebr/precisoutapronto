import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Share2 } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { CopyContentScriptButton } from '@/components/marketing/copy-content-script-button';

const PATH = '/conteudos-para-compartilhar';

export const metadata: Metadata = {
  title: { absolute: 'Ferramentas e conteúdos para compartilhar | Precisou, Tá Pronto' },
  description: 'Simuladores, checklists e modelos úteis para compartilhar no WhatsApp, Instagram, TikTok e LinkedIn.',
  alternates: { canonical: PATH },
  openGraph: { title: 'Conteúdos úteis que terminam em uma ferramenta', description: 'Calcule, gere, compartilhe e leve a pessoa para uma ação prática.', url: PATH }
};

const evergreen = [
  { title: 'Quanto cobrar por hora?', format: 'Card de resultado', href: '/calculadora-de-preco-freelancer?utm_source=content_hub&utm_medium=share&utm_campaign=quanto_cobrar', text: 'Transforme custos, horas e margem em um preço de referência.' },
  { title: 'Seu orçamento está dando prejuízo?', format: 'Diagnóstico', href: '/calculadora-de-preco-freelancer?utm_source=content_hub&utm_medium=share&utm_campaign=diagnostico_preco', text: 'Compare preço atual com o mínimo necessário para cobrir o trabalho.' },
  { title: 'WhatsApp solto × orçamento profissional', format: 'Antes e depois', href: '/orcamento-com-pix?utm_source=content_hub&utm_medium=share&utm_campaign=antes_depois_orcamento', text: 'Mostre a diferença e termine na demonstração interativa.' },
  { title: 'MEI ou CLT?', format: 'Simulador', href: '/mei-ou-clt?utm_source=content_hub&utm_medium=share&utm_campaign=mei_ou_clt', text: 'Uma comparação prática para quem está escolhendo como trabalhar.' },
  { title: 'Checklist de cobrança para MEI', format: 'Checklist', href: '/checklist-cobranca-mei?utm_source=content_hub&utm_medium=share&utm_campaign=checklist_mei', text: 'Orçamento, aprovação, Pix, contrato e recibo em uma sequência curta.' }
  ,{ title: 'Seu e-mail parece profissional?', format: 'Antes e depois', href: '/assinatura-de-email?utm_source=content_hub&utm_medium=share&utm_campaign=assinatura_email', text: 'Monte uma assinatura com logo, cargo, WhatsApp e redes e veja o resultado ao vivo.' }
] as const;

const seasonal = [
  { title: 'Reformas de fim de ano', href: '/orcamento-para/pintor?utm_source=content_hub&utm_medium=seasonal&utm_campaign=reformas_fim_ano', text: 'Modelo para pintura e preparação de ambientes.' },
  { title: 'Calor e instalação de ar-condicionado', href: '/orcamento-para/instalacao-ar-condicionado?utm_source=content_hub&utm_medium=seasonal&utm_campaign=verao_ar', text: 'Instalação, tubulação e serviços adicionais separados.' },
  { title: 'Volta às aulas e primeiro emprego', href: '/gerador-de-curriculo?utm_source=content_hub&utm_medium=seasonal&utm_campaign=volta_as_aulas', text: 'Currículo em PDF para quem está entrando no mercado.' },
  { title: 'Declaração anual e organização do MEI', href: '/checklist-cobranca-mei?utm_source=content_hub&utm_medium=seasonal&utm_campaign=declaracao_mei', text: 'Organize comprovantes, cobranças e recibos antes do período fiscal.' },
  { title: 'Datas comemorativas para designers', href: '/orcamento-para/designer?utm_source=content_hub&utm_medium=seasonal&utm_campaign=datas_comemorativas', text: 'Escopo, quantidade de peças e revisões já estruturados.' }
] as const;

const videoScripts = [
  { title: 'Quanto recebe se for demitido hoje?', hook: 'Se você ganha R$ 3.500 e for demitido hoje, sabe quanto recebe?', body: 'Mostre salário, datas e modalidade entrando na calculadora. Revele o total e duas verbas que mais surpreendem.', href: '/calculadora-de-rescisao?utm_source=content_hub&utm_medium=video_script&utm_campaign=rescisao_3500', cta: 'Calcule o seu no Precisou, Tá Pronto.', campaign: 'rescisao_3500' },
  { title: 'Quanto cobrar para ganhar R$ 8 mil?', hook: 'Freelancer: faturar R$ 8 mil não significa ganhar R$ 8 mil.', body: 'Preencha custos, horas faturáveis e margem. Mostre o preço mínimo por hora no Resultado Pronto.', href: '/calculadora-de-preco-freelancer?utm_source=content_hub&utm_medium=video_script&utm_campaign=freela_8k', cta: 'Descubra seu preço mínimo.', campaign: 'freela_8k' },
  { title: 'Orçamento profissional no WhatsApp', hook: 'Seu cliente pediu preço no WhatsApp? Não mande só um número.', body: 'Mostre itens, validade, aprovação no celular e Pix no mesmo fluxo.', href: '/orcamento-com-pix?utm_source=content_hub&utm_medium=video_script&utm_campaign=orcamento_whatsapp', cta: 'Monte o orçamento grátis.', campaign: 'orcamento_whatsapp' },
  { title: 'MEI ou CLT no seu cenário', hook: 'R$ 6 mil como PJ vale mais que R$ 4 mil CLT?', body: 'Compare remuneração, benefícios, impostos e custos. Mostre a equivalência mensal do resultado.', href: '/mei-ou-clt?utm_source=content_hub&utm_medium=video_script&utm_campaign=mei_clt_6k', cta: 'Compare o seu cenário.', campaign: 'mei_clt_6k' },
  { title: 'PDF privado no navegador', hook: 'Você envia documentos pessoais para qualquer site de PDF?', body: 'Abra um PDF, reorganize e remova uma página. Destaque que o arquivo não sai do dispositivo.', href: '/pdf?utm_source=content_hub&utm_medium=video_script&utm_campaign=pdf_privado', cta: 'Use o PDF Pronto sem upload.', campaign: 'pdf_privado' }
] as const;

function Cards({ items }: { items: ReadonlyArray<{ title: string; href: string; text: string; format?: string }> }) {
  return <ul className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map((item) => <li key={item.title}><Link href={item.href} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">{'format' in item && item.format ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{item.format}</p> : null}<h2 className="mt-2 text-lg font-extrabold text-slate-950 group-hover:text-emerald-800">{item.title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{item.text}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">Abrir experiência <ArrowRight className="h-4 w-4" /></span></Link></li>)}</ul>;
}

export default function ShareableContentPage() {
  return <><SiteHeader /><main className="bg-slate-50"><header className="border-b border-slate-200 bg-[linear-gradient(145deg,#020617,#0f172a_50%,#064e3b)] text-white"><div className="mx-auto max-w-6xl px-4 py-16 sm:px-6"><Share2 className="h-7 w-7 text-amber-300" /><p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Biblioteca de distribuição</p><h1 className="precisoutapronto-display mt-3 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">Conteúdos úteis que terminam em uma ferramenta.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">Use estes ângulos em WhatsApp, Instagram, TikTok ou LinkedIn. O destino sempre permite calcular, gerar ou criar algo.</p></div></header><section><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Pautas permanentes</p><Cards items={evergreen} /></div></section><section className="border-y border-slate-200 bg-slate-950 text-white"><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-300">Roteiros para TikTok e Reels</p><h2 className="precisoutapronto-display mt-3 text-3xl font-extrabold">Mostre o problema, gere o resultado e leve para a ferramenta.</h2><ul className="mt-7 grid gap-4 md:grid-cols-2">{videoScripts.map((item) => { const script = `${item.hook}\n\n${item.body}\n\n${item.cta}\n${item.href}`; return <li key={item.campaign} className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-300">Gancho</p><h3 className="mt-2 text-lg font-extrabold">{item.title}</h3><p className="mt-3 text-sm font-semibold leading-6 text-white">“{item.hook}”</p><p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p><div className="mt-5 flex flex-wrap items-center gap-3"><CopyContentScriptButton script={script} campaign={item.campaign} /><Link href={item.href} className="inline-flex items-center gap-1 text-sm font-bold text-amber-300">Abrir ferramenta <ArrowRight className="h-4 w-4" /></Link></div></li>; })}</ul></div></section><section className="border-t border-slate-200 bg-white"><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-sky-700"><CalendarDays className="h-4 w-4" />Calendário sazonal</p><Cards items={seasonal} /><p className="mt-8 text-sm text-slate-600">Para publicar em site ou portal, veja também os <Link href="/embed" className="font-bold text-emerald-700 hover:underline">blocos de parceria com UTM</Link>.</p></div></section></main><SiteFooter /></>;
}
