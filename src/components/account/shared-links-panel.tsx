'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Clock3, Copy, ExternalLink, Eye, History, Link2, RefreshCw, RotateCcw, Share2, Trophy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  buildDocumentSharePayload,
  DOCUMENT_SHARE_UPDATED_EVENT,
  isShareCancellation
} from '@/lib/document-sharing';
import { trackEvent } from '@/lib/analytics';
import {
  getSharedLinkExpiry,
  getSharedLinkStatus,
  isActiveSharedLink,
  summarizeSharePerformance
} from '@/lib/share-performance';

type SharedLink = {
  token: string;
  title: string;
  url: string;
  toolId: string;
  artifactId: string;
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
  const [renewing, setRenewing] = useState<string | null>(null);
  const [recreating, setRecreating] = useState<string | null>(null);

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

  async function renew(item: SharedLink) {
    if (renewing === item.token) return;
    setRenewing(item.token);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: item.toolId,
          artifactId: item.artifactId,
          title: item.title,
          expiresInDays: 30
        })
      });
      const payload = await response.json().catch(() => ({})) as { reused?: boolean };
      if (!response.ok) throw new Error();
      await load();
      trackEvent('document_share_link_renewed', {
        tool_id: item.toolId,
        reused: Boolean(payload.reused)
      });
      toast('Validade renovada por mais 30 dias.');
    } catch {
      toast('Não foi possível renovar o link.');
    } finally {
      setRenewing(null);
    }
  }

  async function recreate(item: SharedLink) {
    if (recreating === item.token) return;
    setRecreating(item.token);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: item.toolId,
          artifactId: item.artifactId,
          title: item.title,
          expiresInDays: 30
        })
      });
      if (!response.ok) throw new Error();
      await load();
      trackEvent('document_share_link_recreated', {
        tool_id: item.toolId,
        previous_status: getSharedLinkStatus(item)
      });
      toast('Novo link criado com validade de 30 dias.');
    } catch {
      toast('Não foi possível criar um novo link.');
    } finally {
      setRecreating(null);
    }
  }

  const active = links.filter((item) => isActiveSharedLink(item));
  const ended = links.filter((item) => !isActiveSharedLink(item));
  const performance = summarizeSharePerformance(links);

  return (
    <section id="compartilhamentos" className="scroll-mt-24 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sky-700"><Link2 className="h-5 w-5" /></span>
          <div><h2 className="text-lg font-bold text-slate-950">Links compartilhados</h2><p className="text-sm text-slate-600">Copie ou revogue o acesso público aos documentos.</p></div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{active.length} ativos</span>
      </div>
      {!loading && links.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-700">
              <Eye className="h-3.5 w-3.5" />
              Visualizações
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">{performance.totalViews}</p>
            <p className="mt-1 text-xs text-slate-600">
              em {performance.viewedLinks} {performance.viewedLinks === 1 ? 'link acessado' : 'links acessados'}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
              <BarChart3 className="h-3.5 w-3.5" />
              Alcance ativo
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">{performance.activeLinks}</p>
            <p className="mt-1 text-xs text-slate-600">
              de {performance.totalLinks} {performance.totalLinks === 1 ? 'link criado' : 'links criados'}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-700">
              <Trophy className="h-3.5 w-3.5" />
              Mais visto
            </p>
            {performance.topLink ? (
              <>
                <p className="mt-2 truncate text-sm font-black text-slate-950">{performance.topLink.title}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {performance.topLink.viewCount} {performance.topLink.viewCount === 1 ? 'visualização' : 'visualizações'}
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm font-black text-slate-950">Aguardando acessos</p>
                <p className="mt-1 text-xs text-slate-600">Compartilhe um link para começar.</p>
              </>
            )}
          </div>
        </div>
      ) : null}
      {loading ? <p className="mt-6 text-sm text-slate-500">Carregando…</p> : active.length === 0 ? <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Nenhum link público ativo. Use “Compartilhar” no histórico de um documento salvo.</p> : (
        <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
          {active.map((item) => (
            <li key={item.token} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-950">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.toolId} · criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}</p>
                {(() => {
                  const expiry = getSharedLinkExpiry(item);
                  return (
                    <p className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                      expiry.expiringSoon
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      <Clock3 className="h-3.5 w-3.5" />
                      {expiry.label}
                      {item.expiresAt ? ` · ${new Date(item.expiresAt).toLocaleDateString('pt-BR')}` : ''}
                    </p>
                  );
                })()}
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700">
                  <Eye className="h-3.5 w-3.5" />
                  {item.viewCount} {item.viewCount === 1 ? 'visualização' : 'visualizações'}
                  {item.lastViewedAt ? ` · última em ${new Date(item.lastViewedAt).toLocaleDateString('pt-BR')}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => share(item)}><Share2 className="h-3.5 w-3.5" />Compartilhar</Button>
                <Button size="sm" variant="outline" onClick={() => copy(item.url)}><Copy className="h-3.5 w-3.5" />Copiar</Button>
                {item.expiresAt ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={renewing === item.token}
                    onClick={() => void renew(item)}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${renewing === item.token ? 'animate-spin' : ''}`} />
                    Renovar 30 dias
                  </Button>
                ) : null}
                <Button size="sm" variant="ghost" asChild><a href={item.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" />Abrir</a></Button>
                <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => revoke(item.token)}><Trash2 className="h-3.5 w-3.5" />Revogar</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!loading && ended.length > 0 ? (
        <details className="mt-5 overflow-hidden rounded-2xl border border-slate-200" open={active.length === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
            <span className="inline-flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico de links encerrados
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-500">{ended.length}</span>
          </summary>
          <ul className="divide-y divide-slate-100">
            {ended.map((item) => {
              const status = getSharedLinkStatus(item);
              return (
                <li key={item.token} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {status === 'revoked'
                        ? `Revogado em ${new Date(item.revokedAt!).toLocaleDateString('pt-BR')}`
                        : `Expirou em ${new Date(item.expiresAt!).toLocaleDateString('pt-BR')}`}
                      {' · '}{item.viewCount} {item.viewCount === 1 ? 'visualização' : 'visualizações'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={recreating === item.token}
                    onClick={() => void recreate(item)}
                  >
                    <RotateCcw className={`h-3.5 w-3.5 ${recreating === item.token ? 'animate-spin' : ''}`} />
                    Criar novo link
                  </Button>
                </li>
              );
            })}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
