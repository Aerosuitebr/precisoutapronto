import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Activity, Cpu, Database, ShieldCheck } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { getViralBaseUrl } from '@/lib/viral-loop';

export const metadata: Metadata = {
  title: 'Jato Games Diagnostic: diagnóstico local do seu PC',
  description: 'Conheça como o Jato Games Diagnostic mede CPU, memória e disco localmente, identifica seu hardware e compara o PC com requisitos versionados de jogos.',
  alternates: { canonical: '/games/diagnostico' }
};

const docs = [
  ['/games/diagnostico/privacidade', 'Privacidade', 'Dados técnicos, armazenamento local e consentimento.'],
  ['/games/diagnostico/termos', 'Termos e limitações', 'Escopo das estimativas e responsabilidades.'],
  ['/games/diagnostico/suporte', 'Suporte e desinstalação', 'Ajuda, logs, segurança e remoção do aplicativo.'],
  ['/games/diagnostico/changelog', 'Versões', 'Histórico público das alterações do aplicativo.']
] as const;

export default function DiagnosticPage() {
  const base = getViralBaseUrl().replace(/\/$/, '');
  const pageUrl = `${base}/games/diagnostico`;
  const faq = [
    ['O diagnóstico envia meus dados automaticamente?', 'Não. O inventário e os benchmarks são processados localmente. Qualquer compartilhamento futuro exige uma ação e um consentimento separados.'],
    ['O resultado informa o FPS exato de um jogo?', 'Não. O relatório compara o hardware e medições controladas com requisitos versionados. O FPS real varia conforme jogo, resolução, qualidade, temperatura e programas em segundo plano.'],
    ['Quais componentes são analisados?', 'O aplicativo identifica processador, memória, GPU, driver e armazenamento, além de executar medições locais controladas de CPU, memória e disco.'],
    ['O aplicativo funciona sem internet?', 'Sim. O diagnóstico principal funciona offline com o catálogo incluído. Uma conexão é usada apenas para buscar atualizações compatíveis quando disponíveis.']
  ] as const;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Jato Games Diagnostic',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Windows 10, Windows 11',
        softwareVersion: '0.9.0',
        description: metadata.description,
        url: pageUrl,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL', availability: 'https://schema.org/PreOrder' },
        publisher: { '@type': 'Organization', name: 'Resolva Jato', url: base }
      },
      {
        '@type': 'WebPage',
        name: 'Jato Games Diagnostic',
        url: pageUrl,
        inLanguage: 'pt-BR',
        dateModified: '2026-07-30',
        isPartOf: { '@type': 'WebSite', name: 'Resolva Jato', url: base }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: base },
          { '@type': 'ListItem', position: 2, name: 'Jato Games', item: `${base}/games` },
          { '@type': 'ListItem', position: 3, name: 'Diagnostic', item: pageUrl }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map(([name, text]) => ({
          '@type': 'Question',
          name,
          acceptedAnswer: { '@type': 'Answer', text }
        }))
      }
    ]
  };
  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <SiteHeader />
    <main className="min-h-screen bg-[#07111f] text-white">
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.25em] text-[#39e7f2]">Telemetria local transparente</p>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">Jato Games Diagnostic</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Um diagnóstico Windows com consentimento explícito, inventário real do hardware e benchmarks
            controlados. Os resultados ficam no computador e não são enviados automaticamente.
          </p>
          <div className="mt-8 rounded-2xl border border-cyan-400/25 bg-white/5 p-5 text-sm leading-7 text-slate-300">
            Mede CPU, memória e armazenamento. Identifica GPU e driver. Não promete FPS exato e não
            substitui um benchmark dentro do próprio jogo.
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wider text-cyan-100">
            <span className="rounded-full border border-cyan-400/25 px-4 py-2">Versão candidata 0.9.0</span>
            <span className="rounded-full border border-cyan-400/25 px-4 py-2">Windows x64</span>
            <span className="rounded-full border border-cyan-400/25 px-4 py-2">Processamento local</span>
          </div>
        </div>
        <Image src="/images/jato-games/diagnostic/key-art.png" alt="Computador analisado pela telemetria do Jato Games Diagnostic" width={1536} height={1024} className="rounded-3xl border border-white/10 shadow-2xl" priority />
      </section>
      <section className="border-y border-white/10 bg-[#0b1727]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[#39e7f2]">Do inventário ao relatório</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black">Uma leitura técnica do PC, explicada para quem quer jogar</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              [Cpu, 'Hardware real', 'Identifica CPU, GPU, memória, drivers e unidades sem depender apenas do que o navegador revela.'],
              [Activity, 'Medições controladas', 'Executa testes curtos de CPU, memória e armazenamento com interrupção segura.'],
              [Database, 'Catálogo versionado', 'Compara resultados com requisitos mínimos e recomendados, fonte e data de revisão.'],
              [ShieldCheck, 'Privacidade visível', 'Mostra o que será coletado antes do teste e não envia o relatório automaticamente.']
            ].map(([Icon, title, text]) => {
              const FeatureIcon = Icon as typeof Cpu;
              return (
                <article key={String(title)} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <FeatureIcon className="h-6 w-6 text-[#39e7f2]" />
                  <h3 className="mt-4 font-black">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{String(text)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_.9fr]">
        <div>
          <h2 className="text-3xl font-black">O que o relatório entrega</h2>
          <p className="mt-4 leading-7 text-slate-300">
            O resultado separa compatibilidade mínima, experiência recomendada e possíveis gargalos. CPU, GPU,
            memória e armazenamento aparecem em indicadores visuais independentes, acompanhados de explicações,
            nível de confiança e ações sugeridas. Componentes desconhecidos nunca recebem aprovação automática.
          </p>
          <ol className="mt-7 space-y-4 text-sm leading-6 text-slate-300">
            <li><strong className="text-white">1. Consentimento:</strong> você revisa as categorias técnicas antes de iniciar.</li>
            <li><strong className="text-white">2. Coleta local:</strong> o aplicativo identifica componentes e trata falhas do Windows sem interromper o relatório.</li>
            <li><strong className="text-white">3. Benchmark:</strong> testes curtos medem capacidade relativa, sem simular um FPS inexistente.</li>
            <li><strong className="text-white">4. Comparação:</strong> o jogo escolhido é avaliado contra requisitos editoriais versionados.</li>
            <li><strong className="text-white">5. Próximo passo:</strong> o relatório prioriza ajustes, espaço, drivers ou upgrades com impacto provável.</li>
          </ol>
        </div>
        <aside className="rounded-3xl border border-amber-300/25 bg-amber-300/10 p-7">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-300">Status de disponibilidade</p>
          <h2 className="mt-3 text-2xl font-black">Versão candidata em preparação</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            A base técnica, os testes automatizados e o pacote MSIX estão preparados. O download público será
            liberado depois da assinatura e da validação de distribuição, para que o instalador possa ser verificado
            e atualizado com segurança.
          </p>
          <Link href="/games/ferramentas/meu-pc-roda" className="mt-6 inline-flex rounded-xl bg-[#39e7f2] px-5 py-3 font-black text-[#07111f]">
            Usar a comparação pelo navegador
          </Link>
        </aside>
      </section>
      <section className="border-t border-white/10 bg-[#0b1727]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-black">Perguntas frequentes</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {faq.map(([question, answer]) => (
              <article key={question} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-black text-white">{question}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-2xl font-black">Documentação pública</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {docs.map(([href, title, description]) => (
            <Link key={href} href={href} className="rounded-2xl border border-white/10 bg-[#101d2e] p-6 transition hover:border-[#18c5b5]">
              <strong className="text-lg text-[#39e7f2]">{title}</strong>
              <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
