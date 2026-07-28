'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, Calculator, Check, Copy, Percent, Sparkles, Wallet } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { InternationalLocale } from '@/lib/i18n';
import { calcularPrecificacao } from '@/lib/precificacao/calc';

const copy = {
  en: {
    title: 'Freelance pricing calculator',
    subtitle: 'Turn costs, working time, fees and profit into a sustainable project price.',
    back: 'Back to tools',
    notice: 'Results use Brazilian reais (BRL) and are an educational estimate, not a guaranteed market price.',
    direct: 'Direct project costs',
    directHelp: 'Materials, software, outsourced work or project-specific expenses.',
    shipping: 'Shipping or logistics',
    monthly: 'Monthly fixed costs',
    monthlyHelp: 'Internet, subscriptions, rent, accounting and other recurring costs.',
    projects: 'Estimated projects per month',
    hours: 'Hours required for this project',
    hourly: 'Target hourly rate',
    cardFee: 'Payment/platform fees (%)',
    tax: 'Estimated taxes (%)',
    margin: 'Desired net profit margin (%)',
    sample: 'Load example',
    result: 'Suggested project price',
    resultHelp: 'This price covers the costs and percentages entered above.',
    totalCost: 'Total project cost',
    fixedShare: 'Fixed-cost allocation',
    labor: 'Your working time',
    feesTaxes: 'Fees and taxes',
    profit: 'Estimated net profit',
    netMargin: 'Net margin',
    markup: 'Markup on direct cost',
    composition: 'Price composition',
    materials: 'Direct costs',
    fixed: 'Fixed costs',
    copied: 'Copied',
    copy: 'Copy result',
    empty: 'Enter your costs or hourly rate to calculate a suggested price.',
    invalid: 'Fees, taxes and desired margin together must stay below 100%.',
    summary: 'FREELANCE PRICING ESTIMATE',
    disclaimer: 'Review the result against your positioning, demand and the value delivered to the client.'
  },
  es: {
    title: 'Calculadora de precio freelance',
    subtitle: 'Convierte costos, tiempo de trabajo, comisiones y ganancia en un precio sostenible.',
    back: 'Volver a herramientas',
    notice: 'Los resultados usan reales brasileños (BRL) y son una estimación educativa, no un precio de mercado garantizado.',
    direct: 'Costos directos del proyecto',
    directHelp: 'Materiales, software, servicios externos o gastos específicos.',
    shipping: 'Envío o logística',
    monthly: 'Costos fijos mensuales',
    monthlyHelp: 'Internet, suscripciones, alquiler, contabilidad y otros costos recurrentes.',
    projects: 'Proyectos estimados por mes',
    hours: 'Horas necesarias para este proyecto',
    hourly: 'Tarifa por hora deseada',
    cardFee: 'Comisiones de pago/plataforma (%)',
    tax: 'Impuestos estimados (%)',
    margin: 'Margen neto deseado (%)',
    sample: 'Cargar ejemplo',
    result: 'Precio sugerido del proyecto',
    resultHelp: 'Este precio cubre los costos y porcentajes ingresados.',
    totalCost: 'Costo total del proyecto',
    fixedShare: 'Parte proporcional de costos fijos',
    labor: 'Tu tiempo de trabajo',
    feesTaxes: 'Comisiones e impuestos',
    profit: 'Ganancia neta estimada',
    netMargin: 'Margen neto',
    markup: 'Markup sobre costo directo',
    composition: 'Composición del precio',
    materials: 'Costos directos',
    fixed: 'Costos fijos',
    copied: 'Copiado',
    copy: 'Copiar resultado',
    empty: 'Ingresa tus costos o tarifa por hora para calcular un precio sugerido.',
    invalid: 'Las comisiones, impuestos y el margen deseado deben sumar menos del 100%.',
    summary: 'ESTIMACIÓN DE PRECIO FREELANCE',
    disclaimer: 'Compara el resultado con tu posicionamiento, la demanda y el valor entregado al cliente.'
  }
} as const;

function formatBRL(value: number, locale: InternationalLocale) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function InternationalFreelancePricing({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const [direct, setDirect] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [monthly, setMonthly] = useState(0);
  const [projects, setProjects] = useState(10);
  const [hours, setHours] = useState(10);
  const [hourly, setHourly] = useState(0);
  const [fee, setFee] = useState(4.99);
  const [tax, setTax] = useState(6);
  const [margin, setMargin] = useState(20);
  const [copied, setCopied] = useState(false);
  const percentageTotal = fee + tax + margin;
  const hasBase = direct > 0 || monthly > 0 || (hours > 0 && hourly > 0);
  const result = useMemo(() => {
    if (!hasBase || percentageTotal >= 100) return null;
    return calcularPrecificacao({
      custoDireto: Math.max(0, direct),
      frete: Math.max(0, shipping),
      custosFixosMensais: Math.max(0, monthly),
      vendasMensaisEstimadas: Math.max(1, projects),
      horasTrabalhadas: Math.max(0, hours),
      valorHora: Math.max(0, hourly),
      taxasCartaoPercentual: Math.max(0, fee),
      impostoPercentual: Math.max(0, tax),
      margemLucroDesejadaPercentual: Math.max(0, margin)
    });
  }, [direct, fee, hasBase, hourly, hours, margin, monthly, percentageTotal, projects, shipping, tax]);

  function loadSample() {
    setDirect(200);
    setShipping(0);
    setMonthly(1200);
    setProjects(8);
    setHours(20);
    setHourly(60);
    setFee(4.99);
    setTax(6);
    setMargin(20);
  }

  async function copyResult() {
    if (!result) return;
    const text = [
      t.summary,
      `${t.result}: ${formatBRL(result.precoFinal, locale)}`,
      `${t.totalCost}: ${formatBRL(result.custoTotal, locale)}`,
      `${t.profit}: ${formatBRL(result.lucroLiquidoPorVenda, locale)}`,
      `${t.netMargin}: ${result.margemLiquidaReal.toFixed(1)}%`,
      '',
      t.disclaimer
    ].join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  const composition = result ? [
    { label: t.materials, value: Math.max(0, direct + shipping), color: 'bg-sky-500' },
    { label: t.labor, value: result.custoMaoDeObra, color: 'bg-teal-500' },
    { label: t.fixed, value: result.custoFixoRateado, color: 'bg-amber-500' },
    { label: t.feesTaxes, value: result.precoFinal * ((fee + tax) / 100), color: 'bg-slate-500' },
    { label: t.profit, value: result.lucroLiquidoPorVenda, color: 'bg-emerald-500' }
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6"><Link href={`/${locale}`}><Logo variant="marketing" className="h-12 sm:h-14" /></Link><LocaleSwitcher locale={locale} label={locale === 'en' ? 'Language' : 'Idioma'} paths={{ 'pt-BR': '/calculadora-de-preco-freelancer', en: '/en/tools/freelance-pricing', es: '/es/tools/freelance-pricing' }} /></div></header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href={`/${locale}/tools`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="rj-display text-3xl font-extrabold sm:text-4xl">{t.title}</h1><p className="mt-2 max-w-2xl text-slate-600">{t.subtitle}</p></div><Button variant="outline" icon={Sparkles} onClick={loadSample}>{t.sample}</Button></div>
        <p className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">{t.notice}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.82fr)]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField label={t.direct} hint={t.directHelp} value={direct} onChange={setDirect} />
              <NumberField label={t.shipping} value={shipping} onChange={setShipping} />
              <NumberField label={t.monthly} hint={t.monthlyHelp} value={monthly} onChange={setMonthly} />
              <NumberField label={t.projects} value={projects} onChange={setProjects} min={1} step={1} />
              <NumberField label={t.hours} value={hours} onChange={setHours} min={0} />
              <NumberField label={t.hourly} value={hourly} onChange={setHourly} />
              <NumberField label={t.cardFee} value={fee} onChange={setFee} min={0} max={99} />
              <NumberField label={t.tax} value={tax} onChange={setTax} min={0} max={99} />
              <NumberField label={t.margin} value={margin} onChange={setMargin} min={0} max={99} className="sm:col-span-2" />
            </div>
            {percentageTotal >= 100 ? <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{t.invalid}</p> : null}
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Calculator className="h-5 w-5" /></span><h2 className="text-xl font-extrabold">{t.result}</h2></div>
            {result ? (
              <>
                <p className="mt-6 text-4xl font-extrabold tracking-tight text-emerald-700">{formatBRL(result.precoFinal, locale)}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t.resultHelp}</p>
                <div className="mt-6 space-y-3 border-t border-slate-200 pt-5">
                  <Row label={t.totalCost} value={formatBRL(result.custoTotal, locale)} />
                  <Row label={t.fixedShare} value={formatBRL(result.custoFixoRateado, locale)} />
                  <Row label={t.labor} value={formatBRL(result.custoMaoDeObra, locale)} />
                  <Row label={t.profit} value={formatBRL(result.lucroLiquidoPorVenda, locale)} emphasis />
                  <Row label={t.netMargin} value={`${result.margemLiquidaReal.toFixed(1)}%`} />
                  <Row label={t.markup} value={`${result.markup.toFixed(2)}x`} />
                </div>
                <h3 className="mt-7 text-sm font-extrabold uppercase tracking-[0.12em] text-slate-600">{t.composition}</h3>
                <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100">{composition.map((slice) => <div key={slice.label} className={slice.color} style={{ width: `${result.precoFinal > 0 ? (slice.value / result.precoFinal) * 100 : 0}%` }} />)}</div>
                <div className="mt-4 grid gap-2 text-xs">{composition.map((slice) => <div key={slice.label} className="flex items-center justify-between"><span>{slice.label}</span><strong>{formatBRL(slice.value, locale)}</strong></div>)}</div>
                <p className="mt-6 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-950">{t.disclaimer}</p>
                <Button className="mt-5 w-full" variant="outline" icon={copied ? Check : Copy} onClick={copyResult}>{copied ? t.copied : t.copy}</Button>
              </>
            ) : <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><Wallet className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 text-sm leading-6 text-slate-600">{t.empty}</p></div>}
          </section>
        </div>
      </main>
    </div>
  );
}

function NumberField({ label, hint, value, onChange, min = 0, max, step = 0.01, className = '' }: { label: string; hint?: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{label}{label.includes('%') ? <Percent className="h-3 w-3" /> : null}</span><Input type="number" min={min} max={max} step={step} value={value || ''} onChange={(event) => onChange(Number(event.target.value))} />{hint ? <span className="mt-1.5 block text-xs leading-4 text-slate-500">{hint}</span> : null}</label>;
}
function Row({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <div className={`flex items-center justify-between gap-4 text-sm ${emphasis ? 'font-bold text-emerald-700' : ''}`}><span>{label}</span><strong>{value}</strong></div>;
}
