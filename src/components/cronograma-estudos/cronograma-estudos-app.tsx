"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Copy,
  MessageCircle,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { PageHero } from "@/components/shared/page-hero";
import { ToolsBackButton } from "@/components/shared/tools-back-button";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  formatarMinutos,
  gerarCronograma,
  type Materia,
} from "@/lib/cronograma-estudos/gerar";
import { cn } from "@/lib/utils";
import { WhatsAppSendModal } from "@/components/whatsapp/whatsapp-send-modal";

type Locale = "pt-BR" | "en" | "es";

const DIAS_LABEL: Record<Locale, string[]> = {
  "pt-BR": ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
};

const NOME_DIA: Record<Locale, string[]> = {
  "pt-BR": ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
};

const MATERIAS_INICIAIS: Record<Locale, Materia[]> = {
  "pt-BR": [
    { nome: "Matemática", peso: 4 },
    { nome: "Português", peso: 3 },
    { nome: "Redação", peso: 3 },
  ],
  en: [
    { nome: "Math", peso: 4 },
    { nome: "Language Arts", peso: 3 },
    { nome: "Writing", peso: 3 },
  ],
  es: [
    { nome: "Matematicas", peso: 4 },
    { nome: "Lengua", peso: 3 },
    { nome: "Redaccion", peso: 3 },
  ],
};

const COPY: Record<
  Locale,
  {
    authTitle: string;
    authDescription: string;
    heroTitle: string;
    heroSubtitle: string;
    insightPesoLabel: string;
    insightPesoText: string;
    insightRotinaLabel: string;
    insightRotinaText: string;
    insightRevisaoLabel: string;
    insightRevisaoText: string;
    materiasLabel: string;
    removerMateriaAria: (nome: string) => string;
    addMateriaPlaceholder: string;
    addButton: string;
    diasDisponiveisLabel: string;
    horasPorDiaLabel: string;
    semanasLabel: string;
    incluirRevisaoLabel: string;
    semanaModeloTitle: (semanas: number) => string;
    emptyMaterias: string;
    copiarCronograma: string;
    enviarWhatsApp: string;
    destinationHint: string;
    toastCopiado: string;
    resumoTitulo: string;
    resumoSubtitulo: (semanas: number, horasPorDia: number, materias: number) => string;
    resumoSemana1: string;
    resumoRodape: string;
  }
> = {
  "pt-BR": {
    authTitle: "Gerador de Cronograma de Estudos",
    authDescription: "Cadastre-se gratuitamente para montar seu cronograma.",
    heroTitle: "Cronograma de Estudos personalizado",
    heroSubtitle:
      "Informe suas matérias, dias disponíveis e carga horária. A gente monta a distribuição semanal priorizando o que é mais difícil ou mais importante.",
    insightPesoLabel: "Peso",
    insightPesoText: "Dê mais peso para matéria difícil ou decisiva.",
    insightRotinaLabel: "Rotina",
    insightRotinaText: "Escolha dias reais para não criar plano impossível.",
    insightRevisaoLabel: "Revisão",
    insightRevisaoText: "Reserve um dia para consolidar a semana.",
    materiasLabel: "Matérias e peso (dificuldade/importância)",
    removerMateriaAria: (nome) => `Remover ${nome}`,
    addMateriaPlaceholder: "Adicionar matéria (ex: Física)",
    addButton: "Adicionar",
    diasDisponiveisLabel: "Dias disponíveis",
    horasPorDiaLabel: "Horas de estudo por dia",
    semanasLabel: "Duração (semanas)",
    incluirRevisaoLabel: "Reservar o último dia da semana para revisão geral",
    semanaModeloTitle: (semanas) => `Semana modelo (repete até a semana ${semanas})`,
    emptyMaterias: "Adicione matérias e selecione ao menos um dia da semana.",
    copiarCronograma: "Copiar cronograma",
    enviarWhatsApp: "Enviar no WhatsApp",
    destinationHint: "WhatsApp que receberá o cronograma",
    toastCopiado: "Cronograma copiado!",
    resumoTitulo: "*CRONOGRAMA DE ESTUDOS | PLANO SEMANAL*",
    resumoSubtitulo: (semanas, horasPorDia, materias) =>
      `_${semanas} semana(s) | ${horasPorDia}h por dia | ${materias} matéria(s)_`,
    resumoSemana1: "*SEMANA 1*",
    resumoRodape: "Gerado automaticamente com base no peso/dificuldade de cada matéria.",
  },
  en: {
    authTitle: "Study Schedule Generator",
    authDescription: "Sign up for free to build your schedule.",
    heroTitle: "Personalized Study Schedule",
    heroSubtitle:
      "Enter your subjects, available days and study hours. We build the weekly distribution prioritizing what is hardest or most important.",
    insightPesoLabel: "Weight",
    insightPesoText: "Give more weight to harder or decisive subjects.",
    insightRotinaLabel: "Routine",
    insightRotinaText: "Pick realistic days so the plan is actually doable.",
    insightRevisaoLabel: "Review",
    insightRevisaoText: "Reserve one day to consolidate the week.",
    materiasLabel: "Subjects and weight (difficulty/importance)",
    removerMateriaAria: (nome) => `Remove ${nome}`,
    addMateriaPlaceholder: "Add subject (e.g.: Physics)",
    addButton: "Add",
    diasDisponiveisLabel: "Available days",
    horasPorDiaLabel: "Study hours per day",
    semanasLabel: "Duration (weeks)",
    incluirRevisaoLabel: "Reserve the last day of the week for a general review",
    semanaModeloTitle: (semanas) => `Sample week (repeats until week ${semanas})`,
    emptyMaterias: "Add subjects and select at least one day of the week.",
    copiarCronograma: "Copy schedule",
    enviarWhatsApp: "Send on WhatsApp",
    destinationHint: "WhatsApp that will receive the schedule",
    toastCopiado: "Schedule copied!",
    resumoTitulo: "*STUDY SCHEDULE | WEEKLY PLAN*",
    resumoSubtitulo: (semanas, horasPorDia, materias) =>
      `_${semanas} week(s) | ${horasPorDia}h per day | ${materias} subject(s)_`,
    resumoSemana1: "*WEEK 1*",
    resumoRodape: "Automatically generated based on the weight/difficulty of each subject.",
  },
  es: {
    authTitle: "Generador de Cronograma de Estudio",
    authDescription: "Registrate gratis para armar tu cronograma.",
    heroTitle: "Cronograma de Estudio personalizado",
    heroSubtitle:
      "Ingresa tus materias, dias disponibles y carga horaria. Armamos la distribucion semanal priorizando lo mas dificil o mas importante.",
    insightPesoLabel: "Peso",
    insightPesoText: "Da mas peso a la materia dificil o decisiva.",
    insightRotinaLabel: "Rutina",
    insightRotinaText: "Elige dias reales para no crear un plan imposible.",
    insightRevisaoLabel: "Repaso",
    insightRevisaoText: "Reserva un dia para consolidar la semana.",
    materiasLabel: "Materias y peso (dificultad/importancia)",
    removerMateriaAria: (nome) => `Quitar ${nome}`,
    addMateriaPlaceholder: "Agregar materia (ej: Fisica)",
    addButton: "Agregar",
    diasDisponiveisLabel: "Dias disponibles",
    horasPorDiaLabel: "Horas de estudio por dia",
    semanasLabel: "Duracion (semanas)",
    incluirRevisaoLabel: "Reservar el ultimo dia de la semana para repaso general",
    semanaModeloTitle: (semanas) => `Semana modelo (se repite hasta la semana ${semanas})`,
    emptyMaterias: "Agrega materias y selecciona al menos un dia de la semana.",
    copiarCronograma: "Copiar cronograma",
    enviarWhatsApp: "Enviar por WhatsApp",
    destinationHint: "WhatsApp que recibira el cronograma",
    toastCopiado: "Cronograma copiado!",
    resumoTitulo: "*CRONOGRAMA DE ESTUDIO | PLAN SEMANAL*",
    resumoSubtitulo: (semanas, horasPorDia, materias) =>
      `_${semanas} semana(s) | ${horasPorDia}h por dia | ${materias} materia(s)_`,
    resumoSemana1: "*SEMANA 1*",
    resumoRodape: "Generado automaticamente segun el peso/dificultad de cada materia.",
  },
};

export function CronogramaEstudosApp({ locale = "pt-BR" }: { locale?: Locale } = {}) {
  const t = COPY[locale];
  const diasLabel = DIAS_LABEL[locale];
  const nomesDia = NOME_DIA[locale];
  const nomeDiaLocal = (diaSemana: number) => nomesDia[diaSemana] ?? "";
  const { toast } = useToast();
  const [materias, setMaterias] = useState<Materia[]>(() => MATERIAS_INICIAIS[locale]);
  const [novaMateria, setNovaMateria] = useState("");
  const [diasSemana, setDiasSemana] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [horasPorDia, setHorasPorDia] = useState(2);
  const [semanas, setSemanas] = useState(4);
  const [incluirRevisao, setIncluirRevisao] = useState(true);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);

  const cronograma = useMemo(() => {
    if (materias.length === 0 || diasSemana.length === 0) return [];
    return gerarCronograma({
      materias,
      diasSemana,
      horasPorDia,
      semanas,
      incluirRevisao,
    });
  }, [materias, diasSemana, horasPorDia, semanas, incluirRevisao]);

  function addMateria() {
    const nome = novaMateria.trim();
    if (!nome) return;
    setMaterias((prev) => [...prev, { nome, peso: 3 }]);
    setNovaMateria("");
  }

  function removerMateria(nome: string) {
    setMaterias((prev) => prev.filter((m) => m.nome !== nome));
  }

  function atualizarPeso(nome: string, peso: number) {
    setMaterias((prev) =>
      prev.map((m) => (m.nome === nome ? { ...m, peso } : m)),
    );
  }

  function toggleDia(dia: number) {
    setDiasSemana((prev) =>
      prev.includes(dia)
        ? prev.filter((d) => d !== dia)
        : [...prev, dia].sort(),
    );
  }

  function resumoTexto() {
    if (cronograma.length === 0) return "";
    const primeiraSemana = cronograma.filter((d) => d.semana === 1);
    const linhas = primeiraSemana
      .map((dia) => {
        const sessoes = dia.sessoes
          .map((s) => `${s.materia} (${formatarMinutos(s.minutos)})`)
          .join(", ");
        return `${nomeDiaLocal(dia.diaSemana)}: ${sessoes}`;
      })
      .join("\n");
    return [
      t.resumoTitulo,
      t.resumoSubtitulo(semanas, horasPorDia, materias.length),
      "",
      t.resumoSemana1,
      linhas,
      "",
      t.resumoRodape,
    ].join("\n");
  }

  function handleCopy() {
    navigator.clipboard.writeText(resumoTexto());
    toast(t.toastCopiado);
  }

  function handleWhatsApp() {
    setWhatsAppOpen(true);
  }

  const semana1 = cronograma.filter((d) => d.semana === 1);

  return (
    <AuthGate
      title={t.authTitle}
      description={t.authDescription}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero
          title={t.heroTitle}
          subtitle={t.heroSubtitle}
          icon={CalendarDays}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <Insight
            label={t.insightPesoLabel}
            text={t.insightPesoText}
          />
          <Insight
            label={t.insightRotinaLabel}
            text={t.insightRotinaText}
          />
          <Insight
            label={t.insightRevisaoLabel}
            text={t.insightRevisaoText}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
                {t.materiasLabel}
              </p>
              <div className="space-y-2">
                {materias.map((m) => (
                  <div
                    key={m.nome}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5"
                  >
                    <span className="flex-1 truncate text-sm font-semibold text-slate-800">
                      {m.nome}
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={m.peso}
                      onChange={(e) =>
                        atualizarPeso(m.nome, Number(e.target.value))
                      }
                      className="w-24 accent-sky-600"
                    />
                    <span className="w-5 text-center text-xs font-bold text-sky-700">
                      {m.peso}
                    </span>
                    <button
                      type="button"
                      onClick={() => removerMateria(m.nome)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={t.removerMateriaAria(m.nome)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder={t.addMateriaPlaceholder}
                  value={novaMateria}
                  onChange={(e) => setNovaMateria(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMateria()}
                />
                <Button
                  variant="outline"
                  size="default"
                  onClick={addMateria}
                  icon={Plus}
                >
                  {t.addButton}
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
                {t.diasDisponiveisLabel}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {diasLabel.map((label, idx) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleDia(idx)}
                    className={cn(
                      "h-10 min-w-[3rem] rounded-xl px-3 text-xs font-bold transition",
                      diasSemana.includes(idx)
                        ? "bg-sky-600 text-white"
                        : "border border-slate-200 text-slate-500 hover:bg-slate-50",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={t.horasPorDiaLabel} htmlFor="horas-dia">
                <Input
                  id="horas-dia"
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={horasPorDia}
                  onChange={(e) =>
                    setHorasPorDia(Math.max(0.5, Number(e.target.value) || 0.5))
                  }
                />
              </FormField>
              <FormField label={t.semanasLabel} htmlFor="semanas">
                <Input
                  id="semanas"
                  type="number"
                  min={1}
                  max={24}
                  value={semanas}
                  onChange={(e) =>
                    setSemanas(
                      Math.min(24, Math.max(1, Number(e.target.value) || 1)),
                    )
                  }
                />
              </FormField>
            </div>

            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                checked={incluirRevisao}
                onChange={(e) => setIncluirRevisao(e.target.checked)}
              />
              {t.incluirRevisaoLabel}
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
            <h2 className="precisoutapronto-display mb-3 text-base font-bold text-slate-900">
              {t.semanaModeloTitle(semanas)}
            </h2>
            {semana1.length === 0 ? (
              <p className="text-sm font-medium text-slate-500">
                {t.emptyMaterias}
              </p>
            ) : (
              <div className="space-y-2">
                {semana1.map((dia) => (
                  <div
                    key={dia.diaSemana}
                    className="rounded-xl border border-slate-200 p-3"
                  >
                    <p className="text-sm font-bold text-slate-900">
                      {nomeDiaLocal(dia.diaSemana)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {dia.sessoes.map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800"
                        >
                          {s.materia} · {formatarMinutos(s.minutos)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={handleCopy}
                    icon={Copy}
                  >
                    {t.copiarCronograma}
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={handleWhatsApp}
                    icon={MessageCircle}
                  >
                    {t.enviarWhatsApp}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <WhatsAppSendModal
        open={whatsAppOpen}
        onClose={() => setWhatsAppOpen(false)}
        message={resumoTexto()}
        destinationHint={t.destinationHint}
      />
    </AuthGate>
  );
}

function Insight({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-sky-100 bg-sky-50/70 p-3 text-xs font-semibold leading-5 text-slate-700">
      <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-sky-600 px-1.5 text-[0.68rem] text-white">
        {label}
      </span>
      <span>{text}</span>
      <Sparkles
        className="ml-auto hidden h-4 w-4 shrink-0 text-sky-500 sm:block"
        aria-hidden
      />
    </div>
  );
}
