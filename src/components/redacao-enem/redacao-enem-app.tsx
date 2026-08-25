"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  GraduationCap,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { PageHero } from "@/components/shared/page-hero";
import { ToolsBackButton } from "@/components/shared/tools-back-button";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { performBillableAction } from "@/lib/billing";
import {
  analisarRedacao,
  type RedacaoAnaliseResult,
} from "@/lib/redacao-enem/analyze";
import { WhatsAppSendModal } from "@/components/whatsapp/whatsapp-send-modal";
import { ShareResult } from "@/components/shared/share-result";

type Locale = "pt-BR" | "en" | "es";

const copy = {
  "pt-BR": {
    authTitle: "Corretor de Redação ENEM",
    authDescription:
      "Cadastre-se gratuitamente para receber a estimativa da sua redação.",
    heroTitle: "Corretor de Redação ENEM",
    heroSubtitle:
      "Cole sua redação e receba uma estimativa de nota por competência, com pontos fortes e alertas para revisar antes da prova.",
    insightCompetenciasLabel: "C1-C5",
    insightCompetenciasText: "Nota estimada por competência, não só total.",
    insightRaioXLabel: "Raio-x",
    insightRaioXText: "Mostra pontos fortes e alertas de revisão.",
    insightAvisoLabel: "Aviso",
    insightAvisoText: "É uma estimativa automática, não correção humana.",
    temaLabel: "Tema da redação (opcional)",
    temaPlaceholder: "Ex: Desafios para o combate à desinformação no Brasil",
    textoLabel: "Texto da redação",
    textoHint:
      "Cole os 4-5 parágrafos separados por linha em branco, como no papel de prova.",
    textoPlaceholder: "Cole aqui o texto completo da sua redação...",
    wordCount: (n: number) => `${n} palavra(s)`,
    wordCountEmpty: "Escreva ao menos 20 palavras para analisar.",
    estimativaTitle: "Estimativa",
    emptyTitle: "Cole o texto e clique em Analisar redação.",
    emptyText:
      "Quanto mais parecido com a redação final, melhor a leitura de estrutura, coesão e intervenção. A 1ª análise é grátis sem conta.",
    analyzeBtn: "Analisar redação",
    analyzingBtn: "Analisando...",
    analyzeNeedWords: "Escreva ao menos 20 palavras para analisar.",
    analyzeBlocked: "Faça login para continuar analisando.",
    invalidTitle: "Texto sem sentido detectado",
    invalidHint:
      "Substitua o texto por parágrafos reais em português (com introdução, desenvolvimento e conclusão) para receber uma estimativa de nota por competência.",
    notaTotalLabel: "Nota estimada total",
    pontosFortesLabel: "Pontos fortes",
    pontosAtencaoLabel: "Pontos de atenção",
    disclaimer:
      "Estimativa automática baseada em heurísticas de estrutura, coesão e proposta de intervenção. Não substitui a correção humana. Use como um primeiro raio-x antes de pedir revisão de um professor.",
    copyBtn: "Copiar resultado",
    whatsappBtn: "Enviar no WhatsApp",
    whatsappDestinationHint: "WhatsApp que receberá a análise",
    toastCopied: "Resultado copiado!",
    waTitle: "REDAÇÃO ENEM | ANÁLISE ESTIMADA",
    waSubtitle: "Resultado organizado por competência",
    waTema: (tema: string) => `Tema: ${tema}`,
    waInvalidWarning:
      "⚠️ Texto não reconhecido como uma redação (sem palavras reais em português). Reescreva com frases e parágrafos com sentido para receber uma estimativa de nota.",
    waCompetenciasTitle: "COMPETÊNCIAS",
    waCompetenciaLine: (id: number, titulo: string, nota: number) =>
      `C${id} - ${titulo}: ${nota}/200`,
    waNotaTotalTitle: "NOTA TOTAL ESTIMADA",
    waDisclaimer:
      "Estimativa automática baseada em heurísticas de estrutura, coesão e proposta de intervenção. Não substitui a correção de um professor ou corretor humano do ENEM.",
  },
  en: {
    authTitle: "ENEM Essay Grader",
    authDescription:
      "Sign up for free to receive an estimate for your essay.",
    heroTitle: "ENEM Essay Grader",
    heroSubtitle:
      "Paste your essay (for the ENEM, the Brazilian university entrance exam) and get a score estimate per competency, with strengths and warnings to review before the test.",
    insightCompetenciasLabel: "C1-C5",
    insightCompetenciasText:
      "Estimated score per competency, not just the total.",
    insightRaioXLabel: "X-ray",
    insightRaioXText: "Shows strengths and points to review.",
    insightAvisoLabel: "Notice",
    insightAvisoText: "This is an automatic estimate, not human grading.",
    temaLabel: "Essay topic (optional)",
    temaPlaceholder: "Ex: Challenges to fighting misinformation in Brazil",
    textoLabel: "Essay text",
    textoHint:
      "Paste the 4 to 5 paragraphs separated by a blank line, like on the exam paper.",
    textoPlaceholder: "Paste the full text of your essay here...",
    wordCount: (n: number) => `${n} word(s)`,
    wordCountEmpty: "Write at least 20 words to analyze.",
    estimativaTitle: "Estimate",
    emptyTitle: "Paste your text and click Analyze essay.",
    emptyText:
      "The closer to a final essay, the better the reading of structure, cohesion and intervention proposal. The first analysis is free without an account.",
    analyzeBtn: "Analyze essay",
    analyzingBtn: "Analyzing...",
    analyzeNeedWords: "Write at least 20 words to analyze.",
    analyzeBlocked: "Sign in to keep analyzing.",
    invalidTitle: "Nonsensical text detected",
    invalidHint:
      "Replace the text with real paragraphs (with introduction, body and conclusion) to receive a score estimate per competency.",
    notaTotalLabel: "Total estimated score",
    pontosFortesLabel: "Strengths",
    pontosAtencaoLabel: "Points to review",
    disclaimer:
      "Automatic estimate based on heuristics of structure, cohesion and intervention proposal. It does not replace human grading. Use it as a first check before asking a teacher for review.",
    copyBtn: "Copy result",
    whatsappBtn: "Send on WhatsApp",
    whatsappDestinationHint: "WhatsApp number that will receive the analysis",
    toastCopied: "Result copied!",
    waTitle: "ENEM ESSAY | ESTIMATED ANALYSIS",
    waSubtitle: "Result organized by competency",
    waTema: (tema: string) => `Topic: ${tema}`,
    waInvalidWarning:
      "⚠️ Text not recognized as an essay (no real words found). Rewrite it with meaningful sentences and paragraphs to receive a score estimate.",
    waCompetenciasTitle: "COMPETENCIES",
    waCompetenciaLine: (id: number, titulo: string, nota: number) =>
      `C${id} - ${titulo}: ${nota}/200`,
    waNotaTotalTitle: "TOTAL ESTIMATED SCORE",
    waDisclaimer:
      "Automatic estimate based on heuristics of structure, cohesion and intervention proposal. It does not replace a teacher or a human ENEM grader.",
  },
  es: {
    authTitle: "Corrector de Redacción ENEM",
    authDescription:
      "Regístrate gratis para recibir la estimación de tu redacción.",
    heroTitle: "Corrector de Redacción ENEM",
    heroSubtitle:
      "Pega tu redacción (para el ENEM, el examen de ingreso a la universidad de Brasil) y recibe una estimación de nota por competencia, con puntos fuertes y alertas para revisar antes de la prueba.",
    insightCompetenciasLabel: "C1-C5",
    insightCompetenciasText: "Nota estimada por competencia, no solo el total.",
    insightRaioXLabel: "Radiografía",
    insightRaioXText: "Muestra puntos fuertes y alertas de revisión.",
    insightAvisoLabel: "Aviso",
    insightAvisoText: "Es una estimación automática, no una corrección humana.",
    temaLabel: "Tema de la redacción (opcional)",
    temaPlaceholder: "Ej: Desafíos para combatir la desinformación en Brasil",
    textoLabel: "Texto de la redacción",
    textoHint:
      "Pega los 4 a 5 párrafos separados por una línea en blanco, como en la hoja de prueba.",
    textoPlaceholder: "Pega aquí el texto completo de tu redacción...",
    wordCount: (n: number) => `${n} palabra(s)`,
    wordCountEmpty: "Escribe al menos 20 palabras para analizar.",
    estimativaTitle: "Estimación",
    emptyTitle: "Pega el texto y haz clic en Analizar redacción.",
    emptyText:
      "Cuanto más se parezca a la redacción final, mejor será la lectura de estructura, cohesión e intervención. El primer análisis es gratis sin cuenta.",
    analyzeBtn: "Analizar redacción",
    analyzingBtn: "Analizando...",
    analyzeNeedWords: "Escribe al menos 20 palabras para analizar.",
    analyzeBlocked: "Inicia sesión para seguir analizando.",
    invalidTitle: "Texto sin sentido detectado",
    invalidHint:
      "Reemplaza el texto por párrafos reales (con introducción, desarrollo y conclusión) para recibir una estimación de nota por competencia.",
    notaTotalLabel: "Nota total estimada",
    pontosFortesLabel: "Puntos fuertes",
    pontosAtencaoLabel: "Puntos de atención",
    disclaimer:
      "Estimación automática basada en heurísticas de estructura, cohesión y propuesta de intervención. No sustituye la corrección humana. Úsala como una primera revisión antes de pedirle una corrección a un profesor.",
    copyBtn: "Copiar resultado",
    whatsappBtn: "Enviar por WhatsApp",
    whatsappDestinationHint: "Número de WhatsApp que recibirá el análisis",
    toastCopied: "¡Resultado copiado!",
    waTitle: "REDACCIÓN ENEM | ANÁLISIS ESTIMADO",
    waSubtitle: "Resultado organizado por competencia",
    waTema: (tema: string) => `Tema: ${tema}`,
    waInvalidWarning:
      "⚠️ Texto no reconocido como una redacción (sin palabras reales). Reescríbelo con frases y párrafos con sentido para recibir una estimación de nota.",
    waCompetenciasTitle: "COMPETENCIAS",
    waCompetenciaLine: (id: number, titulo: string, nota: number) =>
      `C${id} - ${titulo}: ${nota}/200`,
    waNotaTotalTitle: "NOTA TOTAL ESTIMADA",
    waDisclaimer:
      "Estimación automática basada en heurísticas de estructura, cohesión y propuesta de intervención. No sustituye la corrección de un profesor o un corrector humano del ENEM.",
  },
} as const satisfies Record<Locale, Record<string, unknown>>;

export function RedacaoEnemApp({ locale = "pt-BR" }: { locale?: Locale } = {}) {
  const t = copy[locale];
  const { toast } = useToast();
  const [tema, setTema] = useState("");
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<RedacaoAnaliseResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);

  const wordCount = texto.trim().split(/\s+/).filter(Boolean).length;

  function handleTextoChange(value: string) {
    setTexto(value);
    setResultado(null);
    setAnalyzeError("");
  }

  async function handleAnalyze() {
    setAnalyzeError("");
    if (wordCount < 20) {
      setAnalyzeError(t.analyzeNeedWords);
      return;
    }

    setAnalyzing(true);
    try {
      const outcome = await performBillableAction(
        {
          toolId: "redacao-enem",
          artifactId: `redacao_${Date.now()}`,
          action: "analyze",
        },
        () => analisarRedacao(texto)
      );
      if (!outcome.allowed) {
        setAnalyzeError(outcome.reason || t.analyzeBlocked);
        return;
      }
      if (outcome.result) {
        setResultado(outcome.result);
      }
    } catch (error) {
      setAnalyzeError(
        error instanceof Error ? error.message : t.analyzeBlocked
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function resumoTexto() {
    if (!resultado) return "";
    if (resultado.textoInvalido) {
      return [
        `*${t.waTitle}*`,
        tema ? t.waTema(tema) : "",
        "",
        t.waInvalidWarning,
      ]
        .filter(Boolean)
        .join("\n");
    }
    const linhas = resultado.competencias
      .map((c) => t.waCompetenciaLine(c.id, c.titulo, c.nota))
      .join("\n");
    return [
      `*${t.waTitle}*`,
      `_${t.waSubtitle}_`,
      tema ? t.waTema(tema) : "",
      "",
      `*${t.waCompetenciasTitle}*`,
      linhas,
      "",
      `*${t.waNotaTotalTitle}*`,
      `${resultado.notaTotalEstimada}/1000`,
      "",
      t.waDisclaimer,
    ]
      .filter(Boolean)
      .join("\n");
  }

  function handleCopy() {
    navigator.clipboard.writeText(resumoTexto());
    toast(t.toastCopied);
  }

  function handleWhatsApp() {
    setWhatsAppOpen(true);
  }

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
          icon={GraduationCap}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <Insight
            label={t.insightCompetenciasLabel}
            text={t.insightCompetenciasText}
          />
          <Insight
            label={t.insightRaioXLabel}
            text={t.insightRaioXText}
          />
          <Insight
            label={t.insightAvisoLabel}
            text={t.insightAvisoText}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <FormField label={t.temaLabel} htmlFor="tema">
              <Input
                id="tema"
                placeholder={t.temaPlaceholder}
                value={tema}
                onChange={(e) => setTema(e.target.value)}
              />
            </FormField>

            <FormField
              label={t.textoLabel}
              htmlFor="texto"
              required
              hint={t.textoHint}
            >
              <textarea
                id="texto"
                value={texto}
                onChange={(e) => handleTextoChange(e.target.value)}
                placeholder={t.textoPlaceholder}
                rows={16}
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all duration-150 placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </FormField>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                {texto.trim() ? t.wordCount(wordCount) : t.wordCountEmpty}
              </p>
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing || wordCount < 20}
                className="w-full bg-sky-600 text-white hover:bg-sky-500 sm:w-auto"
                icon={Sparkles}
              >
                {analyzing ? t.analyzingBtn : t.analyzeBtn}
              </Button>
            </div>
            {analyzeError ? (
              <p className="text-sm font-medium text-red-600">{analyzeError}</p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
            <h2 className="precisoutapronto-display mb-3 text-base font-bold text-slate-900">
              {t.estimativaTitle}
            </h2>
            {!resultado ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800">
                  {t.emptyTitle}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {t.emptyText}
                </p>
              </div>
            ) : resultado.textoInvalido ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
                  <AlertTriangle
                    className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-bold text-red-800">
                      {t.invalidTitle}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-red-700">
                      {resultado.avisoCritico}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
                  <span className="text-sm font-semibold">
                    {t.notaTotalLabel}
                  </span>
                  <span className="precisoutapronto-display text-lg font-bold">
                    {resultado.notaTotalEstimada}/1000
                  </span>
                </div>

                <ul className="space-y-2">
                  {resultado.competencias.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800">
                          C{c.id} · {c.titulo}
                        </p>
                        <span className="precisoutapronto-display text-sm font-bold text-sky-700">
                          {c.nota}/200
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-sky-500"
                          style={{ width: `${(c.nota / 200) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{c.comentario}</p>
                    </li>
                  ))}
                </ul>

                {resultado.alertas.length > 0 ? (
                  <div className="space-y-1.5 rounded-xl bg-amber-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-900">
                      {t.pontosAtencaoLabel}
                    </p>
                    {resultado.alertas.map((a, i) => (
                      <p
                        key={i}
                        className="flex items-start gap-1.5 text-xs font-medium text-amber-900"
                      >
                        <AlertTriangle
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          aria-hidden
                        />
                        {a}
                      </p>
                    ))}
                  </div>
                ) : null}

                <p className="text-xs leading-5 text-slate-500">
                  {t.invalidHint}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
                  <span className="text-sm font-semibold">
                    {t.notaTotalLabel}
                  </span>
                  <span className="precisoutapronto-display text-lg font-bold">
                    {resultado.notaTotalEstimada}/1000
                  </span>
                </div>

                <ul className="space-y-2">
                  {resultado.competencias.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800">
                          C{c.id} · {c.titulo}
                        </p>
                        <span className="precisoutapronto-display text-sm font-bold text-sky-700">
                          {c.nota}/200
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-sky-500"
                          style={{ width: `${(c.nota / 200) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {c.comentario}
                      </p>
                    </li>
                  ))}
                </ul>

                {resultado.pontosFortes.length > 0 ? (
                  <div className="space-y-1.5 rounded-xl bg-emerald-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                      {t.pontosFortesLabel}
                    </p>
                    {resultado.pontosFortes.map((p, i) => (
                      <p
                        key={i}
                        className="flex items-start gap-1.5 text-xs font-medium text-emerald-800"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          aria-hidden
                        />
                        {p}
                      </p>
                    ))}
                  </div>
                ) : null}

                {resultado.alertas.length > 0 ? (
                  <div className="space-y-1.5 rounded-xl bg-amber-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-900">
                      {t.pontosAtencaoLabel}
                    </p>
                    {resultado.alertas.map((a, i) => (
                      <p
                        key={i}
                        className="flex items-start gap-1.5 text-xs font-medium text-amber-900"
                      >
                        <AlertTriangle
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          aria-hidden
                        />
                        {a}
                      </p>
                    ))}
                  </div>
                ) : null}

                <p className="text-xs leading-5 text-slate-500">
                  {t.disclaimer}
                </p>

                <ShareResult
                  tool="enem"
                  title={`Minha redação ficou em ${resultado.notaTotalEstimada}/1000`}
                  subtitle="Quanto você tiraria?"
                  lines={[
                    { label: t.notaTotalLabel, value: `${resultado.notaTotalEstimada}/1000`, emphasis: true },
                    ...resultado.competencias.map((c) => ({ label: `C${c.id}`, value: `${c.nota}/200` })),
                  ]}
                  whatsappText={`Tirei ${resultado.notaTotalEstimada} nessa redação 👀\nQuero ver quanto você faz.`}
                />

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={handleCopy}
                    icon={Copy}
                  >
                    {t.copyBtn}
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={handleWhatsApp}
                    icon={MessageCircle}
                  >
                    {t.whatsappBtn}
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
        destinationHint={t.whatsappDestinationHint}
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
