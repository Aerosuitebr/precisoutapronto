import type { Metadata } from 'next';
import { CheckCircle2, Quote, ShieldCheck } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { BRAND_EMAIL, BRAND_NAME } from '@/lib/brand';
import { ApprovedServiceStories } from '@/components/marketing/approved-service-stories';
import { TestimonialForm } from '@/components/marketing/testimonial-form';

export const metadata: Metadata = {
  title: 'Avaliações e depoimentos',
  description: `Leia avaliações sobre as ferramentas do ${BRAND_NAME} e compartilhe sua experiência.`,
  alternates: { canonical: '/depoimentos' }
};

const subject = encodeURIComponent('Meu depoimento — Precisou, Tá Pronto');
const body = encodeURIComponent(`Olá, equipe!\n\nNome que pode aparecer publicamente:\nProfissão:\nCidade/UF:\nFerramenta utilizada:\nComo ela ajudou na prática (2 a 5 frases):\nLink profissional público (opcional):\n\nAUTORIZAÇÃO: autorizo a publicação deste depoimento, do nome, da profissão e da cidade/UF nos canais do Precisou, Tá Pronto. Confirmo que o relato descreve minha experiência real. Sei que posso pedir correção ou remoção pelo mesmo e-mail.\n\nData:`);

export default function TestimonialsIntakePage() {
  return <><SiteHeader /><main className="bg-slate-50"><header className="border-b border-sky-200 bg-white"><div className="mx-auto max-w-4xl px-4 py-16 sm:px-6"><Quote className="h-8 w-8 text-sky-600" /><p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Histórias reais do Brasil</p><h1 className="precisoutapronto-display mt-3 text-4xl font-extrabold text-slate-950 sm:text-5xl">Avaliações e depoimentos</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Veja o que dizem sobre as ferramentas e conte o que você resolveu na prática.</p></div></header>
  <ApprovedServiceStories full />
  <section id="enviar-depoimento" aria-labelledby="enviar-depoimento-title" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-14 sm:px-6"><h2 id="enviar-depoimento-title" className="mb-6 text-3xl font-extrabold text-slate-950">Conte sua experiência</h2><div className="mb-8 grid gap-6 md:grid-cols-2"><div><h3 className="text-xl font-extrabold text-slate-950">O que contar</h3><ul className="mt-5 space-y-4 text-sm leading-6 text-slate-700"><li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />Qual tarefa você precisava resolver.</li><li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />Qual ferramenta usou e o que aconteceu depois.</li><li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />Um detalhe concreto: tempo poupado, documento enviado ou cliente atendido.</li></ul></div><aside className="rounded-3xl border border-amber-200 bg-amber-50 p-6"><ShieldCheck className="h-6 w-6 text-amber-700" /><h3 className="mt-3 text-lg font-extrabold text-slate-950">Publicação responsável</h3><p className="mt-3 text-sm leading-6 text-slate-700">A equipe revisa a origem e a autorização antes de publicar. E-mail e outros dados de contato não aparecem.</p><a href={`mailto:${BRAND_EMAIL}?subject=${subject}&body=${body}`} className="mt-3 inline-block text-sm font-bold text-amber-800 underline">Prefiro enviar por e-mail</a></aside></div><TestimonialForm /></section></main><SiteFooter /></>;
}
