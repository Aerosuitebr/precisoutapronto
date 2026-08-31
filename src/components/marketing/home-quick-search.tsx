'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const INTENTS = [
  { label: 'Criar orçamento com Pix', href: '/orcamento-com-pix#montar', terms: 'orcamento proposta cobrar pix whatsapp cliente' },
  { label: 'Criar recibo', href: '/gerador-de-recibo#ferramenta', terms: 'recibo pagamento mei autonomo aluguel pdf' },
  { label: 'Orçamento para eletricista', href: '/orcamento-para/eletricista', terms: 'eletricista instalacao eletrica orcamento whatsapp pix' },
  { label: 'Modelos de orçamento', href: '/modelos-de-orcamento', terms: 'modelos orcamento profissao servico prestador' },
  { label: 'Orçamento para limpeza pós-obra', href: '/orcamento-para/limpeza-pos-obra', terms: 'limpeza pos obra apartamento casa orçamento' },
  { label: 'Orçamento para móveis planejados', href: '/orcamento-para/moveis-planejados', terms: 'marcenaria cozinha armario moveis planejados orçamento' },
  { label: 'Orçamento para técnico de informática', href: '/orcamento-para/tecnico-de-informatica', terms: 'computador notebook manutencao formatacao tecnico orçamento' },
  { label: 'Criar contrato de serviço', href: '/gerador-de-contrato#ferramenta', terms: 'contrato prestacao servico freelancer mei' },
  { label: 'Fazer currículo', href: '/gerador-de-curriculo#ferramenta', terms: 'curriculo emprego vaga pdf resume cv' },
  { label: 'Calcular rescisão', href: '/calculadora-de-rescisao', terms: 'rescisao clt demissao fgts ferias aviso previo' },
  { label: 'Gerar referências ABNT', href: '/gerador-de-referencias-abnt#ferramenta', terms: 'abnt referencias bibliografia faculdade trabalho academico' },
  { label: 'Orçamento Pix Copia e Cola', href: '/orcamento-com-pix#montar', terms: 'orcamento pix copiar e colar copia cola codigo pagamento' },
  { label: 'Orçamento para personal trainer', href: '/orcamento-para/personal-trainer', terms: 'personal trainer academia treino consultoria esportiva orçamento' },
  { label: 'Declaração de residência', href: '/declaracao-de-residencia', terms: 'declaracao residência comprovante endereço juridico documento' },
  { label: 'Corrigir redação ENEM', href: '/corretor-de-redacao-enem', terms: 'redacao enem nota texto estudante' },
  { label: 'Editar PDF', href: '/editor-de-pdf-online', terms: 'pdf editar juntar dividir comprimir arquivo' },
  { label: 'Calcular férias', href: '/calculadora-de-ferias', terms: 'ferias clt salario abono' },
  { label: 'Calcular 13º salário', href: '/calculadora-de-decimo-terceiro', terms: 'decimo terceiro 13 salario proporcional parcelas clt' },
  { label: 'Gerar QR Code Pix', href: '/gerador-de-qr-code-pix#gerar', terms: 'pix qr code copia cola cobrar' }
] as const;

const STOP_WORDS = new Set(['a', 'ao', 'as', 'com', 'como', 'de', 'do', 'e', 'em', 'essa', 'esse', 'eu', 'fazer', 'meu', 'minha', 'no', 'o', 'os', 'para', 'preciso', 'quero', 'uma', 'um']);

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function queryTokens(value: string) {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

export function HomeQuickSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const normalized = normalize(query);
  const results = useMemo(() => {
    if (!normalized) return INTENTS.slice(0, 4);
    const tokens = queryTokens(normalized);
    return INTENTS
      .map((item) => {
        const label = normalize(item.label);
        const haystack = normalize(`${item.label} ${item.terms}`);
        const score = tokens.reduce((total, token) => total + (label.includes(token) ? 3 : haystack.includes(token) ? 1 : 0), 0);
        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ item }) => item);
  }, [normalized]);

  function go(href: string, label: string, source: 'submit' | 'suggestion') {
    trackEvent('home_search_selected', { query: normalized, result: label, destination: href, source });
    router.push(href);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (results[0]) go(results[0].href, results[0].label, 'submit');
    else {
      trackEvent('home_search_no_results', { query: normalized });
      router.push('/recursos');
    }
  }

  return (
    <div className="relative w-full max-w-3xl">
      <form onSubmit={submit} role="search" aria-label="Buscar ferramenta">
        <label htmlFor="home-tool-search" className="sr-only">Qual ferramenta você procura?</label>
        <div className="flex rounded-2xl bg-white p-1.5 shadow-[0_18px_55px_-24px_rgba(3,31,75,0.32)] ring-1 ring-[#0b5cff]/25 focus-within:ring-2 focus-within:ring-[#0b5cff]">
          <Search className="ml-2 mt-3 h-5 w-5 shrink-0 text-slate-600 sm:ml-3" aria-hidden />
          <input
            id="home-tool-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: calcular férias, criar recibo, corrigir redação..."
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-base font-medium text-slate-950 outline-none placeholder:text-slate-600 sm:px-3"
          />
          <button type="submit" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-[#0b5cff] px-3 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0648c9] hover:shadow-md active:translate-y-0 sm:px-5" aria-label="Buscar">
            <span className="hidden sm:inline">Encontrar</span>
            <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span className="mr-1 font-semibold">Experimente:</span>
        {INTENTS.slice(0, 4).map((item) => (
          <button key={item.href} type="button" onClick={() => go(item.href, item.label, 'suggestion')} className="min-h-11 rounded-full border border-[#0b5cff]/20 bg-white px-4 py-2 font-bold text-[#031f4b] transition hover:border-[#0b5cff]/50 hover:bg-[#eef5ff] hover:text-[#0b5cff] sm:min-h-0 sm:px-3 sm:py-1.5">
            {item.label.replace(/^(Criar|Calcular|Gerar) /, '')}
          </button>
        ))}
      </div>
      {query ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-950 shadow-2xl" role="listbox" aria-label="Ferramentas encontradas">
          {results.length ? results.map((item) => (
            <button key={item.href} type="button" role="option" aria-selected="false" onClick={() => go(item.href, item.label, 'suggestion')} className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-[#eef5ff] hover:text-[#0b5cff]">
              {item.label}<ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )) : <p className="px-3 py-3 text-sm text-slate-600">Não encontrei uma correspondência direta. Ao buscar, você será levado ao catálogo completo.</p>}
        </div>
      ) : null}
    </div>
  );
}
