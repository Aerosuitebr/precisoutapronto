import type { Metadata } from 'next';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { JuridicoLivePreview } from '@/app/documentos-juridicos-online/juridico-live-preview';

export const metadata: Metadata = {
  title: 'Declaração de residência online grátis',
  description: 'Preencha uma declaração de residência online, revise os dados e prepare o documento para assinatura.',
  alternates: { canonical: '/declaracao-de-residencia' }
};

export default function DeclaracaoResidenciaPage() {
  return <><SiteHeader /><main><section className="bg-slate-950 px-4 py-16 text-white"><div className="mx-auto max-w-5xl"><p className="text-sm font-bold uppercase tracking-[.18em] text-sky-300">Documento pessoal</p><h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Declaração de residência online</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">Escolha o modelo, informe declarante e endereço e revise o texto antes de baixar para assinatura.</p><a href="#ferramenta" className="mt-7 inline-flex rounded-xl bg-sky-500 px-5 py-3 font-bold text-white">Criar declaração grátis</a></div></section><section id="ferramenta" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14"><JuridicoLivePreview initialTemplateId="declaracao-residencia" /></section><section className="mx-auto max-w-4xl px-4 pb-16"><h2 className="text-2xl font-bold">Quando usar a declaração de residência?</h2><p className="mt-3 leading-7 text-slate-600">Ela registra, sob responsabilidade do declarante, o endereço onde reside quando outro comprovante não está em seu nome. Confira as exigências da instituição que receberá o documento e assine a versão final.</p></section></main><SiteFooter /></>;
}
