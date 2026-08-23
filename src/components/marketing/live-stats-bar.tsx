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

function StatsList({ items, className }: { items: ReadonlyArray<{ value: string; label: string }>; className?: string }) {
  return (
    <ul className={cn('grid gap-3 sm:grid-cols-3', className)} aria-label="Indicadores do produto">
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
    return <StatsList items={verifiedProductIndicators} className={className} />;
  }

  const items = [
    {
      value: formatCount(stats.orcamentosToday),
      label: 'Orçamentos hoje',
      show: stats.orcamentosToday > 0
    },
    {
      value: formatCount(stats.orcamentosApprovedWeek),
      label: 'Aprovados na semana',
      show: stats.orcamentosApprovedWeek > 0
    },
    {
      value: formatCount(stats.docsGeneratedApprox),
      label: 'Docs gerados',
      show: stats.docsGeneratedApprox > 0
    },
    {
      value: formatCount(stats.usersTotal),
      label: 'Contas criadas',
      show: stats.usersTotal > 0
    }
  ].filter((item) => item.show);

  const visibleItems = [...items, ...verifiedProductIndicators].slice(0, 3);
  return <StatsList items={visibleItems} className={className} />;
}
