import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Jato Games Diagnostic — diagnóstico local do seu PC',
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
  return (
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
        </div>
        <Image src="/images/jato-games/diagnostic/key-art.png" alt="Computador analisado pela telemetria do Jato Games Diagnostic" width={1536} height={1024} className="rounded-3xl border border-white/10 shadow-2xl" priority />
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
  );
}
