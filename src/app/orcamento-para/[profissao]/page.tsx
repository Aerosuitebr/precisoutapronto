import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { OrcamentosApp } from '@/components/orcamentos/orcamentos-app';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { LiveStatsBar } from '@/components/marketing/live-stats-bar';
import { BRAND_AUTHOR_PATH, BRAND_NAME } from '@/lib/brand';
import { PROFESSION_LANDINGS, findProfessionLanding } from '@/lib/orcamentos/profession-presets';
import { getViralBaseUrl } from '@/lib/viral-loop';
import { FOCUSED_PROFESSION_SLUGS, temporaryNoindexRobots } from '@/lib/seo/focus-cycle';
import { StrategicSeoClusters } from '@/components/marketing/strategic-seo-clusters';
import { LandingConversionLink } from '@/components/analytics/landing-conversion-link';

const PRIORITY_CLUSTERS: Record<string, { guide: string; guideLabel: string; related: string[] }> = {
  eletricista: { guide: '/guias/modelo-de-orcamento-para-eletricista', guideLabel: 'Guia de orçamento elétrico', related: ['pedreiro', 'encanador', 'instalacao-ar-condicionado'] },
  pedreiro: { guide: '/guias/modelo-de-orcamento-para-prestacao-de-servico', guideLabel: 'Guia de orçamento de obra e serviços', related: ['pintor', 'encanador', 'eletricista'] },
  encanador: { guide: '/guias/modelo-de-orcamento-para-prestacao-de-servico', guideLabel: 'Guia de visita, peças e mão de obra', related: ['eletricista', 'pedreiro', 'manutencao-residencial'] },
  pintor: { guide: '/guias/modelo-de-orcamento-para-prestacao-de-servico', guideLabel: 'Guia de metragem, materiais e execução', related: ['pintura-residencial', 'pedreiro', 'gesseiro'] },
  'instalacao-ar-condicionado': { guide: '/guias/modelo-de-orcamento-para-prestacao-de-servico', guideLabel: 'Guia de instalação, materiais e adicionais', related: ['manutencao-ar-condicionado', 'eletricista', 'tecnico-de-informatica'] }
};

const LONG_TAIL_SCENARIOS: Record<string, Array<{ id: string; title: string; description: string; items: string[] }>> = {
  eletricista: [
    { id: 'residencial', title: 'Orçamento elétrico residencial', description: 'Organize o trabalho por ambiente e circuito, deixando visita, diagnóstico e execução separados.', items: ['ambientes e pontos atendidos', 'estado do quadro e dos circuitos', 'mão de obra e materiais'] },
    { id: 'troca-quadro', title: 'Troca ou adequação de quadro elétrico', description: 'Registre quantidade e capacidade dos disjuntores, identificação dos circuitos e adequações observadas na vistoria.', items: ['diagnóstico e dimensionamento', 'componentes especificados', 'instalação, testes e identificação'] },
    { id: 'instalacao-tomadas', title: 'Instalação de tomadas e novos pontos', description: 'Informe quantidade, ambiente, distância aproximada e se haverá passagem de cabo, canaleta ou intervenção na parede.', items: ['quantidade de pontos', 'trajeto e acabamento', 'teste e entrega'] },
    { id: 'instalacao-eletrica', title: 'Instalação elétrica por etapa', description: 'Em obras maiores, divida infraestrutura, cabeamento, montagem, acabamento e testes para vincular prazo e pagamento às entregas.', items: ['infraestrutura', 'cabos e componentes', 'montagem, acabamento e testes'] }
  ],
  pedreiro: [
    { id: 'reforma-residencial', title: 'Orçamento para reforma residencial', description: 'Separe demolição, preparação, execução, acabamento e limpeza para o cliente entender cada fase.', items: ['proteção e retirada', 'execução por ambiente', 'acabamento e descarte'] },
    { id: 'alvenaria', title: 'Orçamento de alvenaria', description: 'Informe metragem, tipo de bloco, preparação da base, vergas, revestimento e quem fornecerá os materiais.', items: ['metragem e espessura', 'material e transporte', 'execução e acabamento'] },
    { id: 'piso-revestimento', title: 'Assentamento de piso e revestimento', description: 'Registre área, paginação, condição da base, recortes, rejunte e perdas previstas.', items: ['área e tipo de peça', 'regularização da base', 'assentamento, rejunte e limpeza'] },
    { id: 'pagamento-etapas', title: 'Obra com pagamento por etapas', description: 'Associe entrada e parcelas a marcos observáveis, evitando percentuais sem uma entrega correspondente.', items: ['entrada e mobilização', 'marco intermediário verificável', 'saldo após vistoria final'] }
  ]
};

export function generateStaticParams() {
  return PROFESSION_LANDINGS.map((item) => ({ profissao: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ profissao: string }> }): Promise<Metadata> {
  const { profissao } = await params;
  const page = findProfessionLanding(profissao);
  if (!page) return {};
  const path = `/orcamento-para/${page.slug}`;
  return {
    title: { absolute: `${page.title} | ${BRAND_NAME}` },
    description: page.description,
    alternates: { canonical: path },
    robots: temporaryNoindexRobots(FOCUSED_PROFESSION_SLUGS.has(page.slug)),
    openGraph: { title: page.title, description: page.description, url: path, type: 'website' }
  };
}

export default async function ProfessionQuotePage({ params }: { params: Promise<{ profissao: string }> }) {
  const { profissao } = await params;
  const page = findProfessionLanding(profissao);
  if (!page) notFound();
  const path = `/orcamento-para/${page.slug}`;
  const site = getViralBaseUrl().replace(/\/$/, '');
  const pageIndex = PROFESSION_LANDINGS.findIndex((item) => item.slug === page.slug);
  const priorityCluster = PRIORITY_CLUSTERS[page.slug];
  const longTailScenarios = LONG_TAIL_SCENARIOS[page.slug] || [];
  const relatedPages = priorityCluster
    ? priorityCluster.related.map((slug) => findProfessionLanding(slug)).filter((item): item is NonNullable<typeof item> => Boolean(item))
    : [1, 2, 3].map((offset) => PROFESSION_LANDINGS[(pageIndex + offset) % PROFESSION_LANDINGS.length]);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebApplication', name: page.title, description: page.description, url: `${site}${path}`, applicationCategory: 'BusinessApplication', operatingSystem: 'Web', dateModified: '2026-09-04' },
      { '@type': 'FAQPage', mainEntity: page.faqs.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
      ...(longTailScenarios.length ? [{ '@type': 'ItemList', name: `Tipos de orçamento para ${page.name.toLowerCase()}`, itemListElement: longTailScenarios.map((scenario, index) => ({ '@type': 'ListItem', position: index + 1, name: scenario.title, url: `${site}${path}#${scenario.id}` })) }] : [])
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TopEnvBanner />
      <div className="pt-8">
        <SiteHeader />
        <main className="bg-slate-50">
          <section className="bg-[linear-gradient(145deg,#020617,#0f172a_50%,#064e3b)] text-white">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Modelo para {page.name}</p>
              <h1 className="precisoutapronto-display mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">{page.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">{page.description}</p>
              <ul className="mt-6 grid max-w-3xl gap-2 text-sm sm:grid-cols-3">
                {page.checklist.map((item) => <li key={item} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-amber-300" />{item}</li>)}
              </ul>
              <LandingConversionLink href="#montar" landingPath={path} placement="hero_primary" className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-slate-950 hover:bg-amber-300">Usar este modelo grátis <ArrowRight className="h-4 w-4" /></LandingConversionLink>
              <p className="mt-3 text-sm text-emerald-100">Sem cadastro para começar · aprovação pelo cliente · Pix no mesmo fluxo</p>
            </div>
          </section>
          {page.priceGuide ? (
            <section className="bg-white">
              <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Referência de preço</p>
                <h2 className="precisoutapronto-display mt-2 text-3xl font-extrabold text-slate-950">{page.priceGuide.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{page.priceGuide.intro}</p>
                <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200">
                  <div className="hidden grid-cols-[1fr_auto] gap-4 bg-slate-950 px-5 py-3 text-xs font-bold uppercase tracking-wide text-white sm:grid">
                    <span>Serviço</span>
                    <span>Faixa 2026</span>
                  </div>
                  {page.priceGuide.rows.map((row) => (
                    <div key={row.service} className="grid gap-1 border-t border-slate-200 px-5 py-4 first:border-t-0 sm:grid-cols-[1fr_auto] sm:gap-4">
                      <strong className="text-slate-950">{row.service}</strong>
                      <span className="font-semibold text-slate-800">{row.range}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{page.priceGuide.footnote}</p>
                <LandingConversionLink href="#montar" landingPath={path} placement="inline_primary" className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-slate-950 hover:bg-amber-300">
                  Montar meu orçamento com esses itens <ArrowRight className="h-4 w-4" />
                </LandingConversionLink>
              </div>
            </section>
          ) : null}
          <section id="montar" className="scroll-mt-20 border-b border-slate-200">
            <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
              <div className="mx-auto mb-5 max-w-6xl rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"><strong>Modelo carregado:</strong> {page.promise} Revise itens, quantidades e valores antes de enviar.</div>
              <OrcamentosApp publicAccess preset={page.preset} />
            </div>
          </section>
          {page.example ? <section className="bg-white"><div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Modelo final preenchido</p>
            <h2 className="precisoutapronto-display mt-2 text-3xl font-extrabold text-slate-950">Exemplo de orçamento para {page.name.toLowerCase()}</h2>
            <p className="mt-3 text-sm text-slate-500">{page.example.client}. Valores demonstrativos: substitua pela vistoria, custos e condições reais.</p>
            <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200">
              <div className="hidden grid-cols-[1fr_2fr_auto] gap-4 bg-slate-950 px-5 py-3 text-xs font-bold uppercase tracking-wide text-white sm:grid"><span>Item</span><span>Escopo</span><span>Valor</span></div>
              {page.example.items.map((item) => <div key={item.description} className="grid gap-1 border-t border-slate-200 px-5 py-4 first:border-t-0 sm:grid-cols-[1fr_2fr_auto] sm:gap-4"><strong className="text-slate-950">{item.description}</strong><span className="text-sm text-slate-600">{item.detail}</span><strong className="text-slate-950">{item.value}</strong></div>)}
              <div className="flex justify-between bg-emerald-50 px-5 py-4 text-lg font-black text-emerald-950"><span>Total</span><span>{page.example.total}</span></div>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">{page.example.terms.map((term) => <li key={term} className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">{term}</li>)}</ul>
          </div></section> : null}
          {longTailScenarios.length ? <section className="border-y border-slate-200 bg-slate-50"><div className="mx-auto max-w-5xl px-4 py-14 sm:px-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Modelos por tipo de serviço</p><h2 className="precisoutapronto-display mt-2 text-3xl font-extrabold text-slate-950">Orçamentos específicos de {page.name.toLowerCase()}</h2><p className="mt-3 max-w-3xl leading-7 text-slate-600">Use estes recortes para detalhar o escopo na mesma proposta, sem criar documentos genéricos ou duplicados.</p><div className="mt-7 grid gap-4 sm:grid-cols-2">{longTailScenarios.map((scenario) => <article id={scenario.id} key={scenario.id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-extrabold text-slate-950">{scenario.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{scenario.description}</p><ul className="mt-4 space-y-2">{scenario.items.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul><LandingConversionLink href="#montar" landingPath={path} placement="inline_primary" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:underline">Gerar este orçamento <ArrowRight className="h-4 w-4" /></LandingConversionLink></article>)}</div></div></section> : null}
          {page.sections?.length ? <section className="border-y border-slate-200 bg-slate-50"><div className="mx-auto grid max-w-5xl gap-8 px-4 py-14 sm:grid-cols-2 sm:px-6">{page.sections.map((section) => <div key={section.title}><h2 className="precisoutapronto-display text-2xl font-bold text-slate-950">{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 leading-7 text-slate-700">{paragraph}</p>)}</div>)}</div></section> : null}
          <section className="bg-white">
            <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
              <h2 className="precisoutapronto-display text-3xl font-extrabold text-slate-950">Dúvidas de {page.name.toLowerCase()}</h2>
              <dl className="mt-7 grid gap-4 sm:grid-cols-2">{page.faqs.map((item) => <div key={item.q} className="rounded-2xl border border-slate-200 p-5"><dt className="font-bold text-slate-900">{item.q}</dt><dd className="mt-2 text-sm leading-6 text-slate-600">{item.a}</dd></div>)}</dl>
              <p className="mt-8 text-sm text-slate-600">Precisa de outro formato? <Link href="/orcamento-com-pix" className="font-bold text-emerald-700 hover:underline">Abra o gerador geral de orçamento com Pix</Link>.</p>
              {priorityCluster ? <p className="mt-3 text-sm text-slate-600">Quer conferir escopo e condições antes de preencher? <Link href={priorityCluster.guide} className="font-bold text-emerald-700 hover:underline">Leia o {priorityCluster.guideLabel.toLowerCase()}</Link>.</p> : null}
              <div className="mt-10 border-t border-slate-200 pt-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Continue no cluster</p><h2 className="precisoutapronto-display mt-2 text-2xl font-extrabold text-slate-950">Outros modelos de orçamento</h2></div><Link href="/modelos-de-orcamento" className="text-sm font-bold text-emerald-700 hover:underline">Ver todos os modelos</Link></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{relatedPages.map((related) => <Link key={related.slug} href={`/orcamento-para/${related.slug}`} className="rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"><strong className="text-slate-950">{related.name}</strong><span className="mt-2 block text-sm text-slate-600">Abrir modelo preenchido →</span></Link>)}</div></div>
              <aside className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600"><strong className="text-slate-900">Como verificamos esta página.</strong> O modelo foi testado no gerador com os campos exibidos acima. Os indicadores abaixo vêm de registros agregados do produto, são arredondados para preservar privacidade e podem ficar ocultos enquanto não atingem o mínimo de publicação.<LiveStatsBar className="mt-5" /><p className="mt-5">Atualizado em <time dateTime="2026-09-04">4 de setembro de 2026</time> · Revisão editorial interna por <Link href={BRAND_AUTHOR_PATH} className="font-bold text-emerald-700 hover:underline">Equipe editorial Precisou, Tá Pronto</Link> · <Link href="/criterios-editoriais" className="font-bold text-emerald-700 hover:underline">metodologia editorial</Link>. Esta revisão verifica clareza e funcionamento; não constitui revisão técnica, jurídica ou contábil especializada.</p></aside>
            </div>
          </section>
          <StrategicSeoClusters current="/modelos-de-orcamento" />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
