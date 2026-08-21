"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Copy,
  MessageCircle,
  Scale,
  Sparkles,
} from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { PageHero } from "@/components/shared/page-hero";
import { ToolsBackButton } from "@/components/shared/tools-back-button";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrency,
} from "@/lib/formatters";
import {
  FAIXA_MEI_LABEL,
  simularClt,
  simularMei,
  type FaixaMei,
} from "@/lib/mei-vs-clt/calc";
import { cn } from "@/lib/utils";
import { viralToolShareUrl } from "@/lib/viral-loop";
import { ResultShareCard } from "@/components/shared/result-share-card";
import { ShareResult } from "@/components/shared/share-result";
import { trackEvent } from "@/lib/analytics";
import { WhatsAppSendModal } from "@/components/whatsapp/whatsapp-send-modal";
import { buildStructuredWhatsAppMessage } from "@/lib/whatsapp/message-format";

type Locale = "pt-BR" | "en" | "es";

const FAIXAS: FaixaMei[] = [
  "comercio-industria",
  "servicos",
  "comercio-e-servicos",
];

const FAIXA_LABEL_BY_LOCALE: Record<Locale, Record<FaixaMei, string>> = {
  "pt-BR": FAIXA_MEI_LABEL,
  en: {
    "comercio-industria": "Retail or industry",
    servicos: "Services",
    "comercio-e-servicos": "Combined retail and services",
  },
  es: {
    "comercio-industria": "Comercio o industria",
    servicos: "Servicios",
    "comercio-e-servicos": "Comercio y servicios combinados",
  },
};

const copy = {
  "pt-BR": {
    authTitle: "Simulador MEI vs CLT",
    authDescription: "Cadastre-se gratuitamente para comparar os dois cenários.",
    heroTitle: "MEI vs CLT: qual compensa mais?",
    heroSubtitle:
      "Compare o líquido mensal como CLT com o lucro estimado como MEI para decidir com números, não com achismo.",
    insightCltLabel: "CLT",
    insightCltText: "Mostra líquido real, descontos e média com 13º/férias.",
    insightMeiLabel: "MEI",
    insightMeiText: "Considera DAS, custos e limite anual do MEI.",
    insightDecisaoLabel: "Decisão",
    insightDecisaoText: "Compare dinheiro, risco, benefícios e estabilidade.",
    cltSectionTitle: "Cenário CLT",
    salarioCltLabel: "Salário bruto mensal",
    dependentesLabel: "Dependentes (IR)",
    vtLabel: "Vale-transporte (mensal)",
    planoLabel: "Plano de saúde (desconto mensal)",
    inssLabel: "INSS",
    irrfLabel: "IRRF",
    vtDescontoLabel: "Vale-transporte",
    planoDescontoLabel: "Plano de saúde",
    fgtsLabel: "FGTS depositado (não é líquido, fica retido)",
    liquidoMensalLabel: "Líquido mensal (mês normal)",
    liquidoMedioLabel: "Líquido médio com 13º/férias diluídos",
    meiSectionTitle: "Cenário MEI",
    faturamentoLabel: "Faturamento mensal estimado",
    atividadeLabel: "Atividade",
    custosLabel: "Custos mensais do negócio",
    custosHint: "Materiais, ferramentas, transporte, aluguel, etc.",
    dasLabel: "DAS (imposto mensal MEI)",
    custosNegocioLabel: "Custos do negócio",
    lucroLiquidoLabel: "Lucro líquido mensal",
    limiteWarning:
      "Faturamento anual projetado ultrapassa o limite do MEI (R$ 81.000/ano). Considere migrar para ME/Simples Nacional.",
    lockedTitle:
      "Comparativo liberado quando os dois cenários estiverem preenchidos.",
    lockedText:
      "Informe salário CLT e faturamento MEI para ver quem compensa mais no mês.",
    comparativoTitle: "Comparativo",
    cltMedioLabel: "CLT (médio/mês)",
    meiLucroLabel: "MEI (lucro/mês)",
    meiWins: (value: string) =>
      `Como MEI, ~${value} a mais por mês nesse cenário.`,
    cltWins: (value: string) =>
      `Como CLT, ~${value} a mais por mês nesse cenário.`,
    disclaimerComparativo:
      "Simulação educativa: não considera FGTS acumulado, estabilidade, benefícios, 13º/férias do MEI (não existem) nem custos de abertura/fechamento. Consulte um contador antes de decidir.",
    copyBtn: "Copiar comparativo",
    whatsappBtn: "Enviar no WhatsApp",
    shareEyebrow: "MEI vs CLT",
    shareTitle: "Qual compensa mais pra você",
    shareHighlightMei: "MEI ganha por mês",
    shareHighlightClt: "CLT ganha por mês",
    shareLineClt: "CLT (líquido/mês)",
    shareLineMei: "MEI (lucro/mês)",
    whatsappDestinationHint: "WhatsApp que receberá o comparativo",
    toastCopied: "Comparativo copiado!",
    waTitle: "MEI OU CLT | COMPARATIVO",
    waSubtitle: "Resumo organizado da sua simulação",
    waSectionClt: "CENÁRIO CLT",
    waLiquidoMedio: (value: string) => `Líquido mensal médio: ${value}`,
    wa13Ferias: "13º e férias considerados na média",
    waSectionMei: "CENÁRIO MEI",
    waLucroEstimado: (value: string) =>
      `Lucro líquido mensal estimado: ${value}`,
    waAcimaLimite: "Faturamento projetado acima do limite anual do MEI",
    waDentroLimite: "Faturamento dentro do limite anual informado",
    waSectionComparacao: "COMPARAÇÃO",
    waMeiAcima: (value: string) =>
      `MEI fica ${value} acima por mês neste cenário`,
    waCltAcima: (value: string) =>
      `CLT fica ${value} acima por mês neste cenário`,
    waNotice:
      "Estimativa educativa. Benefícios, FGTS, estabilidade e custos de formalização também devem ser avaliados com um contador.",
    waActionLabel: "SIMULE O SEU CENÁRIO",
  },
  en: {
    authTitle: "MEI vs CLT simulator",
    authDescription: "Sign up for free to compare both scenarios.",
    heroTitle: "MEI vs CLT: which one pays off more?",
    heroSubtitle:
      "Compare your monthly net pay as a CLT employee with the estimated profit as an MEI (Brazilian individual micro-entrepreneur) to decide with numbers, not guesswork.",
    insightCltLabel: "CLT",
    insightCltText:
      "Shows real net pay, deductions and the average with 13th salary/vacation.",
    insightMeiLabel: "MEI",
    insightMeiText: "Considers the DAS tax, costs and the MEI annual limit.",
    insightDecisaoLabel: "Decision",
    insightDecisaoText: "Compare money, risk, benefits and job stability.",
    cltSectionTitle: "CLT scenario",
    salarioCltLabel: "Gross monthly salary",
    dependentesLabel: "Dependents (income tax)",
    vtLabel: "Transportation voucher (monthly)",
    planoLabel: "Health plan (monthly deduction)",
    inssLabel: "INSS (social security)",
    irrfLabel: "IRRF (income tax withholding)",
    vtDescontoLabel: "Transportation voucher",
    planoDescontoLabel: "Health plan",
    fgtsLabel: "FGTS deposited (not net pay, it stays held)",
    liquidoMensalLabel: "Net monthly pay (regular month)",
    liquidoMedioLabel: "Average net pay with 13th salary/vacation diluted",
    meiSectionTitle: "MEI scenario",
    faturamentoLabel: "Estimated monthly revenue",
    atividadeLabel: "Activity",
    custosLabel: "Monthly business costs",
    custosHint: "Materials, tools, transportation, rent, etc.",
    dasLabel: "DAS (MEI monthly tax)",
    custosNegocioLabel: "Business costs",
    lucroLiquidoLabel: "Net monthly profit",
    limiteWarning:
      "Projected annual revenue goes over the MEI limit (R$ 81,000/year). Consider migrating to ME/Simples Nacional.",
    lockedTitle: "The comparison unlocks once both scenarios are filled in.",
    lockedText:
      "Enter your CLT salary and MEI revenue to see which one pays off more per month.",
    comparativoTitle: "Comparison",
    cltMedioLabel: "CLT (average/month)",
    meiLucroLabel: "MEI (profit/month)",
    meiWins: (value: string) =>
      `As an MEI, about ${value} more per month in this scenario.`,
    cltWins: (value: string) =>
      `As a CLT employee, about ${value} more per month in this scenario.`,
    disclaimerComparativo:
      "Educational simulation: it does not consider accumulated FGTS, job stability, benefits, MEI 13th salary/vacation (they do not exist for MEIs) or opening/closing costs. Consult an accountant before deciding.",
    copyBtn: "Copy comparison",
    whatsappBtn: "Send on WhatsApp",
    shareEyebrow: "MEI vs CLT",
    shareTitle: "Which one pays off more for you",
    shareHighlightMei: "MEI wins per month",
    shareHighlightClt: "CLT wins per month",
    shareLineClt: "CLT (net/month)",
    shareLineMei: "MEI (profit/month)",
    whatsappDestinationHint: "WhatsApp number that will receive the comparison",
    toastCopied: "Comparison copied!",
    waTitle: "MEI VS CLT | COMPARISON",
    waSubtitle: "Organized summary of your simulation",
    waSectionClt: "CLT SCENARIO",
    waLiquidoMedio: (value: string) => `Average net monthly pay: ${value}`,
    wa13Ferias: "13th salary and vacation included in the average",
    waSectionMei: "MEI SCENARIO",
    waLucroEstimado: (value: string) =>
      `Estimated net monthly profit: ${value}`,
    waAcimaLimite: "Projected revenue above the MEI annual limit",
    waDentroLimite: "Revenue within the informed annual limit",
    waSectionComparacao: "COMPARISON",
    waMeiAcima: (value: string) =>
      `MEI is ${value} higher per month in this scenario`,
    waCltAcima: (value: string) =>
      `CLT is ${value} higher per month in this scenario`,
    waNotice:
      "Educational estimate. Benefits, FGTS, job stability and formalization costs should also be evaluated with an accountant.",
    waActionLabel: "SIMULATE YOUR SCENARIO",
  },
  es: {
    authTitle: "Simulador MEI vs CLT",
    authDescription: "Regístrate gratis para comparar los dos escenarios.",
    heroTitle: "MEI vs CLT: ¿qué conviene más?",
    heroSubtitle:
      "Compara el neto mensual como empleado CLT con la ganancia estimada como MEI (microempresario individual brasileño) para decidir con números, no con suposiciones.",
    insightCltLabel: "CLT",
    insightCltText:
      "Muestra el neto real, los descuentos y el promedio con aguinaldo/vacaciones.",
    insightMeiLabel: "MEI",
    insightMeiText: "Considera el DAS, los costos y el límite anual del MEI.",
    insightDecisaoLabel: "Decisión",
    insightDecisaoText: "Compara dinero, riesgo, beneficios y estabilidad.",
    cltSectionTitle: "Escenario CLT",
    salarioCltLabel: "Salario bruto mensual",
    dependentesLabel: "Dependientes (impuesto a la renta)",
    vtLabel: "Vale transporte (mensual)",
    planoLabel: "Plan de salud (descuento mensual)",
    inssLabel: "INSS (seguridad social)",
    irrfLabel: "IRRF (retención del impuesto a la renta)",
    vtDescontoLabel: "Vale transporte",
    planoDescontoLabel: "Plan de salud",
    fgtsLabel: "FGTS depositado (no es neto, queda retenido)",
    liquidoMensalLabel: "Neto mensual (mes normal)",
    liquidoMedioLabel: "Neto promedio con aguinaldo/vacaciones diluidos",
    meiSectionTitle: "Escenario MEI",
    faturamentoLabel: "Facturación mensual estimada",
    atividadeLabel: "Actividad",
    custosLabel: "Costos mensuales del negocio",
    custosHint: "Materiales, herramientas, transporte, alquiler, etc.",
    dasLabel: "DAS (impuesto mensual del MEI)",
    custosNegocioLabel: "Costos del negocio",
    lucroLiquidoLabel: "Ganancia neta mensual",
    limiteWarning:
      "La facturación anual proyectada supera el límite del MEI (R$ 81.000/año). Considera migrar a ME/Simples Nacional.",
    lockedTitle:
      "La comparación se desbloquea cuando completes los dos escenarios.",
    lockedText:
      "Ingresa el salario CLT y la facturación MEI para ver qué conviene más por mes.",
    comparativoTitle: "Comparación",
    cltMedioLabel: "CLT (promedio/mes)",
    meiLucroLabel: "MEI (ganancia/mes)",
    meiWins: (value: string) =>
      `Como MEI, cerca de ${value} más por mes en este escenario.`,
    cltWins: (value: string) =>
      `Como CLT, cerca de ${value} más por mes en este escenario.`,
    disclaimerComparativo:
      "Simulación educativa. No considera el FGTS acumulado, la estabilidad, los beneficios, el aguinaldo/vacaciones del MEI (no existen para el MEI) ni los costos de apertura o cierre. Consulta a un contador antes de decidir.",
    copyBtn: "Copiar comparación",
    whatsappBtn: "Enviar por WhatsApp",
    shareEyebrow: "MEI vs CLT",
    shareTitle: "Qué conviene más para ti",
    shareHighlightMei: "MEI gana por mes",
    shareHighlightClt: "CLT gana por mes",
    shareLineClt: "CLT (neto/mes)",
    shareLineMei: "MEI (ganancia/mes)",
    whatsappDestinationHint: "Número de WhatsApp que recibirá la comparación",
    toastCopied: "¡Comparación copiada!",
    waTitle: "MEI VS CLT | COMPARACIÓN",
    waSubtitle: "Resumen organizado de tu simulación",
    waSectionClt: "ESCENARIO CLT",
    waLiquidoMedio: (value: string) => `Neto mensual promedio: ${value}`,
    wa13Ferias: "Aguinaldo y vacaciones considerados en el promedio",
    waSectionMei: "ESCENARIO MEI",
    waLucroEstimado: (value: string) =>
      `Ganancia neta mensual estimada: ${value}`,
    waAcimaLimite: "Facturación proyectada por encima del límite anual del MEI",
    waDentroLimite: "Facturación dentro del límite anual informado",
    waSectionComparacao: "COMPARACIÓN",
    waMeiAcima: (value: string) =>
      `MEI queda ${value} por encima por mes en este escenario`,
    waCltAcima: (value: string) =>
      `CLT queda ${value} por encima por mes en este escenario`,
    waNotice:
      "Estimación educativa. Los beneficios, el FGTS, la estabilidad y los costos de formalización también deben evaluarse con un contador.",
    waActionLabel: "SIMULA TU ESCENARIO",
  },
} as const satisfies Record<Locale, Record<string, unknown>>;

export function MeiVsCltApp({
  publicAccess = false,
  locale = "pt-BR",
}: { publicAccess?: boolean; locale?: Locale } = {}) {
  const t = copy[locale];
  const { toast } = useToast();
  const [salarioCltInput, setSalarioCltInput] = useState("");
  const [dependentes, setDependentes] = useState(0);
  const [vtInput, setVtInput] = useState("");
  const [planoInput, setPlanoInput] = useState("");

  const [faturamentoInput, setFaturamentoInput] = useState("");
  const [faixa, setFaixa] = useState<FaixaMei>("servicos");
  const [custosInput, setCustosInput] = useState("");
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);

  const salarioClt = parseCurrency(salarioCltInput);
  const vt = parseCurrency(vtInput);
  const plano = parseCurrency(planoInput);
  const faturamento = parseCurrency(faturamentoInput);
  const custos = parseCurrency(custosInput);

  const resultadoClt = useMemo(() => {
    if (salarioClt <= 0) return null;
    return simularClt({
      salarioBruto: salarioClt,
      dependentes,
      valeTransporte: vt,
      planoSaude: plano,
    });
  }, [salarioClt, dependentes, vt, plano]);

  const resultadoMei = useMemo(() => {
    if (faturamento <= 0) return null;
    return simularMei({
      faturamentoMensal: faturamento,
      faixa,
      custosMensais: custos,
    });
  }, [faturamento, faixa, custos]);

  const diferenca =
    resultadoClt && resultadoMei
      ? resultadoMei.lucroLiquido - resultadoClt.liquidoMensalEquivalente
      : null;

  function resumoTexto() {
    if (!resultadoClt || !resultadoMei) return "";
    const comparacao = resultadoMei.lucroLiquido - resultadoClt.liquidoMensalEquivalente;
    return buildStructuredWhatsAppMessage({
      title: t.waTitle,
      subtitle: t.waSubtitle,
      sections: [
        {
          title: t.waSectionClt,
          lines: [
            t.waLiquidoMedio(formatCurrency(resultadoClt.liquidoMensalEquivalente)),
            t.wa13Ferias,
          ],
        },
        {
          title: t.waSectionMei,
          lines: [
            t.waLucroEstimado(formatCurrency(resultadoMei.lucroLiquido)),
            resultadoMei.ultrapassaLimite ? t.waAcimaLimite : t.waDentroLimite,
          ],
        },
        {
          title: t.waSectionComparacao,
          lines: [
            comparacao >= 0
              ? t.waMeiAcima(formatCurrency(comparacao))
              : t.waCltAcima(formatCurrency(Math.abs(comparacao))),
          ],
        },
      ],
      notice: t.waNotice,
      actionLabel: t.waActionLabel,
      actionUrl: viralToolShareUrl("/mei-ou-clt", "mei_clt_whatsapp"),
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(resumoTexto());
    trackEvent("share_result", {
      method: "copy",
      tool_path: "/mei-ou-clt",
      campaign: "mei_clt_whatsapp",
    });
    toast(t.toastCopied);
  }

  function handleWhatsApp() {
    trackEvent("share_result", {
      method: "whatsapp",
      tool_path: "/mei-ou-clt",
      campaign: "mei_clt_whatsapp",
    });
    setWhatsAppOpen(true);
  }

  return (
    <AuthGate
      title={t.authTitle}
      description={t.authDescription}
      publicAccess={publicAccess}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton href={publicAccess ? "/recursos" : "/ferramentas"} />
        </div>

        <PageHero
          title={t.heroTitle}
          subtitle={t.heroSubtitle}
          icon={Scale}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <Insight
            label={t.insightCltLabel}
            text={t.insightCltText}
          />
          <Insight
            label={t.insightMeiLabel}
            text={t.insightMeiText}
          />
          <Insight
            label={t.insightDecisaoLabel}
            text={t.insightDecisaoText}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="rj-display text-base font-bold text-slate-900">
              {t.cltSectionTitle}
            </h2>
            <FormField
              label={t.salarioCltLabel}
              htmlFor="salario-clt"
              required
            >
              <Input
                id="salario-clt"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={salarioCltInput}
                onChange={(e) =>
                  setSalarioCltInput(formatCurrencyInput(e.target.value))
                }
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={t.dependentesLabel} htmlFor="dependentes">
                <Input
                  id="dependentes"
                  type="number"
                  min={0}
                  value={dependentes}
                  onChange={(e) =>
                    setDependentes(Math.max(0, Number(e.target.value) || 0))
                  }
                />
              </FormField>
              <FormField label={t.vtLabel} htmlFor="vt">
                <Input
                  id="vt"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={vtInput}
                  onChange={(e) =>
                    setVtInput(formatCurrencyInput(e.target.value))
                  }
                />
              </FormField>
            </div>
            <FormField label={t.planoLabel} htmlFor="plano">
              <Input
                id="plano"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={planoInput}
                onChange={(e) =>
                  setPlanoInput(formatCurrencyInput(e.target.value))
                }
              />
            </FormField>

            {resultadoClt ? (
              <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
                <Row label={t.inssLabel} value={resultadoClt.inss} />
                <Row label={t.irrfLabel} value={resultadoClt.irrf} />
                <Row label={t.vtDescontoLabel} value={resultadoClt.descontoVt} />
                <Row label={t.planoDescontoLabel} value={resultadoClt.planoSaude} />
                <Row
                  label={t.fgtsLabel}
                  value={resultadoClt.fgtsMensal}
                  muted
                />
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                  <span>{t.liquidoMensalLabel}</span>
                  <span>{formatCurrency(resultadoClt.salarioLiquido)}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-emerald-700">
                  <span>{t.liquidoMedioLabel}</span>
                  <span>
                    {formatCurrency(resultadoClt.liquidoMensalEquivalente)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="rj-display text-base font-bold text-slate-900">
              {t.meiSectionTitle}
            </h2>
            <FormField
              label={t.faturamentoLabel}
              htmlFor="faturamento"
              required
            >
              <Input
                id="faturamento"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={faturamentoInput}
                onChange={(e) =>
                  setFaturamentoInput(formatCurrencyInput(e.target.value))
                }
              />
            </FormField>
            <FormField label={t.atividadeLabel} htmlFor="faixa">
              <Select
                id="faixa"
                value={faixa}
                onChange={(e) => setFaixa(e.target.value as FaixaMei)}
              >
                {FAIXAS.map((f) => (
                  <option key={f} value={f}>
                    {FAIXA_LABEL_BY_LOCALE[locale][f]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField
              label={t.custosLabel}
              htmlFor="custos"
              hint={t.custosHint}
            >
              <Input
                id="custos"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={custosInput}
                onChange={(e) =>
                  setCustosInput(formatCurrencyInput(e.target.value))
                }
              />
            </FormField>

            {resultadoMei ? (
              <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
                <Row
                  label={t.dasLabel}
                  value={resultadoMei.das}
                />
                <Row
                  label={t.custosNegocioLabel}
                  value={resultadoMei.custosMensais}
                />
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 font-bold text-emerald-700">
                  <span>{t.lucroLiquidoLabel}</span>
                  <span>{formatCurrency(resultadoMei.lucroLiquido)}</span>
                </div>
                {resultadoMei.ultrapassaLimite ? (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs font-semibold text-amber-900">
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden
                    />
                    {t.limiteWarning}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          {!resultadoClt || !resultadoMei ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800">
                {t.lockedTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {t.lockedText}
              </p>
            </div>
          ) : (
            <>
              <h2 className="rj-display mb-3 text-base font-bold text-slate-900">
                {t.comparativoTitle}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t.cltMedioLabel}
                  </p>
                  <p className="rj-display mt-1 text-xl font-bold text-slate-900">
                    {formatCurrency(resultadoClt.liquidoMensalEquivalente)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t.meiLucroLabel}
                  </p>
                  <p className="rj-display mt-1 text-xl font-bold text-slate-900">
                    {formatCurrency(resultadoMei.lucroLiquido)}
                  </p>
                </div>
              </div>

              {diferenca !== null ? (
                <p
                  className={cn(
                    "mt-3 rounded-xl px-4 py-3 text-center text-sm font-bold",
                    diferenca >= 0
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-sky-50 text-sky-800",
                  )}
                >
                  {diferenca >= 0
                    ? t.meiWins(formatCurrency(diferenca))
                    : t.cltWins(formatCurrency(Math.abs(diferenca)))}
                </p>
              ) : null}

              <p className="mt-3 text-xs leading-5 text-slate-500">
                {t.disclaimerComparativo}
              </p>

              <div className="mt-3">
                <ShareResult
                  tool="mei_clt"
                  title={t.shareTitle}
                  subtitle={
                    (diferenca ?? 0) >= 0
                      ? t.meiWins(formatCurrency(diferenca ?? 0))
                      : t.cltWins(formatCurrency(Math.abs(diferenca ?? 0)))
                  }
                  lines={[
                    { label: t.shareLineClt, value: formatCurrency(resultadoClt.liquidoMensalEquivalente) },
                    { label: t.shareLineMei, value: formatCurrency(resultadoMei.lucroLiquido) },
                    { label: (diferenca ?? 0) >= 0 ? t.shareHighlightMei : t.shareHighlightClt, value: formatCurrency(Math.abs(diferenca ?? 0)), emphasis: true },
                  ]}
                  whatsappText={resumoTexto()}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
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

              <div className="mt-3">
                <ResultShareCard
                  eyebrow={t.shareEyebrow}
                  title={t.shareTitle}
                  highlightLabel={
                    diferenca !== null && diferenca >= 0
                      ? t.shareHighlightMei
                      : t.shareHighlightClt
                  }
                  highlightValue={
                    diferenca !== null
                      ? formatCurrency(Math.abs(diferenca))
                      : "-"
                  }
                  lines={[
                    { label: t.shareLineClt, value: formatCurrency(resultadoClt.liquidoMensalEquivalente) },
                    { label: t.shareLineMei, value: formatCurrency(resultadoMei.lucroLiquido) },
                  ]}
                  toolPath="/mei-ou-clt"
                  utmCampaign="mei_clt_card"
                  fileNameHint="mei-vs-clt"
                />
              </div>
            </>
          )}
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

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        muted && "text-slate-500",
      )}
    >
      <span className="font-medium">{label}</span>
      <span className="font-bold">{formatCurrency(value)}</span>
    </div>
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
