import { getUsageState, type BillableToolId } from '@/lib/billing';

export interface ToolsEngagement {
  docsThisMonth: number;
  totalDocs: number;
  badges: Array<{ id: string; label: string; how: string; unlocked: boolean }>;
}

function isSameMonth(iso: string, now = new Date()) {
  const date = new Date(iso);
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function getToolsEngagement(): ToolsEngagement {
  const state = getUsageState();
  const docsThisMonth = state.recentActions.filter((entry) => isSameMonth(entry.occurredAt)).length;
  const toolsUsed = new Set(state.recentActions.map((entry) => entry.toolId));

  const badges = [
    {
      id: 'first-doc',
      label: 'Primeiro documento',
      how: 'Desbloqueada ao salvar ou baixar o seu primeiro documento.',
      unlocked: state.totalConsumed >= 1
    },
    {
      id: 'first-contract',
      label: 'Primeiro contrato',
      how: 'Desbloqueada ao gerar um contrato pela primeira vez.',
      unlocked: toolsUsed.has('contratos' as BillableToolId)
    },
    {
      id: 'recibos-pro',
      label: 'Recibos em dia',
      how: 'Desbloqueada ao gerar 3 recibos.',
      unlocked: state.recentActions.filter((e) => e.toolId === 'recibos').length >= 3
    },
    {
      id: 'ten-docs',
      label: '10 documentos',
      how: 'Desbloqueada ao chegar em 10 documentos no total.',
      unlocked: state.totalConsumed >= 10
    }
  ];

  return {
    docsThisMonth,
    totalDocs: state.totalConsumed,
    badges
  };
}
