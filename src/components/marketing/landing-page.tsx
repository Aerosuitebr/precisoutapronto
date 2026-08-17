import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ClipboardList,
  FileText,
  Mail,
  Scale,
  Wallet
} from 'lucide-react';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { LiveStatsBar } from '@/components/marketing/live-stats-bar';
import { HeroOrcamentoDemo } from '@/components/marketing/hero-orcamento-demo';
import { PromoVideoPlayer } from '@/components/marketing/promo-video-section';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import { TrustSeals } from '@/components/marketing/trust-seals';
import { ToolsWatermark } from '@/components/brand/tools-watermark';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HomeConversionLink } from '@/components/analytics/home-conversion-link';

const primaryCtaClass =
  'h-12 bg-amber-400 px-6 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/30 ring-1 ring-amber-300/50 transition hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-400/40';

const OTHER_TOOLS = [
  {
    href: '/assinatura-de-email',
    title: 'Assinatura de e-mail',
    text: 'Logo, contatos e redes prontos para Gmail e Outlook.',
    icon: Mail
  },
  {
    href: '/gerador-de-proposta-comercial',
    title: 'Proposta comercial',
    text: 'Cara de agência, totais e validade claros.',
    icon: FileText
  },
  {
    href: '/gerador-de-contrato',
    title: 'Contrato',
    text: 'Modelos editáveis sem fila na papelaria.',
    icon: Scale
  },
  {
    href: '/gerador-de-recibo',
    title: 'Recibo',
    text: 'Valor por extenso e assinatura no PDF.',
    icon: Wallet
  },
  {
    href: '/gerador-de-qr-code-pix',
    title: 'Pix avulso',
    text: 'QR Code e Copia e Cola para cobrar rápido.',
    icon: ClipboardList
  }
] as const;

const PRIORITY_PROFESSIONS = [
  ['Eletricista', 'eletricista', 'Materiais, mão de obra, prazo e entrada em um link profissional.'],
  ['Pintor', 'pintor', 'Ambientes, metragem, preparação, materiais e validade sem preço solto no chat.'],
  ['Instalador de ar-condicionado', 'instalacao-ar-condicionado', 'Equipamento, tubulação, deslocamento e instalação organizados.'],
  ['Designer', 'designer', 'Escopo, revisões, cronograma e Pix com apresentação de agência.'],
  ['Manutenção residencial', 'manutencao-residencial', 'Visita, reparos, peças e mão de obra com aprovação clara.']
] as const;

function FeatureChecks({
  items,
  iconClass = 'text-emerald-600',
  textClass = 'text-slate-700'
}: {
  items: string[];
  iconClass?: string;
  textClass?: string;
}) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((item) => (
        <li key={item} className={cn('flex items-start gap-3 text-sm leading-6', textClass)}>
          <Check className={cn('mt-0.5 h-4 w-4 shrink-0', iconClass)} />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function LandingPage() {
  return (
    <div className="bg-[image:var(--rj-page-bg)]">
      <section className="relative overflow-hidden bg-[linear-gradient(145deg,#020617_0%,#0f172a_42%,#064e3b_100%)] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="pointer-events-none absolute -left-24 top-10 hidden h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl rj-animate-drift sm:block" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <ToolsWatermark className="opacity-70" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:min-h-[610px] lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:py-10">
          <div className="flex h-full max-w-xl flex-col">
            <p className="mt-0 text-xs font-bold uppercase tracking-[0.18em] text-amber-300 lg:text-sm">
              Orçamento com aprovação e Pix para prestadores
            </p>
            <h1 className="rj-display mt-3 text-[clamp(2.15rem,4vw,3.35rem)] font-extrabold leading-[1.03] tracking-tight text-white">
              A forma mais rápida de enviar orçamento, conseguir aprovação e cobrar por Pix no WhatsApp.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-100 sm:text-lg">
              Comece antes do cadastro, envie um link profissional e acompanhe orçamento, aprovação, Pix e recibo no mesmo fluxo.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild size="lg" className={cn(primaryCtaClass, 'w-full sm:w-auto')}>
                <HomeConversionLink href="/orcamento-com-pix#montar" placement="hero_primary">
                  Criar e enviar orçamento grátis
                  <ArrowRight className="h-4 w-4" />
                </HomeConversionLink>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 w-full border-white/35 bg-white/10 px-6 text-base font-bold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/20 hover:text-white sm:w-auto"
              >
                <Link href="/recursos">
                  Acessar ferramentas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <Link
              href="#como-funciona"
              className="mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-emerald-100 underline decoration-emerald-300/50 underline-offset-4 transition hover:text-white"
            >
              Ver como funciona o orçamento
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <p className="mt-3 text-sm font-semibold text-emerald-100">
              2 orçamentos grátis sem cadastro <span aria-hidden>•</span> cliente sem conta
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-100">
              {[
                'PDF profissional pronto para enviar',
                'Aprovação do cliente pelo celular',
                'Cobrança Pix no mesmo fluxo'
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-amber-300" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Acesso direto às ferramentas
              </p>
              <ul className="mt-3 flex flex-wrap gap-2.5">
                <li>
                  <Link
                    href="/orcamento-com-pix#montar"
                    className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/50 bg-teal-400/15 px-4 py-2 text-sm font-semibold text-teal-100 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-300/25 hover:text-white hover:shadow-md"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    Orçamento + Pix
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gerador-de-curriculo#ferramenta"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-amber-300/70 hover:bg-amber-300/20 hover:text-amber-100 hover:shadow-md"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Fazer currículo
                  </Link>
                </li>
                <li>
                  <Link
                    href="/calculadora-de-rescisao"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-amber-300/70 hover:bg-amber-300/20 hover:text-amber-100 hover:shadow-md"
                  >
                    <Scale className="h-3.5 w-3.5" />
                    Calcular rescisão
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pdf"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-amber-300/70 hover:bg-amber-300/20 hover:text-amber-100 hover:shadow-md"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Editar PDF
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gerador-de-recibo#ferramenta"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-amber-300/70 hover:bg-amber-300/20 hover:text-amber-100 hover:shadow-md"
                  >
                    <Wallet className="h-3.5 w-3.5" />
                    Criar recibo
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative flex h-full min-w-0 flex-col">
            <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-400/20 via-transparent to-amber-300/10 blur-2xl" />
            <HeroOrcamentoDemo className="relative h-full" />
          </div>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-20 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <ol className="grid gap-3 sm:grid-cols-4">
            {[
              ['1', 'Orçamento', 'Preencha serviço e valor.'],
              ['2', 'Aprovação', 'Cliente aprova pelo celular.'],
              ['3', 'Pix', 'Envie a cobrança na hora.'],
              ['4', 'Recibo', 'Registre o pagamento.']
            ].map(([number, title, text]) => (
              <li key={number} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                  {number}
                </span>
                <div>
                  <p className="font-bold text-slate-900">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-emerald-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <LiveStatsBar />
          <p className="mt-3 text-center text-[11px] leading-5 text-slate-500">
            Números exibidos são dados reais do produto; quando não há volume público suficiente, mostramos apenas capacidades verificáveis.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
                Feito para quem vende serviços
              </p>
              <h2 className="rj-display mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Um fluxo simples para mandar o preço e fechar o serviço.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Eletricistas, pintores, instaladores, técnicos e freelancers criam, enviam e acompanham o orçamento no mesmo lugar.
              </p>
            </div>
            <Button asChild size="lg" variant="outline" className="h-12 shrink-0 self-start sm:self-auto">
              <Link href="/recursos">
                Ver todas as ferramentas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRIORITY_PROFESSIONS.map(([profession, slug, description]) => (
              <li key={profession}>
                <HomeConversionLink
                  href={`/orcamento-para/${slug}`}
                  placement={`profession_${profession.toLowerCase().replaceAll(' ', '_')}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white hover:shadow-md"
                >
                  <p className="text-base font-extrabold text-slate-900 group-hover:text-emerald-800">{profession}</p>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                    Criar orçamento <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </HomeConversionLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <TestimonialsSection />

      <section id="demo-60s" className="scroll-mt-20 border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:py-16">
          <div>
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Em 60 segundos</p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Do orçamento ao Pix, no WhatsApp.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Veja o fluxo completo antes de criar a conta. Se o vídeo não carregar, a demo ao vivo
              acima já mostra o produto.
            </p>
          </div>
          <PromoVideoPlayer compact />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-emerald-50/70">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-emerald-800">
              Produto âncora
            </p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Cada link enviado vira uma chance de fechar.
            </h2>
            <FeatureChecks
              items={[
                'Cliente aprova ou pede ajuste no próprio celular',
                'Pix gerado na hora para mandar no WhatsApp',
                'Página limpa, sem instalar app'
              ]}
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className={cn(primaryCtaClass)} size="lg">
                <Link href="/orcamento-com-pix#montar">
                  <ClipboardList className="h-4 w-4" />
                  Criar orçamento grátis
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-emerald-300 bg-white px-6 font-bold text-emerald-900 hover:bg-emerald-50"
              >
                <Link href="/gerador-de-qr-code-pix#gerar">
                  <Wallet className="h-4 w-4" />
                  Só gerar Pix
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-[28px] border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Por que isso viraliza
            </p>
            <ul className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
              <li className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  1
                </span>
                Você manda o link para o cliente. Ele já vê o valor profissional.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  2
                </span>
                Aprovar + Pix reduz a conversa interminável de “me manda o preço”.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  3
                </span>
                O cliente sente o produto. Muitos voltam para criar o deles.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">
            Para quem é
          </p>
          <h2 className="rj-display mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Uma entrada clara por perfil.
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              {
                href: '/para/mei',
                title: 'MEI',
                text: 'Cobrar com orçamento + Pix e emitir recibo sem burocracia.'
              },
              {
                href: '/para/freelancers',
                title: 'Freelancers',
                text: 'Proposta, contrato e cobrança com cara de agência.'
              },
            ].map((persona) => (
              <li key={persona.href}>
                <Link
                  href={persona.href}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition hover:border-emerald-300 hover:bg-white hover:shadow-sm"
                >
                  <p className="text-base font-bold text-slate-900 group-hover:text-emerald-800">
                    {persona.title}
                  </p>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{persona.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                    Ver página
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-slate-500">
            Verticais secundárias:{' '}
            <Link href="/orcamento-com-pix" className="font-semibold text-sky-700 hover:underline">
              orçamento com Pix
            </Link>
            ,{' '}
            <Link href="/gerador-de-curriculo" className="font-semibold text-sky-700 hover:underline">
              currículo
            </Link>
            ,{' '}
            <Link href="/gerador-de-contrato" className="font-semibold text-sky-700 hover:underline">
              contrato
            </Link>
            ,{' '}
            <Link href="/calculadora-de-rescisao" className="font-semibold text-sky-700 hover:underline">
              calcular rescisão CLT
            </Link>
            {' e '}
            <Link href="/corretor-de-redacao-enem" className="font-semibold text-sky-700 hover:underline">
              corrigir redação ENEM
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">
            Também resolve
          </p>
          <h2 className="rj-display mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Depois do Pix, o restante do escritório.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Currículo, proposta, contrato e capa ABNT com a mesma qualidade. Documentos
            profissionais grátis (com marca Resolva Jato). Premium remove qualquer referência.
          </p>
          <ul className="mt-10 flex snap-x gap-4 overflow-x-auto pb-2 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
            {OTHER_TOOLS.map((tool) => (
              <li key={tool.href} className="w-[240px] shrink-0 snap-start sm:w-auto">
                <AuthAwareLink
                  href={tool.href}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white hover:shadow-md"
                >
                  <tool.icon className="h-5 w-5 text-sky-700" />
                  <p className="mt-3 text-base font-bold text-slate-900 group-hover:text-sky-800">
                    {tool.title}
                  </p>
                  <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-600">{tool.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-700">
                    Abrir
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </AuthAwareLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Feitas para compartilhar</p>
          <h2 className="rj-display mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Ferramentas úteis viram conversa e terminam em uma ação.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Calcule, gere um resultado visual e compartilhe no WhatsApp ou nas redes. Cada conteúdo leva de volta a uma ferramenta interativa.</p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { href: '/calculadora-de-preco-freelancer', title: 'Quanto cobrar por hora?', text: 'Custos, horas, taxas e margem em um preço de referência compartilhável.' },
              { href: '/mei-ou-clt', title: 'MEI ou CLT?', text: 'Compare cenários e transforme uma dúvida comum em simulação.' },
              { href: '/checklist-cobranca-mei', title: 'Checklist de cobrança MEI', text: 'Do orçamento ao recibo, com um roteiro que pode ser citado e compartilhado.' }
            ].map((item) => (
              <li key={item.href}><Link href={item.href} className="group block h-full rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"><p className="font-extrabold text-slate-900 group-hover:text-emerald-800">{item.title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">Abrir ferramenta <ArrowRight className="h-3.5 w-3.5" /></span></Link></li>
            ))}
          </ul>
          <p className="mt-7 text-sm text-slate-600"><Link href="/conteudos-para-compartilhar" className="font-bold text-emerald-700 hover:underline">Veja a biblioteca completa de pautas e campanhas sazonais</Link>. Publica conteúdo para MEI, imóveis ou prestadores? Use nossos <Link href="/embed" className="font-bold text-emerald-700 hover:underline">widgets e badges para parceiros</Link> ou consulte o <Link href="/imprensa" className="font-bold text-emerald-700 hover:underline">press kit</Link>.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="flex flex-col justify-center">
            <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">
              Comece grátis
            </p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Crie documentos profissionais antes de fazer cadastro.
            </h2>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
              {[
                'Orçamento, recibo, contrato, currículo e mais',
                'PDF limpo, pronto para imprimir ou enviar',
                '2 gerações sem conta e sem cartão'
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-sky-600" />
                  {item}
                </li>
              ))}
            </ul>
            <TrustSeals className="mt-8" />
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-[linear-gradient(135deg,#0f172a_0%,#064e3b_55%,#047857_100%)] p-8 text-white">
            <p className="text-sm font-semibold text-emerald-200">Resolva Jato</p>
            <h3 className="rj-display mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Escritório digital gratuito
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              Teste sem cadastro. Depois, uma conta gratuita guarda seu histórico e permite
              continuar criando orçamentos, recibos, propostas e contratos.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-100">
              {[
                'Documentos em PDF profissionais',
                'Fluxo pensado para WhatsApp',
                'Busca de recursos sempre aberta'
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-amber-300" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3">
              <Button asChild size="lg" className="w-full bg-white font-bold text-slate-950 hover:bg-emerald-50">
                <Link href="/recursos">
                  Gerar documento grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="text-center text-sm text-emerald-100">
                2 gerações grátis sem conta. Depois, crie sua conta gratuita para continuar.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
