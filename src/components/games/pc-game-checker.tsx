'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, CheckCircle2, Cpu, Gauge, HardDrive, MemoryStick, Play, ShieldCheck } from 'lucide-react';
import { gamesCatalog, type GameEntry } from '@/lib/games/games';

type ScanMode = 'passive' | 'active';
type ScanStatus = 'idle' | 'running' | 'done';
type DeviceMemoryNavigator = Navigator & { deviceMemory?: number };
type Metric = { key: string; label: string; score: number; confidence: number; detail: string; source: string };
type ScanResult = { mode: ScanMode; fidelity: number; metrics: Metric[]; gpu: string; cores: number; ram?: number; webgl: string };

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function extractFirstNumber(value: string) {
  const match = value.match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(',', '.')) : 0;
}

function gpuTier(value: string) {
  const text = value.toLowerCase();
  if (/rtx\s?40|rx\s?7[678]/.test(text)) return 95;
  if (/rtx\s?3(07|08|09)|rx\s?6(7|8|9)/.test(text)) return 86;
  if (/rtx\s?3060|rx\s?6600|rx\s?6700/.test(text)) return 76;
  if (/rtx\s?3050|gtx\s?1660|rx\s?5600/.test(text)) return 65;
  if (/gtx\s?1650|rx\s?580|rx\s?570/.test(text)) return 55;
  if (/gtx\s?10(50|60)|gtx\s?9|radeon|iris|vega/.test(text)) return 44;
  if (/intel|integrated|uhd|microsoft basic/.test(text)) return 30;
  return 50;
}

function cpuBenchmark() {
  const started = performance.now();
  let operations = 0;
  let accumulator = 0;
  while (performance.now() - started < 360) {
    for (let index = 1; index <= 12000; index += 1) accumulator += Math.sqrt(index * 1.000001) % 17;
    operations += 12000;
  }
  const elapsed = performance.now() - started;
  return { throughput: operations / elapsed, guard: accumulator };
}

function inspectGraphics() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
  if (!gl) return { renderer: 'WebGL indisponível', webgl: 'Indisponível', maxTexture: 0 };
  const debug = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : 'GPU protegida pelo navegador';
  return {
    renderer,
    webgl: typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext ? 'WebGL 2' : 'WebGL 1',
    maxTexture: Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 0
  };
}

async function runScan(mode: ScanMode, storageFree: number, game: GameEntry): Promise<ScanResult> {
  const cores = navigator.hardwareConcurrency || 1;
  const ram = (navigator as DeviceMemoryNavigator).deviceMemory;
  const graphics = inspectGraphics();
  const cpu = mode === 'active' ? cpuBenchmark() : null;
  if (mode === 'active') await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  const cpuScore = mode === 'active'
    ? clamp(10 + Math.log2(Math.max(cpu?.throughput ?? 1, 1)) * 4 + Math.min(cores, 16) * 2)
    : clamp(25 + Math.min(cores, 16) * 4);
  const graphicsBase = gpuTier(graphics.renderer);
  const minimumGpu = gpuTier(game.setupMin.gpu);
  const gpuScore = clamp(55 + (graphicsBase - minimumGpu) * 1.35 + (graphics.webgl === 'WebGL 2' ? 5 : 0) + (graphics.maxTexture >= 16384 ? 4 : 0));
  const minimumRam = Math.max(extractFirstNumber(game.setupMin.ram), 1);
  const minimumStorage = Math.max(extractFirstNumber(game.setupMin.storage), 1);
  const ramScore = ram ? clamp(55 * (ram / minimumRam)) : 48;
  const storageScore = storageFree > 0 ? clamp(55 * (storageFree / minimumStorage)) : 35;
  const metrics: Metric[] = [
    { key: 'cpu', label: 'Processamento', score: cpuScore, confidence: mode === 'active' ? 86 : 58, detail: `${cores} processadores lógicos${cpu ? ` · índice local ${Math.round(cpu.throughput)}` : ''}`, source: mode === 'active' ? 'Benchmark ativo + navegador' : 'Navegador' },
    { key: 'gpu', label: 'Gráficos', score: gpuScore, confidence: mode === 'active' ? 78 : 62, detail: `${graphics.renderer} · ${graphics.webgl}`, source: mode === 'active' ? 'Capacidade WebGL + identificação' : 'WebGL' },
    { key: 'ram', label: 'Memória', score: ramScore, confidence: ram ? 72 : 28, detail: ram ? `Aproximadamente ${ram} GB reportados` : 'Quantidade ocultada pelo navegador', source: ram ? 'Estimativa do navegador' : 'Não detectado' },
    { key: 'storage', label: 'Armazenamento', score: storageScore, confidence: storageFree > 0 ? 92 : 12, detail: storageFree > 0 ? `${storageFree} GB livres informados` : 'Espaço livre precisa ser informado', source: storageFree > 0 ? 'Informado pelo usuário' : 'Não detectado' }
  ];
  const fidelity = clamp(metrics.reduce((sum, metric) => sum + metric.confidence, 0) / metrics.length);
  return { mode, fidelity, metrics, gpu: graphics.renderer, cores, ram, webgl: graphics.webgl };
}

export function PcGameChecker() {
  const [slug, setSlug] = useState(gamesCatalog[0].slug);
  const [storage, setStorage] = useState(0);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);
  const game = gamesCatalog.find((item) => item.slug === slug) ?? gamesCatalog[0];
  const minimumRam = extractFirstNumber(game.setupMin.ram);
  const minimumStorage = extractFirstNumber(game.setupMin.storage);

  useEffect(() => {
    const sharedSlug = new URLSearchParams(window.location.search).get('jogo');
    if (sharedSlug && gamesCatalog.some((item) => item.slug === sharedSlug)) setSlug(sharedSlug);
  }, []);

  async function scan(mode: ScanMode) {
    setStatus('running');
    await new Promise<void>((resolve) => window.setTimeout(resolve, 120));
    setResult(await runScan(mode, storage, game));
    setStatus('done');
  }

  const analysis = useMemo(() => {
    if (!result) return null;
    const average = clamp(result.metrics.reduce((sum, metric) => sum + metric.score, 0) / result.metrics.length);
    const bottleneck = [...result.metrics].sort((a, b) => a.score - b.score)[0];
    const ramMetric = result.metrics.find((metric) => metric.key === 'ram');
    const storageMetric = result.metrics.find((metric) => metric.key === 'storage');
    const requirementsWarning = (result.ram && result.ram < minimumRam) || (storage > 0 && storage < minimumStorage);
    return {
      average,
      bottleneck,
      requirementsWarning,
      ramMetric,
      storageMetric,
      verdict: requirementsWarning || average < 48
        ? 'Há limitações que merecem atenção antes de instalar.'
        : average >= 76
          ? 'O perfil medido é promissor para esta referência.'
          : 'O perfil parece intermediário; ajustes gráficos podem ser necessários.'
    };
  }, [minimumRam, minimumStorage, result, storage]);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-600 text-white"><Cpu className="h-6 w-6" /></span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Diagnóstico de desempenho</p>
          <h2 className="precisoutapronto-display mt-1 text-2xl font-extrabold text-slate-950">Meça seu PC e compare com o jogo</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">O processamento ocorre neste dispositivo. O resultado não é enviado nem salvo no servidor.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="text-sm font-bold text-slate-800">Qual jogo você quer verificar?</span>
          <select value={slug} onChange={(event) => setSlug(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 font-semibold text-slate-950">
            {gamesCatalog.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}
          </select>
        </label>
        <NumberInput label="Espaço livre no disco (opcional, aumenta a fidelidade)" value={storage} onChange={setStorage} suffix="GB" />
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
          O navegador não revela o espaço livre total do SSD. Informe-o manualmente se desejar incluir esse item no relatório.
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
          <div>
            <h3 className="font-extrabold text-slate-950">Escolha o nível da análise</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">O teste completo executa uma carga curta de CPU e inspeciona capacidades WebGL. Pode causar uso elevado por menos de um segundo.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" disabled={status === 'running'} onClick={() => scan('active')} className="inline-flex h-12 items-center gap-2 rounded-xl bg-teal-700 px-5 font-bold text-white shadow-lg hover:bg-teal-600 disabled:opacity-60">
            <Play className="h-4 w-4" /> {status === 'running' ? 'Medindo…' : 'Concordo e iniciar teste completo'}
          </button>
          <button type="button" disabled={status === 'running'} onClick={() => scan('passive')} className="inline-flex h-12 items-center rounded-xl border border-teal-300 bg-white px-5 font-bold text-teal-800 hover:bg-teal-100 disabled:opacity-60">
            Continuar sem teste ativo
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
        <Spec title="Referência mínima" cpu={game.setupMin.cpu} gpu={game.setupMin.gpu} ram={game.setupMin.ram} storage={game.setupMin.storage} />
        <Spec title="Referência recomendada" cpu={game.setupRec.cpu} gpu={game.setupRec.gpu} ram={game.setupRec.ram} storage={game.setupRec.storage} />
      </div>

      {result && analysis ? <DiagnosticReport result={result} analysis={analysis} gameTitle={game.title} /> : null}

      <p className="mt-5 text-xs leading-5 text-slate-500">O índice compara medições do navegador e dados fornecidos, não reproduz o motor gráfico do jogo. Temperatura, drivers, resolução e processos abertos alteram o desempenho real.</p>
      <Link href={`/games/jogos/${game.slug}`} className="mt-5 inline-flex font-bold text-teal-700 hover:underline">Ver ficha completa e dicas de {game.title}</Link>
    </section>
  );
}

function DiagnosticReport({ result, analysis, gameTitle }: { result: ScanResult; analysis: { average: number; bottleneck: Metric; requirementsWarning: boolean; verdict: string }; gameTitle: string }) {
  return (
    <section className="mt-7 overflow-hidden rounded-[24px] border border-slate-800 bg-slate-950 text-white shadow-xl">
      <header className="grid gap-5 border-b border-white/10 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <ScoreRing score={analysis.average} />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">Relatório para {gameTitle}</p>
          <h3 className="precisoutapronto-display mt-2 text-2xl font-black">{analysis.verdict}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">Fidelidade estimada: <strong className="text-white">{result.fidelity}%</strong> · {result.mode === 'active' ? 'benchmark ativo autorizado' : 'leitura passiva do navegador'}.</p>
        </div>
      </header>
      <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h4 className="font-extrabold">Mapa de capacidade</h4>
          <div className="mt-5 space-y-5">
            {result.metrics.map((metric) => <MetricBar key={metric.key} metric={metric} />)}
          </div>
        </div>
        <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">Análise do gargalo</p>
          <h4 className="mt-2 text-xl font-extrabold">{analysis.bottleneck.label}</h4>
          <p className="mt-3 text-sm leading-6 text-slate-300">{analysis.bottleneck.detail}</p>
          <div className="mt-5 rounded-xl bg-black/20 p-4">
            <p className="text-xs text-slate-400">Origem da evidência</p>
            <p className="mt-1 font-bold">{analysis.bottleneck.source}</p>
            <p className="mt-3 text-xs text-slate-400">Confiança neste item</p>
            <p className="mt-1 font-bold">{analysis.bottleneck.confidence}%</p>
          </div>
          {analysis.requirementsWarning ? <p className="mt-4 flex gap-2 text-sm leading-6 text-amber-200"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Um valor objetivo está abaixo da referência mínima cadastrada.</p> : <p className="mt-4 flex gap-2 text-sm leading-6 text-emerald-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> Nenhum valor objetivo informado ficou abaixo do mínimo.</p>}
        </aside>
      </div>
    </section>
  );
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="9" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#2dd4bf" strokeWidth="9" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-2xl font-black">{score}</span>
    </div>
  );
}

function MetricBar({ metric }: { metric: Metric }) {
  const Icon = metric.key === 'cpu' ? Activity : metric.key === 'gpu' ? Gauge : metric.key === 'ram' ? MemoryStick : HardDrive;
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-teal-300" /><span className="font-bold">{metric.label}</span></div>
        <span className="text-sm font-black">{metric.score}/100</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-amber-300" style={{ width: `${metric.score}%` }} /></div>
      <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-400"><span>{metric.detail}</span><span>fidelidade {metric.confidence}%</span></div>
    </div>
  );
}

function NumberInput({ label, value, onChange, suffix }: { label: string; value: number; onChange: (value: number) => void; suffix: string }) {
  return (
    <label>
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <span className="mt-2 flex h-12 items-center rounded-xl border border-slate-300 bg-white px-3">
        <input type="number" min={0} value={value} onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))} className="min-w-0 flex-1 bg-transparent font-semibold text-slate-950 outline-none" />
        <span className="text-sm text-slate-500">{suffix}</span>
      </span>
    </label>
  );
}

function Spec({ title, cpu, gpu, ram, storage }: { title: string; cpu: string; gpu: string; ram: string; storage: string }) {
  return (
    <div>
      <h3 className="font-extrabold text-slate-950">{title}</h3>
      <dl className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
        <div><dt className="inline font-bold">CPU: </dt><dd className="inline">{cpu}</dd></div>
        <div><dt className="inline font-bold">GPU: </dt><dd className="inline">{gpu}</dd></div>
        <div><dt className="inline font-bold">RAM: </dt><dd className="inline">{ram}</dd></div>
        <div><dt className="inline font-bold">Disco: </dt><dd className="inline">{storage}</dd></div>
      </dl>
    </div>
  );
}
