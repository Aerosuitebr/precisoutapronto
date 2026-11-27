import Link from 'next/link';
import { Check, CheckCircle2, FileCheck2, MessageCircle } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { LandingConversionLink } from '@/components/analytics/landing-conversion-link';
import { HomeIntentHero, HomeOtherTools } from '@/components/marketing/home-intent-hero';
import { ProfessionalStartGuide } from '@/components/marketing/professional-start-guide';
import { HomeQuoteStories } from '@/components/marketing/home-quote-stories';
import { QuoteDemo } from '@/components/orcamentos/quote-demo';
import { PLANS } from '@/lib/plans';
import { getApprovedStories } from '@/lib/testimonials/approved-stories';
import { getPublicStats } from '@/lib/public-stats';

const steps = [
  { title: 'Monte', text: 'Reúna itens, valores e prazo em um orçamento.', icon: FileCheck2 },
  { title: 'Envie', text: 'Compartilhe o link na conversa com o cliente.', icon: MessageCircle },
  { title: 'Receba', text: 'O cliente aprova pelo link e paga por Pix, se você incluir a cobrança.', icon: CheckCircle2 }
];

const paymentTimeline = [
  'Cliente aprovou',
  'Entrada de R$ 150 recebida',
  'Recibo parcial emitido',
  'Saldo de R$ 340 recebido',
  'Recibo final emitido'
];

const comparison = [
  { title: 'Pelo chat, manualmente', items: ['Detalhes espalhados em várias mensagens', 'Soma dos itens na calculadora', 'Aprovação e chave Pix em mensagens separadas'] },
  { title: 'Com Precisou, Tá Pronto', items: ['Itens, valores e prazo em um orçamento', 'Total calculado ao preencher os itens', 'Aprovação e Pix opcional pelo mesmo link'] }
];

const plans = [
  { ...PLANS.gratis, details: 'Crie orçamentos e recibos com a marca da plataforma. Com uma conta grátis, você pode salvar o histórico.' },
  { ...PLANS.premium, details: 'Remova a marca da plataforma dos documentos e das mensagens. Pagamento avulso, sem renovação automática.' }
];

const faq = [
  { question: 'Preciso criar uma conta para fazer um orçamento?', answer: 'Você pode montar e enviar seu primeiro orçamento sem cadastro. Crie uma conta grátis se quiser salvar o histórico.' },
  { question: 'Como o cliente aprova pelo WhatsApp?', answer: 'Você envia um link na conversa. O cliente abre a página do orçamento no navegador e pode aprovar ou pedir ajustes pelo celular.' },
  { question: 'É obrigatório incluir Pix?', answer: 'O Pix é opcional. Se você configurar a cobrança, o cliente verá os dados de pagamento após aprovar. Confira o recebimento no seu banco antes de emitir o recibo.' },
  { question: 'O PDF grátis tem a marca da plataforma?', answer: 'O PDF grátis inclui a marca Precisou, Tá Pronto. O Premium remove a marca durante a vigência do plano.' }
];

export async function LandingPage() {
  const [stories, stats] = await Promise.all([
    getApprovedStories(['orcamento'], 3),
    getPublicStats()
  ]);

  return (
    <div className="bg-white text-[#101828]">
      <header className="sticky top-8 z-50 border-b border-blue-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link href="/" className="min-w-0" aria-label="Precisou, Tá Pronto, página inicial">
            <Logo variant="marketing" className="h-14 max-w-[165px] sm:h-16 sm:max-w-[230px]" />
          </Link>
          <nav aria-label="Navegação principal" className="flex items-center gap-3 text-sm font-bold text-slate-700 sm:gap-6">
            <a href="#como-funciona" className="hidden hover:text-blue-700 md:inline">Como funciona</a>
            <a href="#para-profissionais" className="hidden hover:text-blue-700 md:inline">Modelos</a>
            <a href="#ferramentas" className="hidden hover:text-blue-700 lg:inline">Outras ferramentas</a>
            <a href="#planos" className="inline-flex min-h-11 items-center hover:text-blue-700">Planos</a>
            <Link href="/login" className="inline-flex min-h-11 items-center hover:text-blue-700">Entrar</Link>
          </nav>
        </div>
      </header>

      <main>
        <HomeIntentHero hasStories={stories.length > 0} stats={stats} />
        <section id="como-funciona" aria-labelledby="workflow-title" className="scroll-mt-32 py-10 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="workflow-title" className="precisoutapronto-display text-3xl font-black tracking-tight sm:text-4xl">Da conversa ao pagamento</h2>
            <p className="mt-2 text-sm text-slate-600">Exemplo de uma instalação de tomadas com pagamento em duas etapas.</p>
            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4">
              <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
              <div>
                <p className="text-sm font-bold text-emerald-900">Pedido pelo WhatsApp</p>
                <p className="mt-1 text-slate-800">“Oi! Quanto fica para instalar as tomadas, incluindo o material?”</p>
              </div>
            </div>
            <ol className="mt-3 grid gap-3 md:grid-cols-3">
              {steps.map(({ title, text, icon: Icon }, index) => (
                <li key={title} className="flex flex-col rounded-2xl border border-blue-100 bg-[#f8faff] p-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    <Icon className="h-5 w-5 text-blue-700" aria-hidden /> {index + 1}. {title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{text}</p>
                  <div className="mt-3 rounded-xl border border-blue-100 bg-white p-3 text-sm">
                    {index === 0 && <p className="flex flex-wrap justify-between gap-2"><span>Serviço + materiais</span><strong>R$ 490,00</strong></p>}
                    {index === 1 && <p>“Segue o <a href="#exemplos" className="font-bold text-blue-800 underline">link do orçamento</a> para você conferir.”</p>}
                    {index === 2 && <p className="flex items-center gap-2 font-bold text-blue-800"><Check className="h-4 w-4 shrink-0" aria-hidden /> Orçamento aprovado</p>}
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 p-5 text-white">
              <h3 className="text-lg font-bold">Recebeu entrada?</h3>
              <ol className="mt-3 grid border-l border-blue-300/50 md:grid-cols-5 md:border-l-0 md:border-t">
                {paymentTimeline.map(item => (
                  <li key={item} className="relative py-1.5 pl-4 text-sm text-blue-50 before:absolute before:-left-1 before:top-3 before:h-2 before:w-2 before:rounded-full before:bg-blue-300 md:py-0 md:pl-0 md:pr-3 md:pt-4 md:before:left-0 md:before:top-[-4px]">
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <ProfessionalStartGuide />

        <section id="exemplos" aria-labelledby="examples-title" className="scroll-mt-32 py-10 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-start lg:px-8">
            <div>
              <h2 id="examples-title" className="precisoutapronto-display text-3xl font-black tracking-tight sm:text-4xl">Veja o que seu cliente recebe</h2>
              <p className="mt-3 max-w-lg leading-7 text-slate-600">O cliente abre o link que você envia pelo WhatsApp. Experimente aprovar ou pedir um ajuste na demonstração.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {comparison.map(({ title, items }) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-bold">{title}</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-6 text-slate-700">
                      {items.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <QuoteDemo embedded />
          </div>
        </section>

        <HomeQuoteStories stories={stories} />

        <section id="planos" aria-labelledby="plans-title" className="scroll-mt-32 border-y border-blue-100 bg-[#f8faff] py-10 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="plans-title" className="precisoutapronto-display text-3xl font-black tracking-tight sm:text-4xl">Compare os planos</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {plans.map(plan => (
                <article key={plan.id} className="rounded-2xl border border-blue-100 bg-white p-5">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-3 font-semibold"><strong className="text-2xl">{plan.priceLabel}</strong> {plan.period.trim()}</p>
                  <p className="mt-2 font-bold text-blue-800">Uso ilimitado das ferramentas</p>
                  <p className="mt-3 leading-7 text-slate-600">{plan.details}</p>
                </article>
              ))}
            </div>
            <Link href="/planos" className="mt-4 inline-flex min-h-11 items-center font-semibold text-blue-800 hover:underline">Ver detalhes dos planos</Link>
          </div>
        </section>

        <HomeOtherTools />

        <section id="faq" aria-labelledby="faq-title" className="scroll-mt-32 py-10 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="faq-title" className="precisoutapronto-display text-3xl font-black tracking-tight sm:text-4xl">Perguntas frequentes</h2>
            <div className="mt-5 max-w-4xl divide-y divide-slate-200 border-y border-slate-200">
              {faq.map(({ question, answer }) => (
                <details key={question} className="py-2">
                  <summary className="min-h-11 cursor-pointer py-2.5 font-bold">{question}</summary>
                  <p className="pb-2 leading-7 text-slate-600">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="start-title" className="border-t border-blue-100 bg-[#f8faff] px-4 py-10 text-center sm:py-12">
          <h2 id="start-title" className="precisoutapronto-display text-3xl font-black tracking-tight">Seu próximo orçamento pode sair agora</h2>
          <p className="mt-2 text-slate-600">Monte o orçamento, envie pelo WhatsApp e receba a aprovação pelo link.</p>
          <LandingConversionLink href="/orcamento-com-pix#montar" landingPath="/" placement="footer_primary" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#155eef] px-5 py-3 font-bold text-white hover:bg-blue-800">
            Montar meu orçamento
          </LandingConversionLink>
        </section>
      </main>
    </div>
  );
}
