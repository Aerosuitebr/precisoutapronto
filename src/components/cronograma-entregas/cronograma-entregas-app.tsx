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

type Locale = 'pt-BR' | 'en' | 'es';

const INTL_LOCALE: Record<Locale, string> = { 'pt-BR': 'pt-BR', en: 'en-US', es: 'es-ES' };

const COPY: Record<
  Locale,
  {
    authTitle: string;
    authDescription: string;
    heroTitle: string;
    heroSubtitle: string;
    projectNameLabel: string;
    projectNameHint: string;
    projectNamePlaceholder: string;
    etapaLabel: (index: number) => string;
    etapaPlaceholder: string;
    inicioLabel: string;
    fimLabel: string;
    removerEtapaAria: string;
    addEtapa: string;
    visualizacaoTitle: string;
    copiarResumo: string;
    pdfButton: string;
    emptyGantt: string;
    etapaFallback: string;
    dias: (n: number) => string;
    periodoTotal: (inicio: string, fim: string, total: number) => string;
    toastResumoCopiado: string;
    toastPdfGerado: string;
    resumoHeader: (nomeProjeto: string) => string;
    resumoLinha: (nome: string, inicio: string, fim: string, dias: number) => string;
  }
> = {
  'pt-BR': {
    authTitle: 'Cronograma de Entregas',
    authDescription: 'Cadastre-se gratuitamente para montar seu cronograma.',
    heroTitle: 'Cronograma visual de entregas',
    heroSubtitle:
      'Cadastre as etapas do seu projeto e gere um cronograma visual para mandar junto com a proposta ou orçamento.',
    projectNameLabel: 'Nome do projeto',
    projectNameHint: 'Aparece no topo do cronograma.',
    projectNamePlaceholder: 'Ex.: Reforma da cozinha',
    etapaLabel: (index) => `Etapa ${index}`,
    etapaPlaceholder: 'Ex.: Demolição',
    inicioLabel: 'Início',
    fimLabel: 'Fim',
    removerEtapaAria: 'Remover etapa',
    addEtapa: 'Adicionar etapa',
    visualizacaoTitle: 'Visualização',
    copiarResumo: 'Copiar resumo',
    pdfButton: 'PDF',
    emptyGantt: 'Preencha data de início e fim de ao menos uma etapa para ver o cronograma.',
    etapaFallback: 'Etapa',
    dias: (n) => `${n} dia${n > 1 ? 's' : ''}`,
    periodoTotal: (inicio, fim, total) => `Período total: ${inicio} a ${fim} (${total} dias).`,
    toastResumoCopiado: 'Resumo copiado!',
    toastPdfGerado: 'PDF gerado!',
    resumoHeader: (nomeProjeto) => `*Cronograma${nomeProjeto ? ` · ${nomeProjeto}` : ''}*`,
    resumoLinha: (nome, inicio, fim, dias) => `• ${nome}: ${inicio} a ${fim} (${dias} dia${dias > 1 ? 's' : ''})`
  },
  en: {
    authTitle: 'Delivery Schedule',
    authDescription: 'Sign up for free to build your schedule.',
    heroTitle: 'Visual delivery schedule',
    heroSubtitle:
      'Add your project stages and generate a visual schedule to send along with the proposal or quote.',
    projectNameLabel: 'Project name',
    projectNameHint: 'Shows up at the top of the schedule.',
    projectNamePlaceholder: 'E.g.: Kitchen remodel',
    etapaLabel: (index) => `Stage ${index}`,
    etapaPlaceholder: 'E.g.: Demolition',
    inicioLabel: 'Start',
    fimLabel: 'End',
    removerEtapaAria: 'Remove stage',
    addEtapa: 'Add stage',
    visualizacaoTitle: 'Preview',
    copiarResumo: 'Copy summary',
    pdfButton: 'PDF',
    emptyGantt: 'Fill in the start and end date of at least one stage to see the schedule.',
    etapaFallback: 'Stage',
    dias: (n) => `${n} day${n > 1 ? 's' : ''}`,
    periodoTotal: (inicio, fim, total) => `Total period: ${inicio} to ${fim} (${total} days).`,
    toastResumoCopiado: 'Summary copied!',
    toastPdfGerado: 'PDF generated!',
    resumoHeader: (nomeProjeto) => `*Schedule${nomeProjeto ? ` : ${nomeProjeto}` : ''}*`,
    resumoLinha: (nome, inicio, fim, dias) => `- ${nome}: ${inicio} to ${fim} (${dias} day${dias > 1 ? 's' : ''})`
  },
  es: {
    authTitle: 'Cronograma de Entregas',
    authDescription: 'Registrate gratis para armar tu cronograma.',
    heroTitle: 'Cronograma visual de entregas',
    heroSubtitle:
      'Registra las etapas de tu proyecto y genera un cronograma visual para enviar junto con la propuesta o presupuesto.',
    projectNameLabel: 'Nombre del proyecto',
    projectNameHint: 'Aparece en la parte superior del cronograma.',
    projectNamePlaceholder: 'Ej.: Remodelacion de cocina',
    etapaLabel: (index) => `Etapa ${index}`,
    etapaPlaceholder: 'Ej.: Demolicion',
    inicioLabel: 'Inicio',
    fimLabel: 'Fin',
    removerEtapaAria: 'Quitar etapa',
    addEtapa: 'Agregar etapa',
    visualizacaoTitle: 'Vista previa',
    copiarResumo: 'Copiar resumen',
    pdfButton: 'PDF',
    emptyGantt: 'Completa la fecha de inicio y fin de al menos una etapa para ver el cronograma.',
    etapaFallback: 'Etapa',
    dias: (n) => `${n} dia${n > 1 ? 's' : ''}`,
    periodoTotal: (inicio, fim, total) => `Periodo total: ${inicio} a ${fim} (${total} dias).`,
    toastResumoCopiado: 'Resumen copiado!',
    toastPdfGerado: 'PDF generado!',
    resumoHeader: (nomeProjeto) => `*Cronograma${nomeProjeto ? ` : ${nomeProjeto}` : ''}*`,
    resumoLinha: (nome, inicio, fim, dias) => `• ${nome}: ${inicio} a ${fim} (${dias} dia${dias > 1 ? 's' : ''})`
  }
};

function novaEtapa(index: number): EtapaEntrega {
  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    nome: '',
    dataInicio: '',
    dataFim: '',
    cor: PALETA_ETAPAS[index % PALETA_ETAPAS.length]
  };
}

export function CronogramaEntregasApp({ locale = 'pt-BR' }: { locale?: Locale } = {}) {
  const t = COPY[locale];
  const intlLocale = INTL_LOCALE[locale];
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

  function formatData(value: string): string {
    return new Date(value + 'T00:00:00').toLocaleDateString(intlLocale);
  }

  function copiarResumo() {
    if (!gantt) return;
    const linhas = [
      t.resumoHeader(nomeProjeto),
      ...gantt.etapas.map((e) =>
        t.resumoLinha(e.nome || t.etapaFallback, formatData(e.dataInicio), formatData(e.dataFim), e.dias)
      )
    ].join('\n');
    navigator.clipboard.writeText(linhas);
    toast(t.toastResumoCopiado);
  }

  async function baixarPdf() {
    if (!ganttRef.current || !gantt) return;
    await exportElementToPdf(ganttRef.current, 'cronograma-entregas');
    toast(t.toastPdfGerado);
  }

  return (
    <AuthGate title={t.authTitle} description={t.authDescription}>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero title={t.heroTitle} subtitle={t.heroSubtitle} icon={CalendarRange} />

        <section className="space-y-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm sm:p-5">
          <FormField label={t.projectNameLabel} htmlFor="nome-projeto" hint={t.projectNameHint}>
            <Input id="nome-projeto" value={nomeProjeto} onChange={(e) => setNomeProjeto(e.target.value)} placeholder={t.projectNamePlaceholder} />
          </FormField>

          <div className="space-y-3">
            {etapas.map((etapa, index) => (
              <div key={etapa.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                <FormField label={t.etapaLabel(index + 1)} htmlFor={`etapa-nome-${etapa.id}`}>
                  <Input
                    id={`etapa-nome-${etapa.id}`}
                    value={etapa.nome}
                    onChange={(e) => updateEtapa(etapa.id, { nome: e.target.value })}
                    placeholder={t.etapaPlaceholder}
                  />
                </FormField>
                <FormField label={t.inicioLabel} htmlFor={`etapa-inicio-${etapa.id}`}>
                  <Input
                    id={`etapa-inicio-${etapa.id}`}
                    type="date"
                    value={etapa.dataInicio}
                    onChange={(e) => updateEtapa(etapa.id, { dataInicio: e.target.value })}
                  />
                </FormField>
                <FormField label={t.fimLabel} htmlFor={`etapa-fim-${etapa.id}`}>
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
                    aria-label={t.removerEtapaAria}
                    disabled={etapas.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" size="sm" onClick={adicionarEtapa} icon={Plus}>
            {t.addEtapa}
          </Button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="rj-display text-base font-bold text-slate-900">{t.visualizacaoTitle}</h2>
            {gantt ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copiarResumo} icon={Copy}>
                  {t.copiarResumo}
                </Button>
                <Button variant="success" size="sm" onClick={baixarPdf} icon={Download}>
                  {t.pdfButton}
                </Button>
              </div>
            ) : null}
          </div>

          {!gantt ? (
            <p className="text-sm font-medium leading-6 text-slate-600">{t.emptyGantt}</p>
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
                        {etapa.nome || t.etapaFallback}
                      </span>
                      <div className="relative h-6 flex-1 rounded-md bg-slate-100">
                        <div
                          className="absolute top-0 h-6 rounded-md text-[10px] font-bold text-white shadow-sm"
                          style={{
                            left: `${etapa.offsetPercent}%`,
                            width: `${etapa.widthPercent}%`,
                            backgroundColor: etapa.cor
                          }}
                          title={t.dias(etapa.dias)}
                        >
                          <span className="ml-2 leading-6">{etapa.dias}d</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs leading-5 text-slate-500">
                {t.periodoTotal(gantt.inicioGeral.toLocaleDateString(intlLocale), gantt.fimGeral.toLocaleDateString(intlLocale), gantt.totalDias)}
              </p>
            </div>
          )}
        </section>
      </div>
    </AuthGate>
  );
}
