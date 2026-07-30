'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Clock3, FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { trackEvent } from '@/lib/analytics';
import { sortDocumentHistory, type DocumentHistoryItem } from '@/lib/document-history';

const VISIBLE_LIMIT = 8;

export function RecentDocumentsPanel() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

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

  const visible = showAll ? documents : documents.slice(0, VISIBLE_LIMIT);

  function trackOpen(item: DocumentHistoryItem) {
    trackEvent('account_document_resumed', { tool_id: item.toolId });
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

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
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
          {documents.length > VISIBLE_LIMIT ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-4"
              onClick={() => setShowAll((current) => !current)}
            >
              {showAll ? 'Mostrar menos' : `Ver mais ${documents.length - VISIBLE_LIMIT}`}
            </Button>
          ) : null}
        </>
      )}
    </section>
  );
}
