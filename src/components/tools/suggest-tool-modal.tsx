'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MessageSquarePlus, Send } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import type { AuthUser } from '@/lib/auth';

const MAX_MESSAGE_LEN = 1200;

const CATEGORY_OPTIONS = [
  'Documentos jurídicos',
  'Contratos',
  'Orçamentos e Pix',
  'Currículos',
  'Marketing e redes sociais',
  'Financeiro',
  'Outra'
];

interface SuggestToolModalProps {
  open: boolean;
  onClose: () => void;
  user?: AuthUser | null;
}

export function SuggestToolModal({ open, onClose, user }: SuggestToolModalProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setStatus('idle');
    setError(null);
    setMessage('');
    setCategory('');
    setName(user?.name || '');
    setEmail(user?.email || '');
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [open, user]);

  const remaining = MAX_MESSAGE_LEN - message.length;
  const canSubmit = message.trim().length >= 8 && status !== 'sending';

  async function handleSubmit() {
    if (!canSubmit) return;
    setStatus('sending');
    setError(null);
    try {
      const response = await fetch('/api/tools/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), category, name, email, website })
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Não foi possível enviar sua sugestão agora.');
      }
      onClose();
      toast('Sugestão enviada! Nosso time vai analisar com carinho. 🙌');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Não foi possível enviar sua sugestão agora.');
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => (status === 'sending' ? null : onClose())}
      title="Sugerir uma ferramenta"
      description="Conte o que você precisa. Sua sugestão vai direto para o time de produto, sem precisar abrir e-mail."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={status === 'sending'} className="min-h-11">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} className="min-h-11">
            {status === 'sending' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden />
                Enviar sugestão
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="suggest-category" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Área relacionada (opcional)
          </label>
          <select
            id="suggest-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">Selecione (opcional)</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="suggest-message" className="mb-1.5 block text-sm font-semibold text-slate-700">
            O que você gostaria de encontrar por aqui?
          </label>
          <textarea
            id="suggest-message"
            ref={textareaRef}
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, MAX_MESSAGE_LEN))}
            rows={5}
            placeholder="Ex.: uma ferramenta para gerar recibo de prestação de serviço com assinatura digital..."
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
          <div className="mt-1 flex justify-end">
            <span className={`text-xs font-medium ${remaining < 60 ? 'text-amber-600' : 'text-slate-400'}`}>
              {remaining} caracteres restantes
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="suggest-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Seu nome (opcional)
            </label>
            <input
              id="suggest-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Como podemos te chamar"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <label htmlFor="suggest-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
              E-mail para retorno (opcional)
            </label>
            <input
              id="suggest-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>

        {/* Honeypot anti-spam: invisível para pessoas reais */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="suggest-website">Website</label>
          <input
            id="suggest-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-700">
            {error}
          </p>
        ) : null}

        <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <MessageSquarePlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Enviamos sua sugestão diretamente para o time, sem redirecionar para outro app.
        </p>
      </div>
    </Modal>
  );
}
