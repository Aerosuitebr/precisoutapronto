'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Calculator, Check, Copy, Scale, ShieldAlert, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { InternationalLocale } from '@/lib/i18n';
import { calcularRescisao, type TipoRescisao } from '@/lib/rescisao/calc';

const copy = {
  en: {
    title: 'Brazilian employment termination calculator',
    subtitle: 'Estimate gross termination amounts under common Brazilian CLT scenarios.',
    back: 'Back to tools',
    legalNotice: 'Brazil only. Educational gross estimate: it does not include INSS, income tax, collective agreements, stability, overtime or every legal exception. Confirm with an accountant or employment lawyer.',
    fgtsNotice: 'FGTS withdrawal depends on the termination reason and the worker’s withdrawal option. Saque-Aniversário may restrict access to the account balance.',
    details: 'Employment details',
    salary: 'Gross monthly salary (BRL)',
    admission: 'Hire date',
    termination: 'Termination date',
    type: 'Termination type',
    fgts: 'FGTS balance used to estimate the penalty',
    unusedVacation: 'There is an accrued unused vacation period',
    indemnifiedNotice: 'Include indemnified notice period',
    sample: 'Load example',
    result: 'Estimated gross termination amount',
    empty: 'Enter salary and valid employment dates to calculate.',
    salaryBalance: 'Salary balance',
    thirteenth: 'Proportional 13th salary',
    vacation: 'Proportional vacation',
    vacationThird: 'One-third vacation bonus',
    accruedVacation: 'Accrued vacation',
    accruedThird: 'One-third accrued vacation bonus',
    notice: 'Indemnified notice',
    fgtsPenalty: 'FGTS termination penalty',
    total: 'Gross estimated total',
    withdrawal: 'Potential FGTS withdrawal',
    unemployment: 'Potential unemployment insurance',
    yes: 'May apply',
    no: 'Not automatic in this scenario',
    copy: 'Copy estimate',
    copied: 'Copied',
    disclaimer: 'This result is a simplified estimate. The official settlement may differ.',
    types: {
      'sem-justa-causa': 'Dismissal without cause',
      'pedido-demissao': 'Employee resignation',
      'justa-causa': 'Dismissal for cause',
      'acordo-mutuo': 'Mutual termination agreement (CLT art. 484-A)',
      'termino-contrato': 'End of fixed-term or probation contract'
    }
  },
  es: {
    title: 'Calculadora de liquidación laboral de Brasil',
    subtitle: 'Estima valores brutos de liquidación en situaciones comunes de la legislación CLT brasileña.',
    back: 'Volver a herramientas',
    legalNotice: 'Solo Brasil. Estimación educativa y bruta: no incluye INSS, impuesto sobre la renta, convenios colectivos, estabilidad, horas extra ni todas las excepciones legales. Confirma con un contador o abogado laboral.',
    fgtsNotice: 'El retiro del FGTS depende del motivo de salida y de la modalidad elegida. Saque-Aniversário puede limitar el acceso al saldo de la cuenta.',
    details: 'Datos laborales',
    salary: 'Salario bruto mensual (BRL)',
    admission: 'Fecha de ingreso',
    termination: 'Fecha de salida',
    type: 'Tipo de terminación',
    fgts: 'Saldo FGTS para estimar la multa',
    unusedVacation: 'Existe un período de vacaciones vencidas',
    indemnifiedNotice: 'Incluir preaviso indemnizado',
    sample: 'Cargar ejemplo',
    result: 'Liquidación bruta estimada',
    empty: 'Ingresa el salario y fechas laborales válidas para calcular.',
    salaryBalance: 'Saldo de salario',
    thirteenth: '13.º salario proporcional',
    vacation: 'Vacaciones proporcionales',
    vacationThird: 'Adicional de un tercio de vacaciones',
    accruedVacation: 'Vacaciones vencidas',
    accruedThird: 'Adicional de vacaciones vencidas',
    notice: 'Preaviso indemnizado',
    fgtsPenalty: 'Multa rescisoria del FGTS',
    total: 'Total bruto estimado',
    withdrawal: 'Posible retiro del FGTS',
    unemployment: 'Posible seguro de desempleo',
    yes: 'Puede corresponder',
    no: 'No es automático en esta situación',
    copy: 'Copiar estimación',
    copied: 'Copiado',
    disclaimer: 'Este resultado es una estimación simplificada. La liquidación oficial puede ser diferente.',
    types: {
      'sem-justa-causa': 'Despido sin justa causa',
      'pedido-demissao': 'Renuncia del trabajador',
      'justa-causa': 'Despido con justa causa',
      'acordo-mutuo': 'Acuerdo mutuo de terminación (CLT art. 484-A)',
      'termino-contrato': 'Fin de contrato a plazo o de prueba'
    }
  }
} as const;

const types: TipoRescisao[] = ['sem-justa-causa', 'pedido-demissao', 'justa-causa', 'acordo-mutuo', 'termino-contrato'];

function formatBRL(value: number, locale: InternationalLocale) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'BRL' }).format(value);
}

export function InternationalSeveranceCalculator({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const [salary, setSalary] = useState(0);
  const [admission, setAdmission] = useState('');
  const [termination, setTermination] = useState('');
  const [type, setType] = useState<TipoRescisao>('sem-justa-causa');
  const [fgts, setFgts] = useState(0);
  const [unusedVacation, setUnusedVacation] = useState(false);
  const [indemnifiedNotice, setIndemnifiedNotice] = useState(true);
  const [copied, setCopied] = useState(false);
  const valid = salary > 0 && admission && termination && termination >= admission;
  const result = useMemo(() => valid ? calcularRescisao({
    salario: salary,
    admissao: admission,
    desligamento: termination,
    tipo: type,
    feriasVencidas: unusedVacation,
    avisoIndenizado: type === 'sem-justa-causa' && indemnifiedNotice,
    saldoFgts: fgts
  }) : null, [admission, fgts, indemnifiedNotice, salary, termination, type, unusedVacation, valid]);

  function sample() {
    setSalary(3500);
    setAdmission('2022-03-01');
    setTermination('2026-07-27');
    setType('sem-justa-causa');
    setFgts(12000);
    setUnusedVacation(false);
    setIndemnifiedNotice(true);
  }

  async function copyResult() {
    if (!result) return;
    const text = [
      t.title, t.types[type], '',
      `${t.salaryBalance}: ${formatBRL(result.saldoSalario, locale)}`,
      `${t.thirteenth}: ${formatBRL(result.decimoTerceiroProporcional, locale)}`,
      `${t.vacation}: ${formatBRL(result.feriasProporcionais + result.tercoFeriasProporcionais, locale)}`,
      `${t.notice}: ${formatBRL(result.avisoPrevio, locale)}`,
      `${t.fgtsPenalty}: ${formatBRL(result.multaFgts, locale)}`,
      `${t.total}: ${formatBRL(result.totalBruto, locale)}`, '', t.disclaimer
    ].join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  const rows = result ? [
    [t.salaryBalance, result.saldoSalario],
    [t.thirteenth, result.decimoTerceiroProporcional],
    [t.vacation, result.feriasProporcionais],
    [t.vacationThird, result.tercoFeriasProporcionais],
    ...(result.feriasVencidasValor ? [[t.accruedVacation, result.feriasVencidasValor], [t.accruedThird, result.tercoFeriasVencidas]] as [string, number][] : []),
    ...(result.avisoPrevio ? [[t.notice, result.avisoPrevio]] as [string, number][] : []),
    ...(result.multaFgts ? [[t.fgtsPenalty, result.multaFgts]] as [string, number][] : [])
  ] as [string, number][] : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6"><Link href={`/${locale}`}><Logo variant="marketing" className="h-12 sm:h-14" /></Link><LocaleSwitcher locale={locale} label={locale === 'en' ? 'Language' : 'Idioma'} paths={{ 'pt-BR': '/calculadora-de-rescisao', en: '/en/tools/severance', es: '/es/tools/severance' }} /></div></header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href={`/${locale}/tools`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="rj-display text-3xl font-extrabold sm:text-4xl">{t.title}</h1><p className="mt-2 max-w-3xl text-slate-600">{t.subtitle}</p></div><Button variant="outline" icon={Sparkles} onClick={sample}>{t.sample}</Button></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><p className="flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"><Scale className="mt-0.5 h-4 w-4 shrink-0" />{t.legalNotice}</p><p className="flex gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-950"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{t.fgtsNotice}</p></div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-extrabold">{t.details}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label={t.salary}><Input type="number" min="0" step="0.01" value={salary || ''} onChange={(e) => setSalary(Number(e.target.value))} /></Field>
              <Field label={t.fgts}><Input type="number" min="0" step="0.01" value={fgts || ''} onChange={(e) => setFgts(Number(e.target.value))} /></Field>
              <Field label={t.admission}><Input type="date" value={admission} onChange={(e) => setAdmission(e.target.value)} /></Field>
              <Field label={t.termination}><Input type="date" value={termination} onChange={(e) => setTermination(e.target.value)} /></Field>
              <Field label={t.type} className="sm:col-span-2"><select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as TipoRescisao)}>{types.map((item) => <option key={item} value={item}>{t.types[item]}</option>)}</select></Field>
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={unusedVacation} onChange={(e) => setUnusedVacation(e.target.checked)} />{t.unusedVacation}</label>
              {type === 'sem-justa-causa' ? <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={indemnifiedNotice} onChange={(e) => setIndemnifiedNotice(e.target.checked)} />{t.indemnifiedNotice}</label> : null}
            </div>
          </section>
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Calculator className="h-5 w-5" /></span><h2 className="text-xl font-extrabold">{t.result}</h2></div>
            {result ? <><p className="mt-6 text-4xl font-extrabold text-emerald-700">{formatBRL(result.totalBruto, locale)}</p><p className="mt-2 text-sm font-semibold text-slate-600">{t.types[type]}</p><div className="mt-6 space-y-3 border-t pt-5">{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-4 text-sm"><span>{label}</span><strong>{formatBRL(value, locale)}</strong></div>)}</div><div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm"><div className="flex justify-between"><span>{t.withdrawal}</span><strong>{result.temDireitoSaqueFgts ? t.yes : t.no}</strong></div><div className="flex justify-between"><span>{t.unemployment}</span><strong>{result.temDireitoSeguroDesemprego ? t.yes : t.no}</strong></div></div><p className="mt-5 text-xs leading-5 text-slate-500">{t.disclaimer}</p><Button className="mt-5 w-full" variant="outline" icon={copied ? Check : Copy} onClick={copyResult}>{copied ? t.copied : t.copy}</Button></> : <div className="mt-6 rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">{t.empty}</div>}
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{label}</span>{children}</label>;
}
