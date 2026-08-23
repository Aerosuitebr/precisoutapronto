'use client';

import { Copy, Download, MessageCircle, RotateCcw, Save, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostResultActionBarProps {
  onWhatsApp: () => void;
  onCopyLink: () => void;
  onCreateAnother: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  busy?: boolean;
  compact?: boolean;
  createAnotherLabel?: string;
}

/** Contrato visual único para ações imediatamente posteriores a um resultado. */
export function PostResultActionBar({
  onWhatsApp,
  onCopyLink,
  onCreateAnother,
  onShare,
  onSave,
  onDownload,
  busy = false,
  compact = false,
  createAnotherLabel = 'Criar outro igual'
}: PostResultActionBarProps) {
  const actionCount = 3 + Number(Boolean(onShare)) + Number(Boolean(onSave));
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4" aria-label="Ações do resultado">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Resultado pronto</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">Envie, reutilize ou guarde sem perder o contexto.</p>
      <div className={`mt-3 grid gap-2 ${actionCount >= 5 ? 'grid-cols-2 sm:grid-cols-5' : actionCount === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
        <Button variant="success" size={compact ? 'sm' : 'default'} className="w-full" onClick={onWhatsApp} disabled={busy} icon={MessageCircle}>WhatsApp</Button>
        <Button variant="outline" size={compact ? 'sm' : 'default'} className="w-full" onClick={onCopyLink} disabled={busy} icon={Copy}>Copiar link</Button>
        {onShare ? <Button variant="outline" size={compact ? 'sm' : 'default'} className="w-full" onClick={onShare} disabled={busy} icon={Share2}>{busy ? 'Gerando…' : 'Compartilhar'}</Button> : null}
        <Button variant="outline" size={compact ? 'sm' : 'default'} className="w-full" onClick={onCreateAnother} disabled={busy} icon={RotateCcw}>{createAnotherLabel}</Button>
        {onSave ? <Button variant="outline" size={compact ? 'sm' : 'default'} className="col-span-2 w-full sm:col-span-1" onClick={onSave} disabled={busy} icon={Save}>Salvar</Button> : null}
      </div>
      {onDownload ? <div className="mt-2 flex justify-end"><Button variant="ghost" size="sm" onClick={onDownload} disabled={busy} icon={Download}>Baixar imagem</Button></div> : null}
    </div>
  );
}
