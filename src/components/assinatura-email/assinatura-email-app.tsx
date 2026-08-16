'use client';

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Code2, ImagePlus, Mail, Wand2 } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { PageHero } from '@/components/shared/page-hero';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { buildAssinaturaHtml, type AssinaturaEmailData } from '@/lib/assinatura-email/build';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

type Locale = 'pt-BR' | 'en' | 'es';

const CORES = ['#0369a1', '#0d9488', '#b45309', '#7c3aed', '#e11d48', '#0f172a'];

const COPY: Record<
  Locale,
  {
    authTitle: string;
    authDescription: string;
    heroTitle: string;
    heroSubtitle: string;
    nome: string;
    cargo: string;
    empresa: string;
    telefone: string;
    email: string;
    site: string;
    sitePlaceholder: string;
    whatsapp: string;
    whatsappHint: string;
    linkedin: string;
    linkedinPlaceholder: string;
    instagram: string;
    instagramPlaceholder: string;
    logoLabel: string;
    changeImage: string;
    uploadImage: string;
    remove: string;
    colorLabel: string;
    useColor: (cor: string) => string;
    layoutLabel: string;
    layoutOptions: { moderno: string; classico: string };
    previewTitle: string;
    emptyPreview: string;
    copySignature: string;
    copyCode: string;
    footerHint: string;
    toastCopiedRich: string;
    toastCopiedText: string;
    toastCopiedCode: string;
    errorInvalidImage: string;
    errorMaxSize: string;
    errorReadImage: string;
    errorLoadLogo: string;
  }
> = {
  'pt-BR': {
    authTitle: 'Assinatura de E-mail',
    authDescription: 'Cadastre-se gratuitamente para montar sua assinatura.',
    heroTitle: 'Assinatura de e-mail profissional em minutos',
    heroSubtitle:
      'Preencha seus dados, escolha uma cor e copie pronto para colar no Gmail, Outlook ou qualquer provedor.',
    nome: 'Nome completo',
    cargo: 'Cargo',
    empresa: 'Empresa',
    telefone: 'Telefone',
    email: 'E-mail',
    site: 'Site',
    sitePlaceholder: 'seusite.com.br',
    whatsapp: 'WhatsApp',
    whatsappHint: 'Só números, com DDD.',
    linkedin: 'LinkedIn',
    linkedinPlaceholder: 'linkedin.com/in/...',
    instagram: 'Instagram',
    instagramPlaceholder: 'instagram.com/...',
    logoLabel: 'Logo ou foto',
    changeImage: 'Trocar imagem',
    uploadImage: 'Subir imagem',
    remove: 'Remover',
    colorLabel: 'Cor de destaque',
    useColor: (cor) => `Usar cor ${cor}`,
    layoutLabel: 'Layout',
    layoutOptions: { moderno: 'moderno', classico: 'clássico' },
    previewTitle: 'Pré-visualização',
    emptyPreview: 'Digite ao menos o seu nome para ver a assinatura.',
    copySignature: 'Copiar assinatura',
    copyCode: 'Copiar código HTML',
    footerHint:
      'No Gmail: Configurações → Ver todas → Assinatura → cole com Ctrl+V. No Outlook: Assinaturas → Nova → cole no editor.',
    toastCopiedRich: 'Assinatura copiada! Cole direto nas configurações do seu e-mail.',
    toastCopiedText: 'Copiado como texto/HTML (cole no campo de assinatura em modo HTML).',
    toastCopiedCode: 'Código HTML copiado!',
    errorInvalidImage: 'Selecione uma imagem válida.',
    errorMaxSize: 'A imagem deve ter no máximo 2 MB.',
    errorReadImage: 'Não foi possível ler a imagem.',
    errorLoadLogo: 'Não foi possível carregar o logo.'
  },
  en: {
    authTitle: 'Email Signature',
    authDescription: 'Sign up for free to build your signature.',
    heroTitle: 'Professional email signature in minutes',
    heroSubtitle:
      'Fill in your details, pick a color and copy it ready to paste into Gmail, Outlook or any provider.',
    nome: 'Full name',
    cargo: 'Job title',
    empresa: 'Company',
    telefone: 'Phone',
    email: 'Email',
    site: 'Website',
    sitePlaceholder: 'yoursite.com',
    whatsapp: 'WhatsApp',
    whatsappHint: 'Numbers only, with country code.',
    linkedin: 'LinkedIn',
    linkedinPlaceholder: 'linkedin.com/in/...',
    instagram: 'Instagram',
    instagramPlaceholder: 'instagram.com/...',
    logoLabel: 'Logo or photo',
    changeImage: 'Change image',
    uploadImage: 'Upload image',
    remove: 'Remove',
    colorLabel: 'Accent color',
    useColor: (cor) => `Use color ${cor}`,
    layoutLabel: 'Layout',
    layoutOptions: { moderno: 'modern', classico: 'classic' },
    previewTitle: 'Preview',
    emptyPreview: 'Type at least your name to see the signature.',
    copySignature: 'Copy signature',
    copyCode: 'Copy HTML code',
    footerHint:
      'In Gmail: Settings, See all settings, Signature, then paste with Ctrl+V. In Outlook: Signatures, New, paste in the editor.',
    toastCopiedRich: 'Signature copied! Paste it directly into your email settings.',
    toastCopiedText: 'Copied as text/HTML (paste it into the signature field in HTML mode).',
    toastCopiedCode: 'HTML code copied!',
    errorInvalidImage: 'Select a valid image.',
    errorMaxSize: 'The image must be 2 MB or smaller.',
    errorReadImage: 'Could not read the image.',
    errorLoadLogo: 'Could not load the logo.'
  },
  es: {
    authTitle: 'Firma de Correo',
    authDescription: 'Registrate gratis para crear tu firma.',
    heroTitle: 'Firma de correo profesional en minutos',
    heroSubtitle:
      'Completa tus datos, elige un color y copia lista para pegar en Gmail, Outlook o cualquier proveedor.',
    nome: 'Nombre completo',
    cargo: 'Cargo',
    empresa: 'Empresa',
    telefone: 'Teléfono',
    email: 'Correo electrónico',
    site: 'Sitio web',
    sitePlaceholder: 'tusitio.com',
    whatsapp: 'WhatsApp',
    whatsappHint: 'Solo números, con código de país.',
    linkedin: 'LinkedIn',
    linkedinPlaceholder: 'linkedin.com/in/...',
    instagram: 'Instagram',
    instagramPlaceholder: 'instagram.com/...',
    logoLabel: 'Logo o foto',
    changeImage: 'Cambiar imagen',
    uploadImage: 'Subir imagen',
    remove: 'Quitar',
    colorLabel: 'Color destacado',
    useColor: (cor) => `Usar color ${cor}`,
    layoutLabel: 'Diseño',
    layoutOptions: { moderno: 'moderno', classico: 'clásico' },
    previewTitle: 'Vista previa',
    emptyPreview: 'Escribe al menos tu nombre para ver la firma.',
    copySignature: 'Copiar firma',
    copyCode: 'Copiar código HTML',
    footerHint:
      'En Gmail: Configuración, Ver todos los ajustes, Firma, pega con Ctrl+V. En Outlook: Firmas, Nueva, pega en el editor.',
    toastCopiedRich: 'Firma copiada. Pegala directo en la configuración de tu correo.',
    toastCopiedText: 'Copiado como texto/HTML (pegalo en el campo de firma en modo HTML).',
    toastCopiedCode: 'Código HTML copiado!',
    errorInvalidImage: 'Selecciona una imagen valida.',
    errorMaxSize: 'La imagen debe pesar como maximo 2 MB.',
    errorReadImage: 'No se pudo leer la imagen.',
    errorLoadLogo: 'No se pudo cargar el logo.'
  }
};

async function readImageAsDataUrl(
  file: File,
  messages: { invalidImage: string; maxSize: string; readError: string }
): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error(messages.invalidImage);
  if (file.size > 2 * 1024 * 1024) throw new Error(messages.maxSize);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(messages.readError));
    reader.readAsDataURL(file);
  });
}

export function AssinaturaEmailApp({
  locale = 'pt-BR',
  publicLanding = false
}: { locale?: Locale; publicLanding?: boolean } = {}) {
  const t = COPY[locale];
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState('');
  const [data, setData] = useState<AssinaturaEmailData>({
    nome: '',
    cargo: '',
    empresa: '',
    telefone: '',
    email: '',
    site: '',
    whatsapp: '',
    linkedin: '',
    instagram: '',
    corDestaque: CORES[0],
    logoDataUrl: '',
    layout: 'moderno'
  });
  const startedRef = useRef(false);
  const previewRef = useRef(false);

  function update<K extends keyof AssinaturaEmailData>(key: K, value: AssinaturaEmailData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent('email_signature_started', { locale, public_landing: publicLanding });
    }
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setLogoError('');
    try {
      const logoDataUrl = await readImageAsDataUrl(file, {
        invalidImage: t.errorInvalidImage,
        maxSize: t.errorMaxSize,
        readError: t.errorReadImage
      });
      update('logoDataUrl', logoDataUrl);
    } catch (issue) {
      setLogoError(issue instanceof Error ? issue.message : t.errorLoadLogo);
    }
  }

  const html = useMemo(() => buildAssinaturaHtml(data), [data]);
  const podeGerar = data.nome.trim().length > 0;

  useEffect(() => {
    if (!podeGerar || previewRef.current) return;
    previewRef.current = true;
    trackEvent('email_signature_preview_ready', { locale, public_landing: publicLanding });
  }, [locale, podeGerar, publicLanding]);

  async function copiarRico() {
    if (!podeGerar) return;
    try {
      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([html], { type: 'text/plain' });
      // eslint-disable-next-line no-undef
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })]);
      trackEvent('email_signature_copied', { format: 'rich', layout: data.layout, has_logo: Boolean(data.logoDataUrl) });
      toast(t.toastCopiedRich);
    } catch {
      await navigator.clipboard.writeText(html);
      trackEvent('email_signature_copied', { format: 'html_fallback', layout: data.layout, has_logo: Boolean(data.logoDataUrl) });
      toast(t.toastCopiedText);
    }
  }

  function copiarCodigo() {
    navigator.clipboard.writeText(html);
    trackEvent('email_signature_copied', { format: 'html_code', layout: data.layout, has_logo: Boolean(data.logoDataUrl) });
    toast(t.toastCopiedCode);
  }

  return (
    <AuthGate title={t.authTitle} description={t.authDescription}>
      <div className="space-y-5">
        {!publicLanding ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <ToolsBackButton />
            </div>
            <PageHero title={t.heroTitle} subtitle={t.heroSubtitle} icon={Mail} />
          </>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <section className="space-y-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={t.nome} htmlFor="nome" required>
                <Input id="nome" value={data.nome} onChange={(e) => update('nome', e.target.value)} />
              </FormField>
              <FormField label={t.cargo} htmlFor="cargo">
                <Input id="cargo" value={data.cargo} onChange={(e) => update('cargo', e.target.value)} />
              </FormField>
              <FormField label={t.empresa} htmlFor="empresa" className="sm:col-span-2">
                <Input id="empresa" value={data.empresa} onChange={(e) => update('empresa', e.target.value)} />
              </FormField>
              <FormField label={t.telefone} htmlFor="telefone">
                <Input id="telefone" value={data.telefone} onChange={(e) => update('telefone', e.target.value)} />
              </FormField>
              <FormField label={t.email} htmlFor="email">
                <Input id="email" type="email" value={data.email} onChange={(e) => update('email', e.target.value)} />
              </FormField>
              <FormField label={t.site} htmlFor="site">
                <Input id="site" placeholder={t.sitePlaceholder} value={data.site} onChange={(e) => update('site', e.target.value)} />
              </FormField>
              <FormField label={t.whatsapp} htmlFor="whatsapp" hint={t.whatsappHint}>
                <Input id="whatsapp" value={data.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
              </FormField>
              <FormField label={t.linkedin} htmlFor="linkedin">
                <Input id="linkedin" placeholder={t.linkedinPlaceholder} value={data.linkedin} onChange={(e) => update('linkedin', e.target.value)} />
              </FormField>
              <FormField label={t.instagram} htmlFor="instagram">
                <Input id="instagram" placeholder={t.instagramPlaceholder} value={data.instagram} onChange={(e) => update('instagram', e.target.value)} />
              </FormField>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">{t.logoLabel}</p>
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => logoInputRef.current?.click()} icon={ImagePlus}>
                  {data.logoDataUrl ? t.changeImage : t.uploadImage}
                </Button>
                {data.logoDataUrl ? (
                  <Button type="button" size="sm" variant="danger" onClick={() => update('logoDataUrl', '')}>
                    {t.remove}
                  </Button>
                ) : null}
              </div>
              <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoChange} />
              {logoError ? <p className="mt-2 text-xs font-medium text-rose-600">{logoError}</p> : null}
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">{t.colorLabel}</p>
              <div className="flex flex-wrap gap-2">
                {CORES.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    aria-label={t.useColor(cor)}
                    onClick={() => update('corDestaque', cor)}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-transform',
                      data.corDestaque === cor ? 'scale-110 border-slate-900' : 'border-white'
                    )}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">{t.layoutLabel}</p>
              <div className="flex gap-2">
                {(['moderno', 'classico'] as const).map((layout) => (
                  <button
                    key={layout}
                    type="button"
                    onClick={() => update('layout', layout)}
                    className={cn(
                      'rounded-full border px-3.5 py-2 text-xs font-semibold capitalize transition-all',
                      data.layout === layout
                        ? 'border-sky-600 bg-sky-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50'
                    )}
                  >
                    {t.layoutOptions[layout]}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-sky-800">
                <Wand2 className="h-4 w-4" aria-hidden />
              </span>
              <h2 className="rj-display text-base font-bold text-slate-900">{t.previewTitle}</h2>
            </div>

            {!podeGerar ? (
              <p className="text-sm font-medium leading-6 text-slate-600">{t.emptyPreview}</p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4" dangerouslySetInnerHTML={{ __html: html }} />

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="success" size="sm" onClick={copiarRico} icon={Mail}>
                    {t.copySignature}
                  </Button>
                  <Button variant="outline" size="sm" onClick={copiarCodigo} icon={Code2}>
                    {t.copyCode}
                  </Button>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">{t.footerHint}</p>
              </>
            )}
          </aside>
        </div>
      </div>
    </AuthGate>
  );
}
