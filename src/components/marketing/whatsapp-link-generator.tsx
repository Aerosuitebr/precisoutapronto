'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export function WhatsappLinkGenerator() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Olá! Gostaria de solicitar um orçamento.');
  const [status, setStatus] = useState('');
  const digits = phone.replace(/\D/g, '');
  const valid = /^55[1-9]\d(?:\d{8}|9\d{8})$/.test(digits);
  const link = valid ? `https://wa.me/${digits}${message.trim() ? `?text=${encodeURIComponent(message.trim())}` : ''}` : '';
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setStatus('Link copiado. Você já pode compartilhar.');
      trackEvent('whatsapp_link_copied', { tool_name: 'whatsapp-link' });
    } catch { setStatus('Não foi possível copiar automaticamente. Selecione e copie o link abaixo.'); }
  }
  return <div id="ferramenta" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
    <label htmlFor="whatsapp-link-phone" className="block font-bold">Seu WhatsApp com código do país e DDD</label>
    <input id="whatsapp-link-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={event => { setPhone(event.target.value); setStatus(''); }} placeholder="55 11 99999-9999" aria-describedby="whatsapp-phone-help" aria-invalid={digits.length > 0 && !valid} className="mt-2 w-full rounded-xl border border-slate-300 p-3" />
    <p id="whatsapp-phone-help" className="mt-2 text-sm text-slate-600">Use 55 para o Brasil, DDD e número. Exemplo de formato: 55 11 99999-9999.</p>
    <label htmlFor="whatsapp-link-message" className="mt-6 block font-bold">Mensagem inicial (opcional)</label>
    <textarea id="whatsapp-link-message" value={message} maxLength={2000} onChange={event => { setMessage(event.target.value); setStatus(''); }} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 p-3" />
    <p className="mt-3 text-sm leading-6 text-slate-600">O link abre uma conversa. Quem clicar confere e envia a mensagem pelo WhatsApp. Seu número fica visível no link; use um contato que deseja divulgar.</p>
    {link ? <div className="mt-6 rounded-xl bg-blue-50 p-4"><label htmlFor="whatsapp-generated-link" className="block text-sm font-bold text-blue-900">Seu link pronto</label><input id="whatsapp-generated-link" readOnly value={link} onFocus={event => event.target.select()} className="mt-2 w-full rounded-lg border border-blue-200 bg-white p-3 text-sm" /><button type="button" onClick={copy} className="mt-4 min-h-12 rounded-xl bg-blue-600 px-6 font-bold text-white hover:bg-blue-800">Copiar link</button></div> : <p className="mt-5 text-sm text-slate-600">Preencha um número brasileiro completo para gerar o link.</p>}
    <p role="status" className="mt-3 text-sm font-bold text-emerald-800">{status}</p>
  </div>;
}
