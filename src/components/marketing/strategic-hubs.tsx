import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, FileText, PenLine, Scale, Wallet } from 'lucide-react';
import { HomeConversionLink } from '@/components/analytics/home-conversion-link';

const HUBS = [
  {
    href: '/recibos',
    title: 'Recibos para cada situação',
    description: 'Pagamento, serviço, MEI, autônomo, Pix, aluguel, assinatura e PDF.'
  },
  {
    href: '/rescisao',
    title: 'Rescisão trabalhista',
    description: 'Cálculo, aviso-prévio, FGTS, férias e dúvidas por tipo de desligamento.'
  },
  {
    href: '/redacao-enem',
    title: 'Redação ENEM',
    description: 'Correção, competências, repertório, estrutura e preparação para a prova.'
  },
  {
    href: '/pix',
    title: 'Ferramentas Pix',
    description: 'QR Code, Copia e Cola, orçamento, cobrança e recibo de pagamento.'
  },
  {
    href: '/pdf',
    title: 'Ferramentas para PDF',
    description: 'Juntar, dividir, comprimir, editar e organizar documentos no navegador.'
  }
] as const;

const HERO_PRODUCTS = [
  { href: '/calculadora-de-rescisao', title: 'Calcular rescisão', description: 'Saldo, aviso, férias, 13º e FGTS por modalidade, com exemplo 2026.', action: 'Calcular agora', icon: Scale, placement: 'hero_product_severance' },
  { href: '/corretor-de-redacao-enem', title: 'Corrigir redação ENEM', description: 'Nota estimada por competência C1 a C5, sem cadastro nas duas primeiras análises.', action: 'Analisar redação', icon: PenLine, placement: 'hero_product_essay' },
  { href: '/gerador-de-recibo#ferramenta', title: 'Criar recibo', description: 'Valor por extenso, assinatura e PDF pronto para enviar.', action: 'Emitir recibo', icon: Wallet, placement: 'hero_product_receipt' },
  { href: '/orcamento-com-pix#montar', title: 'Mandar orçamento', description: 'Aprovação do cliente e cobrança Pix no WhatsApp.', action: 'Criar orçamento', icon: BriefcaseBusiness, placement: 'hero_product_quote' },
  { href: '/gerador-de-curriculo#ferramenta', title: 'Fazer currículo', description: 'Modelos profissionais em PDF para enviar hoje.', action: 'Montar currículo', icon: FileText, placement: 'hero_product_resume' }
] as const;

export function StrategicHubs({ compact = false }: { compact?: boolean }) {
  if (!compact) {
    return (
      <section className="border-y border-slate-200 bg-slate-50" aria-labelledby="hero-products-title">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Precisou, Tá Pronto</p>
          <h2 id="hero-products-title" className="precisoutapronto-display mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Resolva em segundos aquilo que normalmente dá trabalho.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Comece por uma das cinco tarefas pelas quais o Precisou, Tá Pronto é conhecido.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {HERO_PRODUCTS.map((product) => {
              const Icon = product.icon;
              return (
                <HomeConversionLink key={product.href} href={product.href} placement={product.placement} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" aria-hidden /></span>
                  <h3 className="mt-4 font-bold text-slate-950">{product.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{product.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">{product.action}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden /></span>
                </HomeConversionLink>
              );
            })}
          </div>
          <p className="mt-6 text-center text-sm text-slate-600">
            Cálculos trabalhistas:{' '}
            <Link href="/calculadora-de-ferias" className="font-bold text-sky-700 hover:underline">calculadora de férias CLT</Link>
            {' · '}
            <Link href="/calculadora-de-decimo-terceiro" className="font-bold text-sky-700 hover:underline">calculadora de 13º salário</Link>
            {' · '}
            <Link href="/rescisao" className="font-bold text-sky-700 hover:underline">central de rescisão e FGTS</Link>
            . Precisa de outra coisa? <Link href="/recursos" className="font-bold text-sky-700 hover:underline">Veja todas as ferramentas</Link>.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-slate-200 bg-slate-50" aria-labelledby="strategic-hubs-title">
      <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${compact ? 'py-10' : 'py-14 sm:py-16'}`}>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Guias e ferramentas por assunto</p>
        <h2 id="strategic-hubs-title" className="precisoutapronto-display mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
          Resolva o problema completo, não apenas uma etapa
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Entre pelo assunto que você precisa e encontre calculadoras, geradores, modelos e respostas relacionadas.
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {HUBS.map((hub) => (
            <Link
              key={hub.href}
              href={hub.href}
              className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
            >
              <h3 className="font-bold text-slate-950">{hub.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{hub.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-sky-700">
                Explorar <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
