'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calculator, Clock3, Copy, Crosshair, HardDrive, Link2, Share2 } from 'lucide-react';

type RecentCalculation = { label: string; url: string; createdAt: number };

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  suffix
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <span className="mt-2 flex h-12 items-center rounded-xl border border-slate-300 bg-white px-3 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(Math.max(min, Number(event.target.value) || 0))}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-950 outline-none"
        />
        {suffix ? <span className="ml-2 text-sm font-medium text-slate-500">{suffix}</span> : null}
      </span>
    </label>
  );
}

function buildShareUrl(params: Record<string, number>) {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  return url.toString();
}

function readSharedNumber(query: URLSearchParams, key: string) {
  if (!query.has(key)) return null;
  const value = Number(query.get(key));
  return Number.isFinite(value) ? value : null;
}

function useCalculationHistory(tool: string, label: string, params: Record<string, number>) {
  const [items, setItems] = useState<RecentCalculation[]>([]);
  const serializedParams = JSON.stringify(params);

  useEffect(() => {
    const storageKey = `precisoutapronto-games:${tool}:recent`;
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        setItems(JSON.parse(saved) as RecentCalculation[]);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
  }, [tool]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storageKey = `precisoutapronto-games:${tool}:recent`;
      const savedParams = JSON.parse(serializedParams) as Record<string, number>;
      const nextItem = { label, url: buildShareUrl(savedParams), createdAt: Date.now() };
      setItems((current) => {
        const deduplicated = current.filter((item) => item.url !== nextItem.url);
        const next = [nextItem, ...deduplicated].slice(0, 4);
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [label, serializedParams, tool]);

  return items;
}

function RecentResults({ items }: { items: RecentCalculation[] }) {
  if (items.length < 2) return null;
  return (
    <aside className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
        <Clock3 className="h-4 w-4" /> Seus cálculos recentes
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <a key={item.url} href={item.url} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-teal-400 hover:text-teal-800">
            {item.label}
          </a>
        ))}
      </div>
    </aside>
  );
}

function ResultShare({ text, params }: { text: string; params: Record<string, number> }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = buildShareUrl(params);
    if (navigator.share) {
      await navigator.share({ title: 'Resultado no Precisou, Tá Pronto Games', text, url });
      return;
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
  }

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(buildShareUrl(params));
    setCopied(true);
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" onClick={copy} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 hover:border-teal-400">
        <Copy className="h-4 w-4" /> {copied ? 'Copiado' : 'Copiar resultado'}
      </button>
      <button type="button" onClick={copyLink} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 hover:border-teal-400">
        <Link2 className="h-4 w-4" /> Copiar link
      </button>
      <button type="button" onClick={share} className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-600 px-3 text-sm font-bold text-white hover:bg-teal-500">
        <Share2 className="h-4 w-4" /> Compartilhar
      </button>
    </div>
  );
}

export function EdpiCalculator() {
  const [dpi, setDpi] = useState(800);
  const [sensitivity, setSensitivity] = useState(0.35);
  const edpi = useMemo(() => Math.round(dpi * sensitivity * 100) / 100, [dpi, sensitivity]);
  const result = `Meu eDPI é ${edpi} (${dpi} DPI × ${sensitivity} de sensibilidade).`;
  const history = useCalculationHistory('edpi', `${edpi} eDPI`, { dpi, sens: sensitivity });

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sharedDpi = readSharedNumber(query, 'dpi');
    const sharedSensitivity = readSharedNumber(query, 'sens');
    if (sharedDpi !== null && sharedDpi > 0) setDpi(sharedDpi);
    if (sharedSensitivity !== null && sharedSensitivity >= 0) setSensitivity(sharedSensitivity);
  }, []);

  return (
    <ToolCard icon={Crosshair} eyebrow="FPS competitivo" title="Calculadora de eDPI" description="Compare sensibilidades no mesmo jogo sem depender apenas do DPI do mouse.">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="DPI do mouse" value={dpi} onChange={setDpi} step={50} />
        <NumberField label="Sensibilidade no jogo" value={sensitivity} onChange={setSensitivity} step={0.01} />
      </div>
      <ResultBox label="Seu eDPI" value={edpi.toLocaleString('pt-BR')} note="eDPI = DPI × sensibilidade. Compare apenas dentro do mesmo jogo; escalas variam entre títulos." />
      <ResultShare text={result} params={{ dpi, sens: sensitivity }} />
      <RecentResults items={history} />
    </ToolCard>
  );
}

export function StoragePlanner() {
  const [capacity, setCapacity] = useState(1000);
  const [system, setSystem] = useState(180);
  const [installed, setInstalled] = useState(420);
  const [newGame, setNewGame] = useState(120);
  const rawFreeAfter = capacity - system - installed - newGame;
  const freeAfter = Math.max(0, rawFreeAfter);
  const usage = capacity > 0 ? Math.min(100, Math.round(((capacity - freeAfter) / capacity) * 100)) : 0;
  const fits = capacity - system - installed >= newGame;
  const result = fits
    ? `O jogo cabe no meu armazenamento. Restarão ${freeAfter} GB livres (${usage}% ocupado).`
    : `Faltam ${Math.abs(capacity - system - installed - newGame)} GB para instalar o jogo.`;
  const history = useCalculationHistory('storage', fits ? `${freeAfter} GB livres` : `Faltam ${Math.abs(rawFreeAfter)} GB`, { cap: capacity, sys: system, used: installed, game: newGame });

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const values = ['cap', 'sys', 'used', 'game'].map((key) => readSharedNumber(query, key));
    if (values[0] !== null && values[0] > 0) setCapacity(values[0]);
    if (values[1] !== null && values[1] >= 0) setSystem(values[1]);
    if (values[2] !== null && values[2] >= 0) setInstalled(values[2]);
    if (values[3] !== null && values[3] >= 0) setNewGame(values[3]);
  }, []);

  return (
    <ToolCard icon={HardDrive} eyebrow="PC e console" title="Planejador de armazenamento" description="Descubra se o próximo jogo cabe sem apagar arquivos no susto.">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="Capacidade do disco" value={capacity} onChange={setCapacity} suffix="GB" />
        <NumberField label="Sistema e reserva" value={system} onChange={setSystem} suffix="GB" />
        <NumberField label="Jogos já instalados" value={installed} onChange={setInstalled} suffix="GB" />
        <NumberField label="Tamanho do novo jogo" value={newGame} onChange={setNewGame} suffix="GB" />
      </div>
      <ResultBox label={fits ? 'Espaço livre depois da instalação' : 'Espaço insuficiente'} value={fits ? `${freeAfter} GB` : `Faltam ${Math.abs(rawFreeAfter)} GB`} note={fits ? `O disco ficará aproximadamente ${usage}% ocupado.` : 'Considere remover jogos não usados ou escolher outro disco.'} tone={fits ? 'success' : 'warning'} />
      <ResultShare text={result} params={{ cap: capacity, sys: system, used: installed, game: newGame }} />
      <RecentResults items={history} />
    </ToolCard>
  );
}

export function CostPerHourCalculator() {
  const [price, setPrice] = useState(249.9);
  const [hours, setHours] = useState(60);
  const [extra, setExtra] = useState(0);
  const total = price + extra;
  const cost = hours > 0 ? total / hours : 0;
  const result = `Este jogo custará cerca de ${cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} por hora considerando ${hours} horas jogadas.`;
  const history = useCalculationHistory('cost', `${cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/h`, { preco: price, extras: extra, horas: hours });

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sharedPrice = readSharedNumber(query, 'preco');
    const sharedExtra = readSharedNumber(query, 'extras');
    const sharedHours = readSharedNumber(query, 'horas');
    if (sharedPrice !== null && sharedPrice >= 0) setPrice(sharedPrice);
    if (sharedExtra !== null && sharedExtra >= 0) setExtra(sharedExtra);
    if (sharedHours !== null && sharedHours >= 0) setHours(sharedHours);
  }, []);

  return (
    <ToolCard icon={Calculator} eyebrow="Compra consciente" title="Custo por hora jogada" description="Compare preço, DLCs e tempo real de uso antes de comprar.">
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField label="Preço do jogo" value={price} onChange={setPrice} step={0.01} suffix="R$" />
        <NumberField label="DLCs e extras" value={extra} onChange={setExtra} step={0.01} suffix="R$" />
        <NumberField label="Horas esperadas" value={hours} onChange={setHours} suffix="h" />
      </div>
      <ResultBox label="Custo estimado por hora" value={cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} note={`Investimento total considerado: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Use como comparação pessoal, não como regra de qualidade.`} />
      <ResultShare text={result} params={{ preco: price, extras: extra, horas: hours }} />
      <RecentResults items={history} />
    </ToolCard>
  );
}

function ResultBox({
  label,
  value,
  note,
  tone = 'default'
}: {
  label: string;
  value: string;
  note: string;
  tone?: 'default' | 'success' | 'warning';
}) {
  return (
    <div className={`mt-5 rounded-2xl border p-5 ${tone === 'warning' ? 'border-amber-200 bg-amber-50' : tone === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-teal-200 bg-teal-50'}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">{label}</p>
      <p className="precisoutapronto-display mt-1 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{note}</p>
    </div>
  );
}

function ToolCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  children
}: {
  icon: typeof Calculator;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-28 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.4)] sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20"><Icon className="h-6 w-6" /></span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{eyebrow}</p>
          <h2 className="precisoutapronto-display mt-1 text-2xl font-extrabold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
