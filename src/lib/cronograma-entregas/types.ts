export interface EtapaEntrega {
  id: string;
  nome: string;
  dataInicio: string; // yyyy-mm-dd
  dataFim: string; // yyyy-mm-dd
  cor: string;
}

export interface EtapaCalculada extends EtapaEntrega {
  offsetPercent: number;
  widthPercent: number;
  dias: number;
}

export interface GanttResumo {
  etapas: EtapaCalculada[];
  inicioGeral: Date;
  fimGeral: Date;
  totalDias: number;
  marcadores: { label: string; percent: number }[];
}
