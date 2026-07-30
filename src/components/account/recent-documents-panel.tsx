'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Clock3, CopyPlus, FileText, Search, Share2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { trackEvent } from '@/lib/analytics';
import { useDocumentShare } from '@/hooks/use-document-share';
import {
  filterDocumentHistory,
  sortDocumentHistory,
  type DocumentHistoryFilter,
  type DocumentHistoryItem
} from '@/lib/document-history';

const VISIBLE_LIMIT = 8;
const FILTERS: { id: DocumentHistoryFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'favorites', label: 'Favoritos' },
  { id: 'curriculo', label: 'Currículos' },
  { id: 'contratos', label: 'Contratos' },
  { id: 'recibos', label: 'Recibos' },
  { id: 'propostas', label: 'Propostas' }
];

export function RecentDocumentsPanel() {
  const { toast } = useToast();
  const { shareDocument, sharing } = useDocumentShare();
  const [documents, setDocuments] = useState<DocumentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [filter, setFilter] = useState<DocumentHistoryFilter>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/documents', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<{ documents?: DocumentHistoryItem[] }>;
      })
      .then((payload) => {
        if (active) setDocuments(payload.documents ?? []);
      })
      .catch(() => {
        if (active) toast('Não foi possível carregar seus documentos recentes.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [toast]);

  const filtered = useMemo(
    () => filterDocumentHistory(documents, filter, query),
    [documents, filter, query]
  );
  const visible = showAll ? filtered : filtered.slice(0, VISIBLE_LIMIT);

  function trackOpen(item: DocumentHistoryItem) {
    trackEvent('account_document_resumed', { tool_id: item.toolId });
  }

  function selectFilter(nextFilter: DocumentHistoryFilter) {
    setFilter(nextFilter);
    setShowAll(false);
    trackEvent('account_documents_filtered', { filter_id: nextFilter });
  }

  function trackSearch() {
    if (!query.trim()) return;
    trackEvent('account_documents_searched', {
      result_count: filtered.length,
      has_results: filtered.length > 0
    });
  }

  async function toggleFavorite(item: DocumentHistoryItem) {
    const key = `${item.toolId}:${item.artifactId}`;
    if (updating === key) return;
    const nextValue = !item.isFavorite;
    setUpdating(key);
    setDocuments((current) =>
      sortDocumentHistory(
        current.map((document) =>
          document.toolId === item.toolId && document.artifactId === item.artifactId
            ? { ...document, isFavorite: nextValue }
            : document
        )
      )
    );
    try {
      const response = await fetch(
        `/api/documents/${encodeURIComponent(item.toolId)}/${encodeURIComponent(item.artifactId)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFavorite: nextValue })
        }
      );
      if (!response.ok) throw new Error();
      trackEvent(nextValue ? 'account_document_favorited' : 'account_document_unfavorited', {
        tool_id: item.toolId
      });
    } catch {
      setDocuments((current) =>
        sortDocumentHistory(
          current.map((document) =>
            document.toolId === item.toolId && document.artifactId === item.artifactId
              ? { ...document, isFavorite: item.isFavorite }
              : document
          )
        )
      );
      toast('Não foi possível atualizar o favorito.');
    } finally {
      setUpdating(null);
    }
  }

  async function duplicateDocument(item: DocumentHistoryItem) {
    const key = `${item.toolId}:${item.artifactId}`;
    if (duplicating === key) return;
    setDuplicating(key);
    try {
      const response = await fetch(
        `/api/documents/${encodeURIComponent(item.toolId)}/${encodeURIComponent(item.artifactId)}`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error();
      const payload = await response.json() as { document?: DocumentHistoryItem };
      if (!payload.document) throw new Error();
      setDocuments((current) => sortDocumentHistory([payload.document!, ...current]));
      trackEvent('account_document_duplicated', { tool_id: item.toolId });
      toast('Cópia criada. Você já pode abri-la e editar.');
    } catch {
      toast('Não foi possível duplicar o documento.');
    } finally {
      setDuplicating(null);
    }
  }

  return (
    <section id="documentos" className="scroll-mt-24 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
            <Clock3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Documentos recentes</h2>
            <p className="text-sm text-slate-600">Retome documentos salvos em qualquer ferramenta.</p>
          </div>
        </div>
        {!loading ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {documents.length}{documents.length === 50 ? '+' : ''} salvos
          </span>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Carregando…</p>
      ) : documents.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            Seus documentos salvos aparecerão aqui para você continuar de onde parou.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-3">
            <Link href="/ferramentas">Criar primeiro documento</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            <label className="relative block">
              <span className="sr-only">Buscar documentos por nome ou tipo</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowAll(false);
                }}
                onBlur={trackSearch}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') trackSearch();
                }}
                placeholder="Buscar por nome ou tipo de documento"
                className="pl-10"
              />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar documentos">
              {FILTERS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={filter === option.id}
                  onClick={() => selectFilter(option.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    filter === option.id
                      ? 'bg-violet-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-violet-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
              <p className="text-sm font-semibold text-slate-700">Nenhum documento encontrado.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  selectFilter('all');
                }}
                className="mt-2 text-sm font-bold text-violet-700 hover:text-violet-900"
              >
                Limpar busca e filtros
              </button>
            </div>
          ) : (
            <>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {visible.map((item) => (
              <li key={`${item.toolId}:${item.artifactId}`}>
                <div className="group flex h-full items-center rounded-2xl border border-slate-200 transition hover:border-violet-300 hover:bg-violet-50/50">
                  <Link
                    href={item.editorHref}
                    onClick={() => trackOpen(item)}
                    className="flex min-w-0 flex-1 items-center gap-3 p-4"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-violet-700">
                      <FileText className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-950">{item.title}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {item.toolLabel} · atualizado em{' '}
                        {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-violet-700" />
                  </Link>
                  <button
                    type="button"
                    aria-label={`Compartilhar ${item.title}`}
                    title="Compartilhar documento"
                    disabled={sharing}
                    onClick={() => void shareDocument({
                      toolId: item.toolId,
                      artifactId: item.artifactId,
                      title: item.title,
                      source: 'account'
                    })}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-sky-700 disabled:opacity-50"
                  >
                    <Share2 className="h-4.5 w-4.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Duplicar ${item.title}`}
                    title="Duplicar documento"
                    disabled={duplicating === `${item.toolId}:${item.artifactId}`}
                    onClick={() => void duplicateDocument(item)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-violet-700 disabled:opacity-50"
                  >
                    <CopyPlus className="h-4.5 w-4.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={item.isFavorite ? `Remover ${item.title} dos favoritos` : `Favoritar ${item.title}`}
                    title={item.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    disabled={updating === `${item.toolId}:${item.artifactId}`}
                    onClick={() => void toggleFavorite(item)}
                    className="mr-3 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-amber-600 disabled:opacity-50"
                  >
                    <Star className={`h-4.5 w-4.5 ${item.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {filtered.length > VISIBLE_LIMIT ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-4"
              onClick={() => setShowAll((current) => !current)}
            >
              {showAll ? 'Mostrar menos' : `Ver mais ${filtered.length - VISIBLE_LIMIT}`}
            </Button>
          ) : null}
            </>
          )}
        </>
      )}
    </section>
  );
}
