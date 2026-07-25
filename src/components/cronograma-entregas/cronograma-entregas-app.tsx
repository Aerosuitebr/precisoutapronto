'use client';

import { useMemo, useRef, useState } from 'react';
import { CalendarRange, Copy, Download, Plus, Trash2 } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { PageHero } from '@/components/shared/page-hero';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { calcularGantt, PALETA_ETAPAS } from '@/lib/cronograma-entregas/calc';
import type { EtapaEntrega } from '@/lib/cronograma-entregas/types';
import { exportElementToPdf } from '@/lib/simple-element-pdf';

function novaEtapa(index: number): EtapaEntrega {
  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    nome: '',
    dataInicio: '',
    dataFim: '',
    cor: PALETA_ETAPAS[index % PALETA_ETAPAS.length]
  };
}

export function CronogramaEntregasApp() {
  const { toast } = useToast();
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [etapas, setEtapas] = useState<EtapaEntrega[]>([novaEtapa(0), novaEtapa(1)]);
  const ganttRef = useRef<HTMLDivElement>(null);

  function updateEtapa(id: string, patch: Partial<EtapaEntrega>) {
    setEtapas((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function adicionarEtapa() {
    setEtapas((prev) => [...prev, novaEtapa(prev.length)]);
  }

  function removerEtapa(id: string) {
    setEtapas((prev) => prev.filter((e) => e.id !== id));
  }

  const gantt = useMemo(() => calcularGantt(etapas), [etapas]);

  function copiarResumo() {
    if (!gantt) return;
    const linhas = [
      `*Cronograma${nomeProjeto ? ` · ${nomeProjeto}` : ''}*`,
      ...gantt.etapas.map(
        (e) =>
          `• ${e.nome || 'Etapa'}: ${new Date(e.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')} a ${new Date(
            e.dataFim + 'T00:00:00'
          ).toLocaleDateString('pt-BR')} (${e.dias} dia${e.dias > 1 ? 's' : ''})`
      )
    ].join('\n');
    navigator.clipboard.writeText(linhas);
    toast('Resumo copiado!');
  }

  async function baixarPdf() {
    if (!ganttRef.current || !gantt) return;
    await exportElementToPdf(ganttRef.current, 'cronograma-entregas');
    toast('PDF gerado!');
  }

  return (
    <AuthGate title="Cronograma de Entregas" description="Cadastre-se gratuitamente para montar seu cronograma.">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero
          title="Cronograma visual de entregas"
          subtitle="Cadastre as etapas do seu projeto e gere um cronograma visual para mandar junto com a proposta ou orçamento."
          icon={CalendarRange}
        />

        <section className="space-y-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm sm:p-5">
          <FormField label="Nome do projeto" htmlFor="nome-projeto" hint="Aparece no topo do cronograma.">
            <Input id="nome-projeto" value={nomeProjeto} onChange={(e) => setNomeProjeto(e.target.value)} placeholder="Ex.: Reforma da cozinha" />
          </FormField>

          <div className="space-y-3">
            {etapas.map((etapa, index) => (
              <div key={etapa.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                <FormField label={`Etapa ${index + 1}`} htmlFor={`etapa-nome-${etapa.id}`}>
                  <Input
                    id={`etapa-nome-${etapa.id}`}
                    value={etapa.nome}
                    onChange={(e) => updateEtapa(etapa.id, { nome: e.target.value })}
                    placeholder="Ex.: Demolição"
                  />
                </FormField>
                <FormField label="Início" htmlFor={`etapa-inicio-${etapa.id}`}>
                  <Input
                    id={`etapa-inicio-${etapa.id}`}
                    type="date"
                    value={etapa.dataInicio}
                    onChange={(e) => updateEtapa(etapa.id, { dataInicio: e.target.value })}
                  />
                </FormField>
                <FormField label="Fim" htmlFor={`etapa-fim-${etapa.id}`}>
                  <Input
                    id={`etapa-fim-${etapa.id}`}
                    type="date"
                    value={etapa.dataFim}
                    onChange={(e) => updateEtapa(etapa.id, { dataFim: e.target.value })}
                  />
                </FormField>
                <div className="flex items-end justify-end">
                  <Button
                    type="button"
                    variant="danger"
                    size="icon"
                    onClick={() => removerEtapa(etapa.id)}
                    aria-label="Remover etapa"
                    disabled={etapas.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" size="sm" onClick={adicionarEtapa} icon={Plus}>
            Adicionar etapa
          </Button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="rj-display text-base font-bold text-slate-900">Visualização</h2>
            {gantt ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copiarResumo} icon={Copy}>
                  Copiar resumo
                </Button>
                <Button variant="success" size="sm" onClick={baixarPdf} icon={Download}>
                  PDF
                </Button>
              </div>
            ) : null}
          </div>

          {!gantt ? (
            <p className="text-sm font-medium leading-6 text-slate-600">
              Preencha data de início e fim de ao menos uma etapa para ver o cronograma.
            </p>
          ) : (
            <div ref={ganttRef} className="space-y-4 bg-white p-1">
              {nomeProjeto ? <p className="rj-display text-sm font-bold text-slate-900">{nomeProjeto}</p> : null}

              <div className="relative">
                <div className="relative ml-0 h-6 border-b border-slate-200 text-[10px] font-semibold text-slate-500">
                  {gantt.marcadores.map((m, i) => (
                    <span key={i} className="absolute -translate-x-1/2" style={{ left: `${m.percent}%` }}>
                      {m.label}
                    </span>
                  ))}
                </div>

                <div className="mt-2 space-y-2.5">
                  {gantt.etapas.map((etapa) => (
                    <div key={etapa.id} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 truncate text-xs font-semibold text-slate-700" title={etapa.nome}>
                        {etapa.nome || 'Etapa'}
                      </span>
                      <div className="relative h-6 flex-1 rounded-md bg-slate-100">
                        <div
                          className="absolute top-0 h-6 rounded-md text-[10px] font-bold text-white shadow-sm"
                          style={{
                            left: `${etapa.offsetPercent}%`,
                            width: `${etapa.widthPercent}%`,
                            backgroundColor: etapa.cor
                          }}
                          title={`${etapa.dias} dia(s)`}
                        >
                          <span className="ml-2 leading-6">{etapa.dias}d</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs leading-5 text-slate-500">
                Período total: {gantt.inicioGeral.toLocaleDateString('pt-BR')} a {gantt.fimGeral.toLocaleDateString('pt-BR')} ({gantt.totalDias} dias).
              </p>
            </div>
          )}
        </section>
      </div>
    </AuthGate>
  );
}
