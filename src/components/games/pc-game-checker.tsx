'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Cpu, HelpCircle } from 'lucide-react';
import { gamesCatalog } from '@/lib/games/games';

type Level = 'unknown' | 'below' | 'minimum' | 'recommended';

function extractFirstNumber(value: string) {
  const match = value.match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(',', '.')) : 0;
}

export function PcGameChecker() {
  const [slug, setSlug] = useState(gamesCatalog[0].slug);
  const [cpuLevel, setCpuLevel] = useState<Level>('unknown');
  const [gpuLevel, setGpuLevel] = useState<Level>('unknown');
  const [ram, setRam] = useState(16);
  const [storage, setStorage] = useState(120);
  const game = gamesCatalog.find((item) => item.slug === slug) ?? gamesCatalog[0];
  const minimumRam = extractFirstNumber(game.setupMin.ram);
  const minimumStorage = extractFirstNumber(game.setupMin.storage);

  useEffect(() => {
    const sharedSlug = new URLSearchParams(window.location.search).get('jogo');
    if (sharedSlug && gamesCatalog.some((item) => item.slug === sharedSlug)) setSlug(sharedSlug);
  }, []);

  const verdict = useMemo(() => {
    if (cpuLevel === 'below' || gpuLevel === 'below' || ram < minimumRam || storage < minimumStorage) {
      return { tone: 'warning' as const, title: 'Há um gargalo provável', text: 'Pelo menos um item informado está abaixo da referência mínima cadastrada. Revise o componente destacado antes de comprar ou instalar.' };
    }
    if (cpuLevel === 'unknown' || gpuLevel === 'unknown') {
      return { tone: 'unknown' as const, title: 'Ainda falta comparar CPU ou GPU', text: 'Confira o modelo exato das peças. RAM e espaço sozinhos não garantem que o jogo rode com estabilidade.' };
    }
    if (cpuLevel === 'recommended' && gpuLevel === 'recommended' && ram >= 16) {
      return { tone: 'success' as const, title: 'Seu relato atende à referência recomendada', text: 'A configuração informada parece adequada ao perfil recomendado do catálogo. Resolução, temperatura, drivers e qualidade gráfica ainda afetam o resultado real.' };
    }
    return { tone: 'success' as const, title: 'Seu relato atende à referência mínima', text: 'A configuração informada parece compatível com a base mínima. Espere precisar ajustar qualidade ou resolução conforme o jogo.' };
  }, [cpuLevel, gpuLevel, minimumRam, minimumStorage, ram, storage]);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-600 text-white"><Cpu className="h-6 w-6" /></span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Comparador orientativo</p>
          <h2 className="rj-display mt-1 text-2xl font-extrabold text-slate-950">Compare seu PC com o jogo</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="text-sm font-bold text-slate-800">Qual jogo você quer verificar?</span>
          <select value={slug} onChange={(event) => setSlug(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 font-semibold text-slate-950">
            {gamesCatalog.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}
          </select>
        </label>
        <LevelField label="Seu processador em relação ao mínimo abaixo" value={cpuLevel} onChange={setCpuLevel} />
        <LevelField label="Sua placa de vídeo em relação ao mínimo abaixo" value={gpuLevel} onChange={setGpuLevel} />
        <NumberInput label="Memória RAM disponível" value={ram} onChange={setRam} suffix="GB" />
        <NumberInput label="Espaço livre no disco" value={storage} onChange={setStorage} suffix="GB" />
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
        <Spec title="Referência mínima" cpu={game.setupMin.cpu} gpu={game.setupMin.gpu} ram={game.setupMin.ram} storage={game.setupMin.storage} />
        <Spec title="Referência recomendada" cpu={game.setupRec.cpu} gpu={game.setupRec.gpu} ram={game.setupRec.ram} storage={game.setupRec.storage} />
      </div>

      <div className={`mt-5 rounded-2xl border p-5 ${verdict.tone === 'warning' ? 'border-amber-200 bg-amber-50' : verdict.tone === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex items-start gap-3">
          {verdict.tone === 'warning' ? <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" /> : verdict.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" /> : <HelpCircle className="mt-0.5 h-5 w-5 text-slate-600" />}
          <div>
            <h3 className="font-extrabold text-slate-950">{verdict.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{verdict.text}</p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">Estimativa educativa baseada no catálogo editorial do Jato Games; não substitui requisitos oficiais nem um benchmark do seu equipamento.</p>
      <Link href={`/games/jogos/${game.slug}`} className="mt-5 inline-flex font-bold text-teal-700 hover:underline">Ver ficha completa e dicas de {game.title}</Link>
    </section>
  );
}

function LevelField({ label, value, onChange }: { label: string; value: Level; onChange: (value: Level) => void }) {
  return (
    <label>
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as Level)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950">
        <option value="unknown">Não sei comparar</option>
        <option value="below">Abaixo do mínimo</option>
        <option value="minimum">Igual ou acima do mínimo</option>
        <option value="recommended">Igual ou acima do recomendado</option>
      </select>
    </label>
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
