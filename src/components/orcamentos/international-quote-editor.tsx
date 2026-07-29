'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Plus,
  QrCode,
  Trash2
} from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { performBillableAction } from '@/lib/billing';
import { parseLooseMoney } from '@/lib/formatters';
import { buildPixBrCode } from '@/lib/pix/brcode';
import type { PixKeyType } from '@/lib/pix/types';
import { type InternationalLocale } from '@/lib/i18n';
import type { OrcamentoItem } from '@/lib/orcamentos/types';

const copy = {
  en: {
    title: 'Quote + client approval + Pix',
    subtitle: 'Create the quote, send the approval link and prepare the Pix payment in one flow.',
    back: 'Back to tools',
    professional: 'Your business details',
    client: 'Client details',
    items: 'Quote items',
    payment: 'Pix payment',
    yourName: 'Professional or business name',
    yourPhone: 'Your WhatsApp with country and area code',
    yourEmail: 'Email for approval notifications',
    clientName: 'Client name',
    clientPhone: 'Client WhatsApp',
    clientEmail: 'Client email (optional)',
    item: 'Service or product',
    quantity: 'Qty.',
    unitPrice: 'Unit price (BRL)',
    addItem: 'Add item',
    validity: 'Validity (for example: 15 days)',
    notes: 'Notes, delivery terms or payment conditions',
    pixType: 'Pix key type',
    pixKey: 'Pix key',
    receiver: 'Pix receiver name',
    city: 'Receiver city',
    total: 'Quote total',
    generate: 'Generate approval link and Pix',
    generating: 'Generating...',
    required: 'Complete your details, the client details and at least one valid item.',
    loginRequired: 'Sign in and confirm your email to generate a public approval link.',
    signIn: 'Sign in',
    created: 'Your quote is ready',
    createdText: 'Send this link to the client for approval or adjustment.',
    copyLink: 'Copy approval link',
    copied: 'Copied',
    open: 'Open approval page',
    whatsapp: 'Send on WhatsApp',
    pixReady: 'Pix QR code ready for the approved amount',
    pixHelp: 'The Pix key stays in your browser and is not saved with the public quote.',
    apiError: 'We couldn’t generate the quote. Please try again.',
    remove: 'Remove item'
  },
  es: {
    title: 'Presupuesto + aprobación + Pix',
    subtitle: 'Crea el presupuesto, envía el enlace de aprobación y prepara el cobro con Pix en un solo flujo.',
    back: 'Volver a herramientas',
    professional: 'Tus datos profesionales',
    client: 'Datos del cliente',
    items: 'Ítems del presupuesto',
    payment: 'Cobro con Pix',
    yourName: 'Nombre profesional o del negocio',
    yourPhone: 'Tu WhatsApp con país y código de área',
    yourEmail: 'Correo para avisos de aprobación',
    clientName: 'Nombre del cliente',
    clientPhone: 'WhatsApp del cliente',
    clientEmail: 'Correo del cliente (opcional)',
    item: 'Servicio o producto',
    quantity: 'Cant.',
    unitPrice: 'Precio unitario (BRL)',
    addItem: 'Agregar ítem',
    validity: 'Validez (por ejemplo: 15 días)',
    notes: 'Observaciones, entrega o condiciones de pago',
    pixType: 'Tipo de clave Pix',
    pixKey: 'Clave Pix',
    receiver: 'Nombre del receptor Pix',
    city: 'Ciudad del receptor',
    total: 'Total del presupuesto',
    generate: 'Generar enlace de aprobación y Pix',
    generating: 'Generando...',
    required: 'Completa tus datos, los del cliente y al menos un ítem válido.',
    loginRequired: 'Ingresa y confirma tu correo para generar un enlace público de aprobación.',
    signIn: 'Ingresar',
    created: 'Tu presupuesto está listo',
    createdText: 'Envía este enlace al cliente para que lo apruebe o solicite cambios.',
    copyLink: 'Copiar enlace de aprobación',
    copied: 'Copiado',
    open: 'Abrir página de aprobación',
    whatsapp: 'Enviar por WhatsApp',
    pixReady: 'Código QR de Pix listo con el valor aprobado',
    pixHelp: 'La clave Pix permanece en tu navegador y no se guarda con el presupuesto público.',
    apiError: 'No pudimos generar el presupuesto. Inténtalo de nuevo.',
    remove: 'Eliminar ítem'
  }
} as const;

function emptyItem(): OrcamentoItem {
  return { id: crypto.randomUUID(), nome: '', quantidade: 1, valorUnitario: 0 };
}

function formatBRL(value: number, locale: InternationalLocale) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function InternationalQuoteEditor({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const { session, refresh } = useAuth();
  const [professionalName, setProfessionalName] = useState('');
  const [professionalPhone, setProfessionalPhone] = useState('');
  const [professionalEmail, setProfessionalEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [validity, setValidity] = useState(locale === 'en' ? '15 days' : '15 días');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrcamentoItem[]>([emptyItem()]);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [pixType, setPixType] = useState<PixKeyType>('email');
  const [pixKey, setPixKey] = useState('');
  const [pixReceiver, setPixReceiver] = useState('');
  const [pixCity, setPixCity] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState<{ id: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session?.user.email) {
      setProfessionalEmail((current) => current || session.user.email || '');
    }
  }, [session?.user.email]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.quantidade * item.valorUnitario, 0),
    [items]
  );
  const validItems = items.filter(
    (item) => item.nome.trim() && item.quantidade > 0 && item.valorUnitario > 0
  );
  const canSubmit =
    professionalName.trim() &&
    professionalPhone.trim() &&
    professionalEmail.trim() &&
    clientName.trim() &&
    clientPhone.trim() &&
    validItems.length > 0;

  const pixCode = useMemo(() => {
    if (!pixKey.trim() || !pixReceiver.trim() || !pixCity.trim() || total <= 0) return '';
    try {
      return buildPixBrCode({
        key: pixKey,
        keyType: pixType,
        merchantName: pixReceiver,
        merchantCity: pixCity,
        amount: total,
        description: clientName || 'Resolva Jato',
        txid: '***'
      });
    } catch {
      return '';
    }
  }, [clientName, pixCity, pixKey, pixReceiver, pixType, total]);

  function updateItem(id: string, field: 'nome' | 'quantidade' | 'valorUnitario', value: string) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        if (field === 'nome') return { ...item, nome: value };
        if (field === 'quantidade') return { ...item, quantidade: Math.max(1, Number(value) || 1) };
        return { ...item, valorUnitario: parseLooseMoney(value) };
      })
    );
  }

  function updateUnitPrice(id: string, raw: string) {
    setPriceDrafts((current) => ({ ...current, [id]: raw }));
    updateItem(id, 'valorUnitario', raw);
  }

  async function generate() {
    setError('');
    setCopied(false);
    if (!canSubmit) {
      setError(t.required);
      return;
    }
    setBusy(true);
    try {
      const outcome = await performBillableAction(
        {
          toolId: 'orcamentos',
          artifactId: `international_${Date.now()}`,
          action: 'download'
        },
        async () => {
          const response = await fetch('/api/orcamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profissionalNome: professionalName,
              profissionalWhatsapp: professionalPhone,
              clienteNome: clientName,
              clienteContato: clientPhone,
              clienteEmail: clientEmail,
              itens: validItems,
              validade: validity,
              observacoes: notes,
              ownerEmail: professionalEmail.toLowerCase()
            })
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || t.apiError);
          return data as { id: string; url: string };
        }
      );
      if (!outcome.allowed) {
        // Modal de conta pode abrir via evento; também mostra erro no painel.
        setError(outcome.reason || t.loginRequired);
        return;
      }
      if (!outcome.result) {
        setError(t.apiError);
        return;
      }
      const localizedUrl = `${window.location.origin}/${locale}/quote/${outcome.result.id}`;
      setGenerated({ id: outcome.result.id, url: localizedUrl });
      await refresh();
    } catch {
      setError(t.apiError);
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!generated) return;
    await navigator.clipboard.writeText(generated.url);
    setCopied(true);
  }

  const whatsappUrl = generated
    ? `https://wa.me/${clientPhone.replace(/\D+/g, '')}?text=${encodeURIComponent(
        `${locale === 'en' ? 'Hello' : 'Hola'} ${clientName}, ${locale === 'en' ? 'here is your quote for approval' : 'aquí tienes tu presupuesto para aprobar'}: ${generated.url}`
      )}`
    : '';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href={`/${locale}`} aria-label="Resolva Jato">
            <Logo variant="marketing" className="h-12 sm:h-14" />
          </Link>
          <LocaleSwitcher
            locale={locale}
            paths={{ 'pt-BR': '/ferramentas/orcamentos', en: '/en/tools/quote-pix', es: '/es/tools/quote-pix' }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <Link href={`/${locale}/tools`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700">
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>
        <div className="mt-6 max-w-3xl">
          <h1 className="rj-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t.title}</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">{t.subtitle}</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="space-y-5">
            <FormSection title={t.professional}>
              <Input value={professionalName} onChange={(e) => setProfessionalName(e.target.value)} placeholder={t.yourName} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input value={professionalPhone} onChange={(e) => setProfessionalPhone(e.target.value)} placeholder={t.yourPhone} />
                <Input type="email" value={professionalEmail} onChange={(e) => setProfessionalEmail(e.target.value)} placeholder={t.yourEmail} />
              </div>
            </FormSection>

            <FormSection title={t.client}>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder={t.clientName} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder={t.clientPhone} />
                <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder={t.clientEmail} />
              </div>
            </FormSection>

            <FormSection title={t.items}>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_90px_140px_40px]">
                    <Input value={item.nome} onChange={(e) => updateItem(item.id, 'nome', e.target.value)} placeholder={`${t.item} ${index + 1}`} />
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantidade}
                      onChange={(e) => updateItem(item.id, 'quantidade', e.target.value)}
                      aria-label={t.quantity}
                    />
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={
                        priceDrafts[item.id] ??
                        (item.valorUnitario > 0 ? String(item.valorUnitario) : '')
                      }
                      onChange={(e) => updateUnitPrice(item.id, e.target.value)}
                      placeholder={t.unitPrice}
                      aria-label={t.unitPrice}
                    />
                    <button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} disabled={items.length === 1} aria-label={t.remove} className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={() => setItems((current) => [...current, emptyItem()])}>
                <Plus className="h-4 w-4" />
                {t.addItem}
              </Button>
              <Input value={validity} onChange={(e) => setValidity(e.target.value)} placeholder={t.validity} />
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.notes} rows={4} />
            </FormSection>

            <FormSection title={t.payment}>
              <div className="grid gap-3 sm:grid-cols-2">
                <select value={pixType} onChange={(e) => setPixType(e.target.value as PixKeyType)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="random">Random key</option>
                </select>
                <Input value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder={t.pixKey} />
                <Input value={pixReceiver} onChange={(e) => setPixReceiver(e.target.value)} placeholder={t.receiver} />
                <Input value={pixCity} onChange={(e) => setPixCity(e.target.value)} placeholder={t.city} />
              </div>
              <p className="text-xs leading-5 text-slate-500">{t.pixHelp}</p>
            </FormSection>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-5">
            <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{t.total}</p>
              <p className="mt-2 text-3xl font-black text-emerald-700">{formatBRL(total, locale)}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-600">
                {[professionalName, clientName, validItems.length ? `${validItems.length} ${t.items.toLowerCase()}` : ''].filter(Boolean).map((line) => (
                  <li key={String(line)} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    {line}
                  </li>
                ))}
              </ul>
              {error ? (
                <div className="mt-4 rounded-xl bg-rose-50 px-3 py-3 text-sm text-rose-700" role="alert">
                  {error}
                  {error === t.loginRequired ? (
                    <Link href={`/${locale}/login?next=${encodeURIComponent(`/${locale}/tools/quote-pix`)}`} className="ml-1 font-bold underline">
                      {t.signIn}
                    </Link>
                  ) : null}
                </div>
              ) : null}
              <Button className="mt-5 w-full" size="lg" onClick={() => void generate()} loading={busy}>
                <QrCode className="h-4 w-4" />
                {busy ? t.generating : t.generate}
              </Button>
            </div>

            {generated ? (
              <div className="rounded-[26px] border border-emerald-200 bg-emerald-50 p-5">
                <h2 className="font-extrabold text-emerald-950">{t.created}</h2>
                <p className="mt-2 text-sm leading-6 text-emerald-900/80">{t.createdText}</p>
                <div className="mt-4 grid gap-2">
                  <Button variant="outline" onClick={() => void copyLink()}>
                    <Copy className="h-4 w-4" />
                    {copied ? t.copied : t.copyLink}
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={generated.url} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                      {t.open}
                    </Link>
                  </Button>
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-500">
                    <a href={whatsappUrl}>
                      <MessageCircle className="h-4 w-4" />
                      {t.whatsapp}
                    </a>
                  </Button>
                </div>
              </div>
            ) : null}

            {pixCode ? (
              <div className="rounded-[26px] border border-sky-200 bg-white p-5 text-center shadow-sm">
                <p className="text-sm font-bold text-slate-900">{t.pixReady}</p>
                <div className="mx-auto mt-4 w-fit rounded-2xl border border-slate-100 bg-white p-3">
                  <QRCodeSVG value={pixCode} size={180} level="M" />
                </div>
                <Button variant="outline" className="mt-4 w-full" onClick={() => navigator.clipboard.writeText(pixCode)}>
                  <Copy className="h-4 w-4" />
                  Pix copy and paste
                </Button>
              </div>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
