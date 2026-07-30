'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Clock3, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { trackEvent } from '@/lib/analytics';
import type { DocumentHistoryItem } from '@/lib/document-history';

const VISIBLE_LIMIT = 8;

export function RecentDocumentsPanel() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

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
                <Link
                  href={item.editorHref}
                  onClick={() => trackOpen(item)}
                  className="group flex h-full items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-violet-300 hover:bg-violet-50/50"
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
