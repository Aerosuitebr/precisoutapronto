'use client';

import { useRef, useState } from 'react';
import { ArrowRight, Calculator, FileText, Link2, Receipt, Sparkles } from 'lucide-react';
import { LandingConversionLink } from '@/components/analytics/landing-conversion-link';
import { trackEvent } from '@/lib/analytics';

const intents = [
  { id: 'orcamento', label: 'Orçamento com Pix', icon: FileText, href: '/orcamento-com-pix#montar', action: 'Criar meu primeiro documento grátis', note: 'Sem cadastro para começar · Pix opcional', title: 'Orçamento digital', subtitle: 'Elétrica Silva · ORC-018', rows: [['Instalação de tomadas', 'R$ 350'], ['Material elétrico', 'R$ 140']], totalLabel: 'Total do serviço', total: 'R$ 490', detail: 'O cliente confere os itens e responde pelo link.', badge: 'Pronto para aprovação' },
  { id: 'recibo', label: 'Recibo de Pix', icon: Receipt, href: '/gerador-de-recibo#ferramenta', action: 'Criar meu primeiro documento grátis', note: 'PDF grátis com a marca da plataforma · Sem cadastro', title: 'Recibo de entrada', subtitle: 'Elétrica Silva · Cliente Exemplo', rows: [['Serviço combinado', 'R$ 490'], ['Entrada recebida via Pix', 'R$ 150']], totalLabel: 'Saldo pendente', total: 'R$ 340', detail: 'O recibo registra somente o valor recebido. Confira o crédito no banco.', badge: 'PDF para enviar' },
  { id: 'calculos', label: 'Cálculos Trabalhistas', icon: Calculator, href: '/calculadora-de-ferias#ferramenta', action: 'Calcular gratuitamente', note: 'Estimativas para conferência · Escolha o cálculo abaixo', title: 'Prévia de férias', subtitle: 'Exemplo: 30 dias · salário de R$ 3.000', rows: [['Remuneração de férias', 'R$ 3.000'], ['Adicional de um terço', 'R$ 1.000']], totalLabel: 'Total bruto ilustrativo', total: 'R$ 4.000', detail: 'Exemplo sem descontos e sem abono. O resultado real depende dos dados informados.', badge: 'Férias, rescisão e 13º' },
  { id: 'link', label: 'Gerador de Link', icon: Link2, href: '/gerador-de-link-whatsapp#ferramenta', action: 'Criar meu link grátis', note: 'Sem cadastro · Nenhuma mensagem é enviada automaticamente', title: 'Seu link de WhatsApp', subtitle: 'Contato profissional em um toque', rows: [['Destino', 'Seu WhatsApp'], ['Mensagem inicial', 'Personalizada']], totalLabel: 'Pronto para compartilhar', total: 'wa.me/…', detail: 'Informe seu número e uma mensagem. Copie o link para o perfil, site ou redes sociais.', badge: 'Link com mensagem' }
] as const;

export function HomeIntentHero() {
  const [selected, setSelected] = useState(0);
  const [calculation, setCalculation] = useState('/calculadora-de-ferias#ferramenta');
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const intent = intents[selected];
  function select(index: number) {
    setSelected(index);
    trackEvent('home_intent_selected', { intent: intents[index].id });
  }
  return <section className="border-b border-slate-200 bg-[radial-gradient(ellipse_at_top_right,_#dbeafe,_#f8faff_60%)]">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:px-8">
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-700"><Sparkles className="h-4 w-4" aria-hidden="true" /> Ferramentas para o seu dia a dia</p>
        <h1 className="precisoutapronto-display mt-5 text-[clamp(2.8rem,5.6vw,5.8rem)] font-black leading-[.98] tracking-[-.06em]">Orçamento enviado.<br /><span className="text-[#155eef]">Serviço fechado.</span></h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Crie orçamentos, emita recibos de Pix e faça cálculos trabalhistas direto pelo celular, sem complicação.</p>
        <h2 id="home-intent-label" className="mt-7 text-sm font-bold text-slate-900">O que você precisa fazer hoje?</h2>
        <div role="tablist" aria-labelledby="home-intent-label" className="mt-3 grid grid-cols-2 gap-2">
          {intents.map((item, index) => <button key={item.id} ref={node => { tabs.current[index] = node; }} id={`intent-tab-${item.id}`} role="tab" type="button" aria-selected={index === selected} aria-controls={`intent-panel-${item.id}`} tabIndex={index === selected ? 0 : -1} onClick={() => select(index)} onKeyDown={event => {
            let next = index;
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % intents.length;
            else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + intents.length - 1) % intents.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = intents.length - 1;
            else return;
            event.preventDefault(); select(next); tabs.current[next]?.focus();
          }} className={`flex min-h-14 items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${index === selected ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400'}`}><item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />{item.label}</button>)}
        </div>
        {intent.id === 'calculos' ? <div className="mt-4"><label htmlFor="home-calculation" className="text-sm font-bold">Qual cálculo você precisa?</label><select id="home-calculation" value={calculation} onChange={event => setCalculation(event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3"><option value="/calculadora-de-ferias#ferramenta">Férias</option><option value="/calculadora-de-rescisao#ferramenta">Rescisão trabalhista</option><option value="/calculadora-de-decimo-terceiro#ferramenta">13º salário</option></select></div> : null}
        <LandingConversionLink href={intent.id === 'calculos' ? calculation : intent.href} landingPath="/" placement="hero_primary" className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#155eef] px-5 py-3 text-center font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-800 sm:w-auto">{intent.action}<ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></LandingConversionLink>
        <p className="mt-3 text-xs leading-6 text-slate-600" aria-live="polite">{intent.note}</p>
      </div>
      <div>
        {intents.map((item, index) => <div key={item.id} id={`intent-panel-${item.id}`} role="tabpanel" aria-labelledby={`intent-tab-${item.id}`} hidden={selected !== index} tabIndex={0} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-25px_rgba(16,24,40,.25)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Prévia ilustrativa · dados fictícios</p>
          <item.icon className="mt-6 h-9 w-9 text-blue-600" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-slate-950">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{item.subtitle}</p>
          <dl className="my-7 space-y-4">{item.rows.map(([name, value]) => <div key={name} className="flex flex-wrap justify-between gap-2 text-sm"><dt className="text-slate-600">{name}</dt><dd className="font-bold">{value}</dd></div>)}</dl>
          <div className="border-t border-slate-200 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.totalLabel}</p><p className="mt-2 break-words text-4xl font-black tracking-tight text-slate-950">{item.total}</p></div>
          <p className="mt-5 inline-flex rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">{item.badge}</p><p className="mt-4 text-sm leading-6 text-slate-600">{item.detail}</p>
        </div>)}
      </div>
    </div>
  </section>;
}
