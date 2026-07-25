import type { EtapaEntrega, GanttResumo } from './types';

const MS_DIA = 1000 * 60 * 60 * 24;

function toDate(value: string): Date {
  const [ano, mes, dia] = value.split('-').map(Number);
  return new Date(ano, (mes || 1) - 1, dia || 1);
}

export function calcularGantt(etapas: EtapaEntrega[]): GanttResumo | null {
  const validas = etapas.filter((e) => e.dataInicio && e.dataFim);
  if (validas.length === 0) return null;

  const inicios = validas.map((e) => toDate(e.dataInicio).getTime());
  const fins = validas.map((e) => toDate(e.dataFim).getTime());
  const inicioGeral = new Date(Math.min(...inicios));
  const fimGeral = new Date(Math.max(...fins));
  const totalMs = Math.max(fimGeral.getTime() - inicioGeral.getTime(), MS_DIA);
  const totalDias = Math.round(totalMs / MS_DIA) + 1;

  const etapasCalculadas = validas.map((etapa) => {
    const inicio = toDate(etapa.dataInicio).getTime();
    const fim = toDate(etapa.dataFim).getTime();
    const offsetPercent = ((inicio - inicioGeral.getTime()) / totalMs) * 100;
    const widthPercent = Math.max(((Math.max(fim - inicio, MS_DIA)) / totalMs) * 100, 2);
    const dias = Math.round((fim - inicio) / MS_DIA) + 1;
    return { ...etapa, offsetPercent, widthPercent, dias };
  });

  // Marcadores semanais ao longo da linha do tempo.
  const marcadores: { label: string; percent: number }[] = [];
  const totalSemanas = Math.max(1, Math.ceil(totalDias / 7));
  for (let semana = 0; semana <= totalSemanas; semana += 1) {
    const dataMarcador = new Date(inicioGeral.getTime() + semana * 7 * MS_DIA);
    if (dataMarcador.getTime() > fimGeral.getTime() + MS_DIA) break;
    const percent = ((dataMarcador.getTime() - inicioGeral.getTime()) / totalMs) * 100;
    marcadores.push({
      label: dataMarcador.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      percent: Math.min(percent, 100)
    });
  }

  return { etapas: etapasCalculadas, inicioGeral, fimGeral, totalDias, marcadores };
}

export const PALETA_ETAPAS = ['#0369a1', '#0d9488', '#b45309', '#7c3aed', '#e11d48', '#16a34a', '#0f172a', '#c026d3'];
