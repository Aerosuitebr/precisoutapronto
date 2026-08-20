'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const INTENTS = [
  { label: 'Criar recibo', href: '/gerador-de-recibo#ferramenta', terms: 'recibo pagamento mei autonomo aluguel pdf' },
  { label: 'Calcular rescisão', href: '/calculadora-de-rescisao', terms: 'rescisao clt demissao fgts ferias aviso previo' },
  { label: 'Gerar referências ABNT', href: '/gerador-de-referencias-abnt#ferramenta', terms: 'abnt referencias bibliografia faculdade trabalho academico' },
  { label: 'Criar contrato de serviço', href: '/gerador-de-contrato#ferramenta', terms: 'contrato prestacao servico freelancer mei' },
  { label: 'Fazer currículo', href: '/gerador-de-curriculo#ferramenta', terms: 'curriculo emprego vaga pdf resume cv' },
  { label: 'Criar orçamento com Pix', href: '/orcamento-com-pix#montar', terms: 'orcamento proposta cobrar pix whatsapp cliente' },
  { label: 'Orçamento Pix Copia e Cola', href: '/orcamento-pix-copia-e-cola', terms: 'orcamento pix copiar e colar copia cola codigo pagamento' },
  { label: 'Orçamento para personal trainer', href: '/orcamento-para/personal-trainer', terms: 'personal trainer academia treino consultoria esportiva orçamento' },
  { label: 'Declaração de residência', href: '/declaracao-de-residencia', terms: 'declaracao residência comprovante endereço juridico documento' },
  { label: 'Corrigir redação ENEM', href: '/corretor-de-redacao-enem', terms: 'redacao enem nota texto estudante' },
  { label: 'Editar PDF', href: '/editor-de-pdf-online', terms: 'pdf editar juntar dividir comprimir arquivo' },
  { label: 'Calcular férias', href: '/calculadora-de-ferias', terms: 'ferias clt salario abono' },
  { label: 'Gerar QR Code Pix', href: '/gerador-de-qr-code-pix#gerar', terms: 'pix qr code copia cola cobrar' }
] as const;

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function HomeQuickSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const normalized = normalize(query);
  const results = useMemo(() => {
    if (!normalized) return INTENTS.slice(0, 4);
    return INTENTS.filter((item) => normalize(`${item.label} ${item.terms}`).includes(normalized)).slice(0, 5);
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
    <div className="relative max-w-2xl">
      <form onSubmit={submit} role="search" aria-label="Buscar ferramenta">
        <label htmlFor="home-tool-search" className="sr-only">O que você precisa resolver hoje?</label>
        <div className="flex rounded-2xl bg-white p-1.5 shadow-[0_18px_55px_-24px_rgba(3,31,75,0.32)] ring-1 ring-[#0b5cff]/20 focus-within:ring-2 focus-within:ring-[#0b5cff]">
          <Search className="ml-2 mt-3 h-5 w-5 shrink-0 text-slate-600 sm:ml-3" aria-hidden />
          <input
            id="home-tool-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="O que você precisa?"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-base font-medium text-slate-950 outline-none placeholder:text-slate-600 sm:px-3"
          />
          <button type="submit" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-[#0b5cff] px-3 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0648c9] hover:shadow-md active:translate-y-0 sm:px-5" aria-label="Buscar">
            <span className="hidden sm:inline">Encontrar</span>
            <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/90">
        <span className="mr-1 font-semibold">Buscas rápidas:</span>
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
          )) : <p className="px-3 py-3 text-sm text-slate-600">Não encontramos essa tarefa. Veja o catálogo completo.</p>}
        </div>
      ) : null}
    </div>
  );
}
