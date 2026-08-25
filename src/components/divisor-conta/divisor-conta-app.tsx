"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { PageHero } from "@/components/shared/page-hero";
import { ResultShareCard } from "@/components/shared/result-share-card";
import { ShareResult } from "@/components/shared/share-result";
import { ToolsBackButton } from "@/components/shared/tools-back-button";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { parseCurrency } from "@/lib/formatters";
import { calcularDivisao } from "@/lib/divisor-conta/calc";
import { trackEvent } from "@/lib/analytics";
import { getViralBaseUrl } from "@/lib/viral-loop";
import { cn } from "@/lib/utils";
import { viralToolShareFooter } from "@/lib/viral-loop";

type Locale = "pt-BR" | "en" | "es";

interface PessoaForm {
  nome: string;
  consumoExtraInput: string;
}

const CURRENCY_CONFIG: Record<Locale, { locale: string; currency: string }> = {
  "pt-BR": { locale: "pt-BR", currency: "BRL" },
  en: { locale: "en-US", currency: "USD" },
  es: { locale: "es-ES", currency: "EUR" },
};

function formatMoneyInput(value: string, locale: Locale) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const cents = Number(digits) / 100;
  const cfg = CURRENCY_CONFIG[locale];
  return new Intl.NumberFormat(cfg.locale, {
    style: "currency",
    currency: cfg.currency,
  }).format(cents);
}

const COPY: Record<
  Locale,
  {
    authTitle: string;
    authDescription: string;
    heroTitle: string;
    heroSubtitle: string;
    insightTotalLabel: string;
    insightTotalText: string;
    insightJustoLabel: string;
    insightJustoText: string;
    insightGrupoLabel: string;
    insightGrupoText: string;
    valorTotalLabel: string;
    valorTotalPlaceholder: string;
    taxaLabel: string;
    dividirIgualmenteLabel: string;
    participantesLabel: string;
    pessoaPlaceholder: (idx: number) => string;
    pessoaNome: (idx: number) => string;
    consumoExtraPlaceholder: string;
    removerAria: (nome: string) => string;
    addPessoa: string;
    resultTitle: string;
    emptyResultTitle: string;
    emptyResultText: string;
    comumLabel: string;
    individualLabel: string;
    taxaCompactLabel: string;
    totalComTaxaLabel: string;
    copiarDivisao: string;
    enviarWhatsApp: string;
    compartilharImagem: string;
    destinationHint: string;
    semNome: string;
    toastCopiado: string;
    resumoTitulo: string;
    resumoSubtitulo: string;
    resumoTotalComTaxa: string;
    resumoValorPorPessoa: string;
    resumoRodape: string;
    resultadoPronto: string;
    criarDivisao: string;
  }
> = {
  "pt-BR": {
    authTitle: "Divisor de Conta em Grupo",
    authDescription: "Cadastre-se gratuitamente para dividir a conta.",
    heroTitle: "Divisor de Conta em Grupo",
    heroSubtitle:
      "Rateie o churrasco, o restaurante, a viagem ou o aluguel entre amigos, com ou sem consumo individual e taxa de serviço.",
    insightTotalLabel: "Total",
    insightTotalText: "Informe a conta antes ou depois de conferir a comanda.",
    insightJustoLabel: "Justo",
    insightJustoText: "Divida igual ou registre consumo individual.",
    insightGrupoLabel: "Grupo",
    insightGrupoText: "Envie a divisão pronta no WhatsApp.",
    valorTotalLabel: "Valor total da conta",
    valorTotalPlaceholder: "R$ 0,00",
    taxaLabel: "Taxa de serviço (%)",
    dividirIgualmenteLabel: "Dividir tudo igualmente (ignora consumo individual)",
    participantesLabel: "Participantes",
    pessoaPlaceholder: (idx) => `Pessoa ${idx}`,
    pessoaNome: (idx) => `Pessoa ${idx}`,
    consumoExtraPlaceholder: "Consumo extra",
    removerAria: (nome) => `Remover ${nome}`,
    addPessoa: "Adicionar pessoa",
    resultTitle: "Quanto cada um paga",
    emptyResultTitle: "A divisão aparece aqui em tempo real.",
    emptyResultText:
      "Informe o total, ajuste a taxa e adicione os participantes para evitar conta de cabeça na mesa.",
    comumLabel: "Comum",
    individualLabel: "Individual",
    taxaCompactLabel: "Taxa",
    totalComTaxaLabel: "Total com taxa de serviço",
    copiarDivisao: "Copiar divisão",
    enviarWhatsApp: "Enviar no WhatsApp",
    compartilharImagem: "Criar imagem para Stories",
    destinationHint: "WhatsApp que receberá a divisão",
    semNome: "Sem nome",
    toastCopiado: "Divisão copiada!",
    resumoTitulo: "*DIVISÃO DA CONTA | RESUMO*",
    resumoSubtitulo: "_Valores organizados por participante_",
    resumoTotalComTaxa: "*TOTAL COM TAXA*",
    resumoValorPorPessoa: "*VALOR POR PESSOA*",
    resumoRodape: "Divisão automática. Confira antes de pagar.",
    resultadoPronto: "Sua divisão está pronta",
    criarDivisao: "Faça sua divisão grátis",
  },
  en: {
    authTitle: "Group Bill Splitter",
    authDescription: "Sign up for free to split the bill.",
    heroTitle: "Group Bill Splitter",
    heroSubtitle:
      "Split the barbecue, restaurant, trip or rent among friends, with or without individual items and a service fee.",
    insightTotalLabel: "Total",
    insightTotalText: "Enter the bill before or after checking the receipt.",
    insightJustoLabel: "Fair",
    insightJustoText: "Split evenly or track individual items.",
    insightGrupoLabel: "Group",
    insightGrupoText: "Send the ready split on WhatsApp.",
    valorTotalLabel: "Bill total",
    valorTotalPlaceholder: "$0.00",
    taxaLabel: "Service fee (%)",
    dividirIgualmenteLabel: "Split everything evenly (ignores individual items)",
    participantesLabel: "Participants",
    pessoaPlaceholder: (idx) => `Person ${idx}`,
    pessoaNome: (idx) => `Person ${idx}`,
    consumoExtraPlaceholder: "Extra item",
    removerAria: (nome) => `Remove ${nome}`,
    addPessoa: "Add person",
    resultTitle: "How much each person pays",
    emptyResultTitle: "The split shows up here in real time.",
    emptyResultText:
      "Enter the total, adjust the fee and add the participants to avoid doing math at the table.",
    comumLabel: "Shared",
    individualLabel: "Individual",
    taxaCompactLabel: "Fee",
    totalComTaxaLabel: "Total with service fee",
    copiarDivisao: "Copy split",
    enviarWhatsApp: "Send on WhatsApp",
    compartilharImagem: "Create image for Stories",
    destinationHint: "WhatsApp that will receive the split",
    semNome: "No name",
    toastCopiado: "Split copied!",
    resumoTitulo: "*BILL SPLIT | SUMMARY*",
    resumoSubtitulo: "_Amounts organized by participant_",
    resumoTotalComTaxa: "*TOTAL WITH FEE*",
    resumoValorPorPessoa: "*AMOUNT PER PERSON*",
    resumoRodape: "Automatic split. Double check it before paying.",
    resultadoPronto: "Your split is ready",
    criarDivisao: "Split your bill for free",
  },
  es: {
    authTitle: "Divisor de Cuenta en Grupo",
    authDescription: "Registrate gratis para dividir la cuenta.",
    heroTitle: "Divisor de Cuenta en Grupo",
    heroSubtitle:
      "Divide el asado, el restaurante, el viaje o el alquiler entre amigos, con o sin consumo individual y cargo por servicio.",
    insightTotalLabel: "Total",
    insightTotalText: "Ingresa la cuenta antes o despues de revisar el recibo.",
    insightJustoLabel: "Justo",
    insightJustoText: "Divide en partes iguales o registra el consumo individual.",
    insightGrupoLabel: "Grupo",
    insightGrupoText: "Envia la division lista por WhatsApp.",
    valorTotalLabel: "Valor total de la cuenta",
    valorTotalPlaceholder: "0,00 €",
    taxaLabel: "Cargo por servicio (%)",
    dividirIgualmenteLabel: "Dividir todo en partes iguales (ignora el consumo individual)",
    participantesLabel: "Participantes",
    pessoaPlaceholder: (idx) => `Persona ${idx}`,
    pessoaNome: (idx) => `Persona ${idx}`,
    consumoExtraPlaceholder: "Consumo extra",
    removerAria: (nome) => `Quitar ${nome}`,
    addPessoa: "Agregar persona",
    resultTitle: "Cuanto paga cada uno",
    emptyResultTitle: "La division aparece aqui en tiempo real.",
    emptyResultText:
      "Ingresa el total, ajusta el cargo y agrega a los participantes para evitar hacer cuentas en la mesa.",
    comumLabel: "Comun",
    individualLabel: "Individual",
    taxaCompactLabel: "Cargo",
    totalComTaxaLabel: "Total con cargo por servicio",
    copiarDivisao: "Copiar division",
    enviarWhatsApp: "Enviar por WhatsApp",
    compartilharImagem: "Crear imagen para Stories",
    destinationHint: "WhatsApp que recibira la division",
    semNome: "Sin nombre",
    toastCopiado: "Division copiada!",
    resumoTitulo: "*DIVISION DE CUENTA | RESUMEN*",
    resumoSubtitulo: "_Montos organizados por participante_",
    resumoTotalComTaxa: "*TOTAL CON CARGO*",
    resumoValorPorPessoa: "*MONTO POR PERSONA*",
    resumoRodape: "Division automatica. Revisa antes de pagar.",
    resultadoPronto: "Tu division esta lista",
    criarDivisao: "Divide tu cuenta gratis",
  },
};

export function DivisorContaApp({ locale = "pt-BR" }: { locale?: Locale } = {}) {
  const t = COPY[locale];
  const currencyConfig = CURRENCY_CONFIG[locale];
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(currencyConfig.locale, {
      style: "currency",
      currency: currencyConfig.currency,
    }).format(Number.isFinite(value) ? value : 0);
  const { toast } = useToast();
  const [valorTotalInput, setValorTotalInput] = useState("");
  const [taxaServico, setTaxaServico] = useState(10);
  const [dividirIgualmente, setDividirIgualmente] = useState(true);
  const [pessoas, setPessoas] = useState<PessoaForm[]>(() => [
    { nome: t.pessoaNome(1), consumoExtraInput: "" },
    { nome: t.pessoaNome(2), consumoExtraInput: "" },
  ]);

  // Restaura um resultado recebido sem persistir dados no servidor. A própria
  // ação de compartilhar é o consentimento para incluir os nomes na URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const total = Number(params.get("total"));
    const taxa = Number(params.get("taxa"));
    const igual = params.get("igual");
    const participantes = params.getAll("p").slice(0, 30);
    if (!Number.isFinite(total) || total <= 0 || participantes.length === 0) return;

    setValorTotalInput(formatMoneyInput(String(Math.round(total)), locale));
    if (Number.isFinite(taxa) && taxa >= 0 && taxa <= 100) setTaxaServico(taxa);
    setDividirIgualmente(igual !== "0");
    setPessoas(
      participantes.map((value, idx) => {
        const separator = value.lastIndexOf(":");
        const nome = separator > 0 ? value.slice(0, separator) : t.pessoaNome(idx + 1);
        const consumo = separator > 0 ? Number(value.slice(separator + 1)) : 0;
        return {
          nome: nome.slice(0, 60) || t.pessoaNome(idx + 1),
          consumoExtraInput:
            Number.isFinite(consumo) && consumo > 0
              ? formatMoneyInput(String(Math.round(consumo)), locale)
              : "",
        };
      }),
    );
    trackEvent("shared_result_opened", { tool_id: "divisor_conta" });
  }, [locale, t]);

  const valorTotal = parseCurrency(valorTotalInput);

  function addPessoa() {
    setPessoas((prev) => [
      ...prev,
      { nome: t.pessoaNome(prev.length + 1), consumoExtraInput: "" },
    ]);
  }

  function removerPessoa(idx: number) {
    setPessoas((prev) => prev.filter((_, i) => i !== idx));
  }

  function atualizarNome(idx: number, nome: string) {
    setPessoas((prev) => prev.map((p, i) => (i === idx ? { ...p, nome } : p)));
  }

  function atualizarConsumo(idx: number, value: string) {
    setPessoas((prev) =>
      prev.map((p, i) =>
        i === idx ? { ...p, consumoExtraInput: formatMoneyInput(value, locale) } : p,
      ),
    );
  }

  const resultado = useMemo(() => {
    if (valorTotal <= 0 || pessoas.length === 0) return null;
    return calcularDivisao({
      valorTotal,
      pessoas: pessoas.map((p) => ({
        nome: p.nome || t.semNome,
        consumoExtra: parseCurrency(p.consumoExtraInput),
      })),
      taxaServicoPercentual: taxaServico,
      dividirIgualmente,
    });
  }, [valorTotal, pessoas, taxaServico, dividirIgualmente, t.semNome]);

  function resumoTexto() {
    if (!resultado) return "";
    const linhas = resultado.porPessoa
      .map((p) => `• ${p.nome}: ${formatCurrency(p.total)}`)
      .join("\n");
    const summary = [
      t.resumoTitulo,
      t.resumoSubtitulo,
      "",
      t.resumoTotalComTaxa,
      formatCurrency(resultado.totalComTaxa),
      "",
      t.resumoValorPorPessoa,
      linhas,
      "",
      t.resumoRodape,
      "",
      `${t.criarDivisao}:`,
      buildShareUrl(),
    ].join("\n");
    if (locale !== "pt-BR") return summary;
    return summary + viralToolShareFooter("/divisor-de-conta", "divisor_conta_whatsapp");
  }

  function buildShareUrl() {
    const params = new URLSearchParams({
      total: String(Math.round(valorTotal * 100)),
      taxa: String(taxaServico),
      igual: dividirIgualmente ? "1" : "0",
      utm_source: "share",
      utm_medium: "divisor_resultado",
      utm_campaign: "divisao_grupo",
    });
    pessoas.forEach((p) => {
      const nome = (p.nome || t.semNome).trim().slice(0, 60);
      const consumo = Math.round(parseCurrency(p.consumoExtraInput) * 100);
      params.append("p", `${nome}:${consumo}`);
    });
    return `${getViralBaseUrl()}/divisor-de-conta?${params.toString()}`;
  }

  function handleCopy() {
    navigator.clipboard.writeText(resumoTexto());
    trackEvent("share_result", {
      method: "copy",
      tool_path: locale === "pt-BR" ? "/divisor-de-conta" : `/${locale}/tools/bill-splitter`,
      campaign: "divisor_conta_whatsapp",
    });
    toast(t.toastCopiado);
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
          icon={Users}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <Insight
            label={t.insightTotalLabel}
            text={t.insightTotalText}
          />
          <Insight
            label={t.insightJustoLabel}
            text={t.insightJustoText}
          />
          <Insight label={t.insightGrupoLabel} text={t.insightGrupoText} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label={t.valorTotalLabel}
                htmlFor="valor-total"
                required
              >
                <Input
                  id="valor-total"
                  inputMode="numeric"
                  placeholder={t.valorTotalPlaceholder}
                  value={valorTotalInput}
                  onChange={(e) =>
                    setValorTotalInput(formatMoneyInput(e.target.value, locale))
                  }
                />
              </FormField>
              <FormField label={t.taxaLabel} htmlFor="taxa">
                <Input
                  id="taxa"
                  type="number"
                  min={0}
                  max={30}
                  value={taxaServico}
                  onChange={(e) =>
                    setTaxaServico(Math.max(0, Number(e.target.value) || 0))
                  }
                />
              </FormField>
            </div>

            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                checked={dividirIgualmente}
                onChange={(e) => setDividirIgualmente(e.target.checked)}
              />
              {t.dividirIgualmenteLabel}
            </label>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
                {t.participantesLabel}
              </p>
              <div className="space-y-2">
                {pessoas.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={p.nome}
                      onChange={(e) => atualizarNome(idx, e.target.value)}
                      placeholder={t.pessoaPlaceholder(idx + 1)}
                      className="flex-1"
                    />
                    {!dividirIgualmente ? (
                      <Input
                        inputMode="numeric"
                        placeholder={t.consumoExtraPlaceholder}
                        value={p.consumoExtraInput}
                        onChange={(e) => atualizarConsumo(idx, e.target.value)}
                        className="w-36"
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removerPessoa(idx)}
                      disabled={pessoas.length <= 1}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                      aria-label={t.removerAria(p.nome)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addPessoa}
                icon={Plus}
              >
                {t.addPessoa}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
            <h2 className="precisoutapronto-display mb-3 text-base font-bold text-slate-900">
              {t.resultTitle}
            </h2>
            {!resultado ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800">
                  {t.emptyResultTitle}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {t.emptyResultText}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <ul className="space-y-2">
                  {resultado.porPessoa.map((p) => (
                    <li
                      key={p.nome}
                      className="rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900">
                          {p.nome}
                        </p>
                        <span className="precisoutapronto-display text-base font-bold text-sky-700">
                          {formatCurrency(p.total)}
                        </span>
                      </div>
                      {!dividirIgualmente ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {t.comumLabel}: {formatCurrency(p.parteComum)} · {t.individualLabel}:{" "}
                          {formatCurrency(p.consumoExtra)} · {t.taxaCompactLabel}:{" "}
                          {formatCurrency(p.taxaServico)}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
                  <span className="text-sm font-semibold">
                    {t.totalComTaxaLabel}
                  </span>
                  <span className="precisoutapronto-display text-lg font-bold">
                    {formatCurrency(resultado.totalComTaxa)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={handleCopy}
                    icon={Copy}
                  >
                    {t.copiarDivisao}
                  </Button>
                </div>

                <ShareResult
                  tool="divisor_conta"
                  title={t.resultadoPronto}
                  subtitle={`${formatCurrency(resultado.totalComTaxa)} · ${resultado.porPessoa.length} participantes`}
                  lines={[
                    { label: t.totalComTaxaLabel, value: formatCurrency(resultado.totalComTaxa), emphasis: true },
                    ...resultado.porPessoa.map((p) => ({ label: p.nome, value: formatCurrency(p.total) })),
                  ]}
                  whatsappText={resumoTexto()}
                />

                <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-sky-800">
                    {t.resultadoPronto} · {t.compartilharImagem}
                  </p>
                  <ResultShareCard
                    eyebrow={t.heroTitle}
                    title={t.resultadoPronto}
                    highlightLabel={t.totalComTaxaLabel}
                    highlightValue={formatCurrency(resultado.totalComTaxa)}
                    lines={resultado.porPessoa.slice(0, 5).map((p) => ({
                      label: p.nome,
                      value: formatCurrency(p.total),
                    }))}
                    toolPath="/divisor-de-conta"
                    utmCampaign="divisor_conta_stories"
                    fileNameHint="divisao-da-conta"
                  />
                </div>

                {locale === "pt-BR" ? (
                  <ResultShareCard
                    eyebrow="Divisão de conta"
                    title="Quanto cada um paga"
                    highlightLabel="Total com taxa"
                    highlightValue={formatCurrency(resultado.totalComTaxa)}
                    lines={resultado.porPessoa.map((p) => ({
                      label: p.nome,
                      value: formatCurrency(p.total),
                    }))}
                    toolPath="/divisor-de-conta"
                    utmCampaign="divisor_conta_card"
                    fileNameHint="divisao-da-conta"
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
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
