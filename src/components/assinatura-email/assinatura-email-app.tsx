'use client';

import { type ChangeEvent, useMemo, useRef, useState } from 'react';
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

const CORES = ['#0369a1', '#0d9488', '#b45309', '#7c3aed', '#e11d48', '#0f172a'];

async function readImageAsDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Selecione uma imagem válida.');
  if (file.size > 2 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 2 MB.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

export function AssinaturaEmailApp() {
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

  function update<K extends keyof AssinaturaEmailData>(key: K, value: AssinaturaEmailData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setLogoError('');
    try {
      const logoDataUrl = await readImageAsDataUrl(file);
      update('logoDataUrl', logoDataUrl);
    } catch (issue) {
      setLogoError(issue instanceof Error ? issue.message : 'Não foi possível carregar o logo.');
    }
  }

  const html = useMemo(() => buildAssinaturaHtml(data), [data]);
  const podeGerar = data.nome.trim().length > 0;

  async function copiarRico() {
    if (!podeGerar) return;
    try {
      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([html], { type: 'text/plain' });
      // eslint-disable-next-line no-undef
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })]);
      toast('Assinatura copiada! Cole direto nas configurações do seu e-mail.');
    } catch {
      await navigator.clipboard.writeText(html);
      toast('Copiado como texto/HTML (cole no campo de assinatura em modo HTML).');
    }
  }

  function copiarCodigo() {
    navigator.clipboard.writeText(html);
    toast('Código HTML copiado!');
  }

  return (
    <AuthGate title="Assinatura de E-mail" description="Cadastre-se gratuitamente para montar sua assinatura.">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero
          title="Assinatura de e-mail profissional em minutos"
          subtitle="Preencha seus dados, escolha uma cor e copie pronto para colar no Gmail, Outlook ou qualquer provedor."
          icon={Mail}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <section className="space-y-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Nome completo" htmlFor="nome" required>
                <Input id="nome" value={data.nome} onChange={(e) => update('nome', e.target.value)} />
              </FormField>
              <FormField label="Cargo" htmlFor="cargo">
                <Input id="cargo" value={data.cargo} onChange={(e) => update('cargo', e.target.value)} />
              </FormField>
              <FormField label="Empresa" htmlFor="empresa" className="sm:col-span-2">
                <Input id="empresa" value={data.empresa} onChange={(e) => update('empresa', e.target.value)} />
              </FormField>
              <FormField label="Telefone" htmlFor="telefone">
                <Input id="telefone" value={data.telefone} onChange={(e) => update('telefone', e.target.value)} />
              </FormField>
              <FormField label="E-mail" htmlFor="email">
                <Input id="email" type="email" value={data.email} onChange={(e) => update('email', e.target.value)} />
              </FormField>
              <FormField label="Site" htmlFor="site">
                <Input id="site" placeholder="seusite.com.br" value={data.site} onChange={(e) => update('site', e.target.value)} />
              </FormField>
              <FormField label="WhatsApp" htmlFor="whatsapp" hint="Só números, com DDD.">
                <Input id="whatsapp" value={data.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
              </FormField>
              <FormField label="LinkedIn" htmlFor="linkedin">
                <Input id="linkedin" placeholder="linkedin.com/in/..." value={data.linkedin} onChange={(e) => update('linkedin', e.target.value)} />
              </FormField>
              <FormField label="Instagram" htmlFor="instagram">
                <Input id="instagram" placeholder="instagram.com/..." value={data.instagram} onChange={(e) => update('instagram', e.target.value)} />
              </FormField>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">Logo ou foto</p>
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => logoInputRef.current?.click()} icon={ImagePlus}>
                  {data.logoDataUrl ? 'Trocar imagem' : 'Subir imagem'}
                </Button>
                {data.logoDataUrl ? (
                  <Button type="button" size="sm" variant="danger" onClick={() => update('logoDataUrl', '')}>
                    Remover
                  </Button>
                ) : null}
              </div>
              <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoChange} />
              {logoError ? <p className="mt-2 text-xs font-medium text-rose-600">{logoError}</p> : null}
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">Cor de destaque</p>
              <div className="flex flex-wrap gap-2">
                {CORES.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    aria-label={`Usar cor ${cor}`}
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
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">Layout</p>
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
                    {layout}
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
              <h2 className="rj-display text-base font-bold text-slate-900">Pré-visualização</h2>
            </div>

            {!podeGerar ? (
              <p className="text-sm font-medium leading-6 text-slate-600">Digite ao menos o seu nome para ver a assinatura.</p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4" dangerouslySetInnerHTML={{ __html: html }} />

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="success" size="sm" onClick={copiarRico} icon={Mail}>
                    Copiar assinatura
                  </Button>
                  <Button variant="outline" size="sm" onClick={copiarCodigo} icon={Code2}>
                    Copiar código HTML
                  </Button>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  No Gmail: Configurações → Ver todas → Assinatura → cole com Ctrl+V. No Outlook: Assinaturas → Nova → cole no editor.
                </p>
              </>
            )}
          </aside>
        </div>
      </div>
    </AuthGate>
  );
}
