'use client';

import { useEffect, useState } from 'react';
import type { PublicStats } from '@/lib/public-stats';
import { cn } from '@/lib/utils';

function formatCount(n: number) {
  return `${n.toLocaleString('pt-BR')}+`;
}

const verifiedProductIndicators = [
  { value: '0', label: 'cadastro para o 1º orçamento' },
  { value: '0', label: 'apps para o cliente instalar' },
  { value: '1', label: 'link para conferir e responder' }
] as const;

function StatsList({ items, className, label = 'Características de funcionamento' }: { items: ReadonlyArray<{ value: string; label: string }>; className?: string; label?: string }) {
  return (
    <ul className={cn('grid gap-3 sm:grid-cols-3', className)} aria-label={label}>
      {items.slice(0, 3).map((stat) => (
        <li key={stat.label} className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-4 text-center">
          <p className="text-2xl font-black tabular-nums tracking-tight text-emerald-950">{stat.value}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-emerald-900/75">{stat.label}</p>
        </li>
      ))}
    </ul>
  );
}

export function LiveStatsBar({
  initial,
  className
}: {
  initial?: PublicStats | null;
  className?: string;
}) {
  const [stats, setStats] = useState<PublicStats | null>(initial || null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/public')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: PublicStats | null) => {
        if (!cancelled && data) setStats(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) {
    return <div className={className}><p className="mb-3 text-xs font-bold">Características de funcionamento</p><StatsList items={verifiedProductIndicators} /></div>;
  }

  const items = [
    {
      value: formatCount(stats.orcamentosToday),
      label: 'Orçamentos no dia UTC da atualização',
      show: stats.orcamentosToday > 0
    },
    {
      value: formatCount(stats.orcamentosApprovedWeek),
      label: 'Aprovados nos últimos 7 dias (UTC)',
      show: stats.orcamentosApprovedWeek > 0
    },
    {
      value: formatCount(stats.docsGeneratedApprox),
      label: 'Gerações registradas, acumuladas',
      show: stats.docsGeneratedApprox > 0
    },
    {
      value: formatCount(stats.usersTotal),
      label: 'Contas criadas, acumuladas',
      show: stats.usersTotal > 0
    }
  ].filter((item) => item.show);

  return <div className={className}>
    {items.length ? <section aria-label="Estatísticas de uso"><p className="mb-3 text-xs font-bold">Estatísticas de uso</p><StatsList items={items} label="Contagens agregadas do produto" /><p className="mt-3 text-xs leading-6">Fonte: registros do produto. Contagens arredondadas para baixo; valores abaixo do mínimo de privacidade são omitidos. Gerações registradas não equivalem a arquivos únicos nem usuários únicos.{Number.isFinite(Date.parse(stats.updatedAt)) ? ` Atualização: ${new Date(stats.updatedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (Brasília).` : ''}</p></section> : null}
    <p className="mb-3 mt-5 text-xs font-bold">Características de funcionamento</p><StatsList items={verifiedProductIndicators} />
  </div>;
}
