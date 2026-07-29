'use client';

import { useMemo, useRef, useState } from 'react';
import { BookOpen, Copy, Download, Globe2, Library, Newspaper, Plus, Trash2 } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { PageHero } from '@/components/shared/page-hero';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { formatarReferenciaAbnt, ordenarReferencias } from '@/lib/referencias-abnt/format';
import type { Referencia, ReferenciaTipo } from '@/lib/referencias-abnt/types';
import { exportElementToPdf } from '@/lib/simple-element-pdf';
import { cn } from '@/lib/utils';

type Locale = 'pt-BR' | 'en' | 'es';

const copy = {
  'pt-BR': {
    authTitle: 'Referências ABNT',
    authDescription: 'Cadastre-se gratuitamente para gerar suas referências.',
    heroTitle: 'Referências no padrão ABNT em segundos',
    heroSubtitle:
      'Preencha os dados da fonte (site, livro ou artigo) e receba a referência já formatada, ordenada e pronta para colar no seu trabalho.',
    tipoTabAriaLabel: 'Tipo de fonte',
    tipoSite: 'Página / site',
    tipoLivro: 'Livro',
    tipoArtigo: 'Artigo científico',
    autorLabel: 'Autor(es)',
    autorHint: 'Separe vários autores com ; . Ex.: Silva, João; Souza, Maria',
    autorPlaceholder: 'Sobrenome, Nome',
    tituloLabel: 'Título',
    tituloPlaceholder: 'Título da obra, página ou artigo',
    anoLabel: 'Ano',
    nomeSiteLabel: 'Nome do site',
    nomeSitePlaceholder: 'Ex.: Resolva Jato',
    urlLabel: 'URL',
    urlPlaceholder: 'https://...',
    dataAcessoLabel: 'Data de acesso',
    editoraLabel: 'Editora',
    cidadeLabel: 'Cidade',
    edicaoLabel: 'Edição',
    edicaoHint: 'Ex.: 3. ed.',
    revistaLabel: 'Revista / periódico',
    volumeLabel: 'Volume',
    numeroLabel: 'Número',
    paginasLabel: 'Páginas',
    paginasHint: 'Ex.: 12-30',
    adicionarBtn: 'Adicionar referência',
    listTitle: (n: number) => `Suas referências (${n})`,
    copiarTudoBtn: 'Copiar tudo',
    pdfBtn: 'PDF',
    emptyList:
      'Adicione uma referência ao lado. Elas aparecem aqui já em ordem alfabética por autor.',
    copiarUmaBtn: 'Copiar',
    removerBtn: 'Remover',
    footerNote:
      'Formatação segue as regras gerais da ABNT NBR 6023. Confira sempre as normas específicas da sua instituição.',
    toastAdded: 'Referência adicionada!',
    toastCopiedAll: 'Todas as referências foram copiadas!',
    toastCopiedOne: 'Referência copiada!',
    toastPdf: 'PDF gerado!',
  },
  en: {
    authTitle: 'ABNT References',
    authDescription: 'Sign up for free to generate your references.',
    heroTitle: 'ABNT-style references in seconds',
    heroSubtitle:
      'Fill in the source details (website, book or article) and get the reference already formatted, sorted and ready to paste into your paper, using ABNT (the Brazilian citation standard).',
    tipoTabAriaLabel: 'Source type',
    tipoSite: 'Web page / website',
    tipoLivro: 'Book',
    tipoArtigo: 'Scientific article',
    autorLabel: 'Author(s)',
    autorHint: 'Separate multiple authors with ; . Ex.: Silva, João; Souza, Maria',
    autorPlaceholder: 'Last name, First name',
    tituloLabel: 'Title',
    tituloPlaceholder: 'Title of the work, page or article',
    anoLabel: 'Year',
    nomeSiteLabel: 'Website name',
    nomeSitePlaceholder: 'Ex.: Resolva Jato',
    urlLabel: 'URL',
    urlPlaceholder: 'https://...',
    dataAcessoLabel: 'Access date',
    editoraLabel: 'Publisher',
    cidadeLabel: 'City',
    edicaoLabel: 'Edition',
    edicaoHint: 'Ex.: 3rd ed.',
    revistaLabel: 'Journal / periodical',
    volumeLabel: 'Volume',
    numeroLabel: 'Issue number',
    paginasLabel: 'Pages',
    paginasHint: 'Ex.: 12-30',
    adicionarBtn: 'Add reference',
    listTitle: (n: number) => `Your references (${n})`,
    copiarTudoBtn: 'Copy all',
    pdfBtn: 'PDF',
    emptyList:
      'Add a reference on the side. They will appear here already sorted alphabetically by author.',
    copiarUmaBtn: 'Copy',
    removerBtn: 'Remove',
    footerNote:
      'Formatting follows the general rules of ABNT NBR 6023, the Brazilian citation standard. Always check the specific rules of your institution.',
    toastAdded: 'Reference added!',
    toastCopiedAll: 'All references were copied!',
    toastCopiedOne: 'Reference copied!',
    toastPdf: 'PDF generated!',
  },
  es: {
    authTitle: 'Referencias ABNT',
    authDescription: 'Regístrate gratis para generar tus referencias.',
    heroTitle: 'Referencias en el estándar ABNT en segundos',
    heroSubtitle:
      'Completa los datos de la fuente (sitio, libro o artículo) y recibe la referencia ya formateada, ordenada y lista para pegar en tu trabajo, usando ABNT (el estándar de citas brasileño).',
    tipoTabAriaLabel: 'Tipo de fuente',
    tipoSite: 'Página / sitio web',
    tipoLivro: 'Libro',
    tipoArtigo: 'Artículo científico',
    autorLabel: 'Autor(es)',
    autorHint: 'Separa varios autores con ; . Ej.: Silva, João; Souza, Maria',
    autorPlaceholder: 'Apellido, Nombre',
    tituloLabel: 'Título',
    tituloPlaceholder: 'Título de la obra, página o artículo',
    anoLabel: 'Año',
    nomeSiteLabel: 'Nombre del sitio',
    nomeSitePlaceholder: 'Ej.: Resolva Jato',
    urlLabel: 'URL',
    urlPlaceholder: 'https://...',
    dataAcessoLabel: 'Fecha de acceso',
    editoraLabel: 'Editorial',
    cidadeLabel: 'Ciudad',
    edicaoLabel: 'Edición',
    edicaoHint: 'Ej.: 3.ª ed.',
    revistaLabel: 'Revista / publicación periódica',
    volumeLabel: 'Volumen',
    numeroLabel: 'Número',
    paginasLabel: 'Páginas',
    paginasHint: 'Ej.: 12-30',
    adicionarBtn: 'Agregar referencia',
    listTitle: (n: number) => `Tus referencias (${n})`,
    copiarTudoBtn: 'Copiar todo',
    pdfBtn: 'PDF',
    emptyList:
      'Agrega una referencia al lado. Aparecerán aquí ya en orden alfabético por autor.',
    copiarUmaBtn: 'Copiar',
    removerBtn: 'Eliminar',
    footerNote:
      'El formato sigue las reglas generales de la ABNT NBR 6023, el estándar de citas brasileño. Verifica siempre las normas específicas de tu institución.',
    toastAdded: '¡Referencia agregada!',
    toastCopiedAll: '¡Todas las referencias fueron copiadas!',
    toastCopiedOne: '¡Referencia copiada!',
    toastPdf: '¡PDF generado!',
  },
} as const satisfies Record<Locale, Record<string, unknown>>;

function emptyForm(tipo: ReferenciaTipo) {
  return {
    tipo,
    autor: '',
    titulo: '',
    ano: '',
    nomeSite: '',
    url: '',
    dataAcesso: '',
    editora: '',
    cidade: '',
    edicao: '',
    revista: '',
    volume: '',
    numero: '',
    paginas: ''
  };
}

export function ReferenciasAbntApp({ locale = 'pt-BR' }: { locale?: Locale } = {}) {
  const t = copy[locale];
  const TIPO_OPTIONS: Array<{ id: ReferenciaTipo; label: string; icon: typeof Globe2 }> = [
    { id: 'site', label: t.tipoSite, icon: Globe2 },
    { id: 'livro', label: t.tipoLivro, icon: Library },
    { id: 'artigo', label: t.tipoArtigo, icon: Newspaper }
  ];
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm('site'));
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  function updateField<K extends keyof ReturnType<typeof emptyForm>>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function trocarTipo(tipo: ReferenciaTipo) {
    setForm((prev) => ({ ...emptyForm(tipo), autor: prev.autor, titulo: prev.titulo, ano: prev.ano }));
  }

  const podeAdicionar = form.autor.trim() && form.titulo.trim() && form.ano.trim() &&
    (form.tipo === 'site' ? form.nomeSite.trim() && form.url.trim() :
      form.tipo === 'livro' ? form.editora.trim() :
        form.revista.trim());

  function adicionarReferencia() {
    if (!podeAdicionar) return;
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    let nova: Referencia;
    if (form.tipo === 'site') {
      nova = {
        id, tipo: 'site', autor: form.autor, titulo: form.titulo, ano: form.ano,
        nomeSite: form.nomeSite, url: form.url, dataAcesso: form.dataAcesso
      };
    } else if (form.tipo === 'livro') {
      nova = {
        id, tipo: 'livro', autor: form.autor, titulo: form.titulo, ano: form.ano,
        editora: form.editora, cidade: form.cidade, edicao: form.edicao || undefined
      };
    } else {
      nova = {
        id, tipo: 'artigo', autor: form.autor, titulo: form.titulo, ano: form.ano,
        revista: form.revista, volume: form.volume || undefined, numero: form.numero || undefined,
        paginas: form.paginas || undefined, cidade: form.cidade || undefined
      };
    }
    setReferencias((prev) => [...prev, nova]);
    setForm(emptyForm(form.tipo));
    toast(t.toastAdded);
  }

  function removerReferencia(id: string) {
    setReferencias((prev) => prev.filter((r) => r.id !== id));
  }

  const ordenadas = useMemo(() => ordenarReferencias(referencias), [referencias]);
  const textoCompleto = useMemo(
    () => ordenadas.map((r) => formatarReferenciaAbnt(r)).join('\n\n'),
    [ordenadas]
  );

  function copiarTudo() {
    if (!textoCompleto) return;
    navigator.clipboard.writeText(textoCompleto);
    toast(t.toastCopiedAll);
  }

  function copiarUma(ref: Referencia) {
    navigator.clipboard.writeText(formatarReferenciaAbnt(ref));
    toast(t.toastCopiedOne);
  }

  async function baixarPdf() {
    if (!listRef.current || ordenadas.length === 0) return;
    await exportElementToPdf(listRef.current, 'referencias-abnt');
    toast(t.toastPdf);
  }

  return (
    <AuthGate title={t.authTitle} description={t.authDescription}>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero
          title={t.heroTitle}
          subtitle={t.heroSubtitle}
          icon={BookOpen}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="space-y-4 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label={t.tipoTabAriaLabel}>
              {TIPO_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={form.tipo === opt.id}
                  onClick={() => trocarTipo(opt.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all',
                    form.tipo === opt.id
                      ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50'
                  )}
                >
                  <opt.icon className="h-3.5 w-3.5" aria-hidden />
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label={t.autorLabel}
                htmlFor="ref-autor"
                required
                hint={t.autorHint}
                className="sm:col-span-2"
              >
                <Input
                  id="ref-autor"
                  placeholder={t.autorPlaceholder}
                  value={form.autor}
                  onChange={(e) => updateField('autor', e.target.value)}
                />
              </FormField>

              <FormField label={t.tituloLabel} htmlFor="ref-titulo" required className="sm:col-span-2">
                <Input
                  id="ref-titulo"
                  placeholder={t.tituloPlaceholder}
                  value={form.titulo}
                  onChange={(e) => updateField('titulo', e.target.value)}
                />
              </FormField>

              <FormField label={t.anoLabel} htmlFor="ref-ano" required>
                <Input
                  id="ref-ano"
                  inputMode="numeric"
                  placeholder="2026"
                  value={form.ano}
                  onChange={(e) => updateField('ano', e.target.value)}
                />
              </FormField>

              {form.tipo === 'site' ? (
                <>
                  <FormField label={t.nomeSiteLabel} htmlFor="ref-site-nome" required>
                    <Input
                      id="ref-site-nome"
                      placeholder={t.nomeSitePlaceholder}
                      value={form.nomeSite}
                      onChange={(e) => updateField('nomeSite', e.target.value)}
                    />
                  </FormField>
                  <FormField label={t.urlLabel} htmlFor="ref-url" required className="sm:col-span-2">
                    <Input
                      id="ref-url"
                      placeholder={t.urlPlaceholder}
                      value={form.url}
                      onChange={(e) => updateField('url', e.target.value)}
                    />
                  </FormField>
                  <FormField label={t.dataAcessoLabel} htmlFor="ref-data-acesso">
                    <Input
                      id="ref-data-acesso"
                      type="date"
                      value={form.dataAcesso}
                      onChange={(e) => updateField('dataAcesso', e.target.value)}
                    />
                  </FormField>
                </>
              ) : null}

              {form.tipo === 'livro' ? (
                <>
                  <FormField label={t.editoraLabel} htmlFor="ref-editora" required>
                    <Input
                      id="ref-editora"
                      value={form.editora}
                      onChange={(e) => updateField('editora', e.target.value)}
                    />
                  </FormField>
                  <FormField label={t.cidadeLabel} htmlFor="ref-cidade">
                    <Input
                      id="ref-cidade"
                      value={form.cidade}
                      onChange={(e) => updateField('cidade', e.target.value)}
                    />
                  </FormField>
                  <FormField label={t.edicaoLabel} htmlFor="ref-edicao" hint={t.edicaoHint}>
                    <Input
                      id="ref-edicao"
                      value={form.edicao}
                      onChange={(e) => updateField('edicao', e.target.value)}
                    />
                  </FormField>
                </>
              ) : null}

              {form.tipo === 'artigo' ? (
                <>
                  <FormField label={t.revistaLabel} htmlFor="ref-revista" required className="sm:col-span-2">
                    <Input
                      id="ref-revista"
                      value={form.revista}
                      onChange={(e) => updateField('revista', e.target.value)}
                    />
                  </FormField>
                  <FormField label={t.volumeLabel} htmlFor="ref-volume">
                    <Input id="ref-volume" value={form.volume} onChange={(e) => updateField('volume', e.target.value)} />
                  </FormField>
                  <FormField label={t.numeroLabel} htmlFor="ref-numero">
                    <Input id="ref-numero" value={form.numero} onChange={(e) => updateField('numero', e.target.value)} />
                  </FormField>
                  <FormField label={t.paginasLabel} htmlFor="ref-paginas" hint={t.paginasHint}>
                    <Input id="ref-paginas" value={form.paginas} onChange={(e) => updateField('paginas', e.target.value)} />
                  </FormField>
                </>
              ) : null}
            </div>

            <Button type="button" onClick={adicionarReferencia} disabled={!podeAdicionar} icon={Plus} className="w-full sm:w-auto">
              {t.adicionarBtn}
            </Button>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="rj-display text-base font-bold text-slate-900">
                {t.listTitle(ordenadas.length)}
              </h2>
              {ordenadas.length > 0 ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copiarTudo} icon={Copy}>
                    {t.copiarTudoBtn}
                  </Button>
                  <Button variant="success" size="sm" onClick={baixarPdf} icon={Download}>
                    {t.pdfBtn}
                  </Button>
                </div>
              ) : null}
            </div>

            {ordenadas.length === 0 ? (
              <p className="text-sm font-medium leading-6 text-slate-600">
                {t.emptyList}
              </p>
            ) : (
              <div ref={listRef} className="space-y-3 bg-white">
                {ordenadas.map((ref) => (
                  <div key={ref.id} className="group rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                    <p className="leading-6 text-slate-900">{formatarReferenciaAbnt(ref)}</p>
                    <div className="mt-2 hidden gap-2 group-hover:flex print:hidden">
                      <button
                        type="button"
                        onClick={() => copiarUma(ref)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-teal-800 hover:bg-teal-100"
                      >
                        <Copy className="h-3 w-3" aria-hidden /> {t.copiarUmaBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => removerReferencia(ref.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden /> {t.removerBtn}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-4 text-xs leading-5 text-slate-500">
              {t.footerNote}
            </p>
          </aside>
        </div>
      </div>
    </AuthGate>
  );
}
