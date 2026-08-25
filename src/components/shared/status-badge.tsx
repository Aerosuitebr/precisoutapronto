import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Status } from '@/lib/types';

interface StatusBadgeProps {
  status: Status;
}

const statusMap: Record<Status, { label: string; className: string }> = {
  aprovada: { label: 'Aprovada', className: 'bg-[var(--precisoutapronto-success-bg)] text-[var(--precisoutapronto-success)]' },
  rascunho: { label: 'Rascunho', className: 'bg-[var(--precisoutapronto-draft-bg)] text-[var(--precisoutapronto-draft)]' },
  em_analise: { label: 'Em analise', className: 'bg-[var(--precisoutapronto-warning-bg)] text-[var(--precisoutapronto-warning)]' },
  cancelada: { label: 'Cancelada', className: 'bg-[var(--precisoutapronto-danger-bg)] text-[var(--precisoutapronto-danger)]' }
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const item = statusMap[status];
  return <Badge className={cn('rounded-full px-2.5 py-1 text-[0.75rem] font-semibold', item.className)}>{item.label}</Badge>;
}
