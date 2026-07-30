'use client';

import { useCallback, useEffect, useState } from 'react';
import { Copy, ExternalLink, Eye, Link2, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  buildDocumentSharePayload,
  DOCUMENT_SHARE_UPDATED_EVENT,
  isShareCancellation
} from '@/lib/document-sharing';
import { trackEvent } from '@/lib/analytics';

type SharedLink = {
  token: string;
  title: string;
  url: string;
  toolId: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  viewCount: number;
  lastViewedAt: string | null;
};

export function SharedLinksPanel() {
  const { toast } = useToast();
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/share', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setLinks(data.links || []);
    } catch {
      toast('Não foi possível carregar os links compartilhados.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const refreshLinks = () => void load();
    window.addEventListener(DOCUMENT_SHARE_UPDATED_EVENT, refreshLinks);
    return () => window.removeEventListener(DOCUMENT_SHARE_UPDATED_EVENT, refreshLinks);
  }, [load]);

  async function copy(url: string) {
    await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
    toast('Link copiado.');
  }

  async function share(item: SharedLink) {
    const url = new URL(item.url, window.location.origin).toString();
    const payload = buildDocumentSharePayload(item.title, url);
    if (typeof navigator.share !== 'function' || (navigator.canShare && !navigator.canShare(payload))) {
      await copy(item.url);
      trackEvent('document_share_account_fallback_copied', { tool_id: item.toolId });
      return;
    }
    try {
      await navigator.share(payload);
      trackEvent('document_share_account_native_completed', { tool_id: item.toolId });
    } catch (error) {
      if (!isShareCancellation(error)) {
        await copy(item.url);
        trackEvent('document_share_account_fallback_copied', { tool_id: item.toolId });
      }
    }
  }

  async function revoke(token: string) {
    const response = await fetch(`/api/share?token=${encodeURIComponent(token)}`, { method: 'DELETE' });
    if (!response.ok) {
      toast('Não foi possível revogar o link.');
      return;
    }
    setLinks((current) => current.map((item) => item.token === token ? { ...item, revokedAt: new Date().toISOString() } : item));
    toast('Link revogado.');
  }

  const active = links.filter((item) => !item.revokedAt && (!item.expiresAt || Date.parse(item.expiresAt) > Date.now()));

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sky-700"><Link2 className="h-5 w-5" /></span>
          <div><h2 className="text-lg font-bold text-slate-950">Links compartilhados</h2><p className="text-sm text-slate-600">Copie ou revogue o acesso público aos documentos.</p></div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{active.length} ativos</span>
      </div>
      {loading ? <p className="mt-6 text-sm text-slate-500">Carregando…</p> : active.length === 0 ? <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Nenhum link público ativo. Use “Compartilhar” no histórico de um documento salvo.</p> : (
        <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
          {active.map((item) => (
            <li key={item.token} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-950">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.toolId} · criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}{item.expiresAt ? ` · expira em ${new Date(item.expiresAt).toLocaleDateString('pt-BR')}` : ' · sem expiração'}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700">
                  <Eye className="h-3.5 w-3.5" />
                  {item.viewCount} {item.viewCount === 1 ? 'visualização' : 'visualizações'}
                  {item.lastViewedAt ? ` · última em ${new Date(item.lastViewedAt).toLocaleDateString('pt-BR')}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => share(item)}><Share2 className="h-3.5 w-3.5" />Compartilhar</Button>
                <Button size="sm" variant="outline" onClick={() => copy(item.url)}><Copy className="h-3.5 w-3.5" />Copiar</Button>
                <Button size="sm" variant="ghost" asChild><a href={item.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" />Abrir</a></Button>
                <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => revoke(item.token)}><Trash2 className="h-3.5 w-3.5" />Revogar</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
