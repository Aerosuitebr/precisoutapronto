'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, Search, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Input } from '@/components/ui/input';
import type { InternationalLocale } from '@/lib/i18n';

type Category = 'all' | 'business' | 'study' | 'public' | 'health' | 'ai';
type Resource = { name: string; description: string; url: string; category: Exclude<Category, 'all'>; region: string; official?: boolean };

const resources: Record<InternationalLocale, Resource[]> = {
  en: [
    { name: 'U.S. Small Business Administration', description: 'Guides, local assistance and free or low-cost support for starting and managing a business.', url: 'https://www.sba.gov/', category: 'business', region: 'United States', official: true },
    { name: 'Business.gov.uk', description: 'Official guidance and support for starting, funding and growing a business in the United Kingdom.', url: 'https://www.business.gov.uk/', category: 'business', region: 'United Kingdom', official: true },
    { name: 'SCORE', description: 'Free business mentoring, workshops and templates supported by experienced volunteers.', url: 'https://www.score.org/', category: 'business', region: 'United States' },
    { name: 'Canada Business Benefits Finder', description: 'Find government programs and services that may support a Canadian business.', url: 'https://innovation.ised-isde.canada.ca/s/?language=en_CA', category: 'business', region: 'Canada', official: true },
    { name: 'Khan Academy', description: 'Free lessons and practice in mathematics, science, computing, economics and more.', url: 'https://www.khanacademy.org/?lang=en', category: 'study', region: 'Global' },
    { name: 'MIT OpenCourseWare', description: 'Free course materials from thousands of MIT classes.', url: 'https://ocw.mit.edu/', category: 'study', region: 'Global' },
    { name: 'OpenLearn', description: 'Free courses and learning resources from The Open University.', url: 'https://www.open.edu/openlearn/', category: 'study', region: 'Global' },
    { name: 'USA.gov', description: 'Official directory for U.S. government services, benefits and public information.', url: 'https://www.usa.gov/', category: 'public', region: 'United States', official: true },
    { name: 'GOV.UK', description: 'Official information about benefits, work, taxes, visas and public services in the UK.', url: 'https://www.gov.uk/', category: 'public', region: 'United Kingdom', official: true },
    { name: 'Canada.ca Services', description: 'Official access to Canadian government services and information.', url: 'https://www.canada.ca/en/services.html', category: 'public', region: 'Canada', official: true },
    { name: 'World Health Organization', description: 'Global public-health guidance, fact sheets and country information.', url: 'https://www.who.int/', category: 'health', region: 'Global', official: true },
    { name: 'NHS', description: 'Health information, symptom guidance and access to services in England.', url: 'https://www.nhs.uk/', category: 'health', region: 'England', official: true },
    { name: 'MedlinePlus', description: 'Reliable health information from the U.S. National Library of Medicine.', url: 'https://medlineplus.gov/', category: 'health', region: 'Global', official: true },
    { name: 'ChatGPT', description: 'AI assistant for writing, learning, planning and problem solving.', url: 'https://chatgpt.com/', category: 'ai', region: 'Global' },
    { name: 'Google Gemini', description: 'Google AI assistant for research, writing and multimodal tasks.', url: 'https://gemini.google.com/', category: 'ai', region: 'Global' },
    { name: 'NotebookLM', description: 'Study and research assistant grounded in the sources you provide.', url: 'https://notebooklm.google.com/', category: 'ai', region: 'Global' }
  ],
  es: [
    { name: 'Acelera Pyme', description: 'Recursos oficiales para la digitalización de autónomos y pequeñas empresas.', url: 'https://www.acelerapyme.gob.es/', category: 'business', region: 'España', official: true },
    { name: 'Plataforma ONE', description: 'Información y recursos oficiales para emprendimiento, innovación y startups.', url: 'https://www.one.gob.es/', category: 'business', region: 'España', official: true },
    { name: 'ConnectAmericas', description: 'Plataforma empresarial del BID con oportunidades, formación y contactos para la región.', url: 'https://connectamericas.com/es', category: 'business', region: 'América Latina y Caribe', official: true },
    { name: 'Emprender SUNAT', description: 'Orientación tributaria y recursos para emprendedores y pequeños negocios.', url: 'https://emprender.sunat.gob.pe/', category: 'business', region: 'Perú', official: true },
    { name: 'Khan Academy en Español', description: 'Lecciones y ejercicios gratuitos de matemáticas, ciencias, economía y otras materias.', url: 'https://es.khanacademy.org/', category: 'study', region: 'Global' },
    { name: 'Miríadax', description: 'Cursos en línea en español ofrecidos por universidades e instituciones iberoamericanas.', url: 'https://miriadax.net/', category: 'study', region: 'Iberoamérica' },
    { name: 'Biblioteca Digital Mundial', description: 'Colecciones históricas y culturales de acceso gratuito en varios idiomas.', url: 'https://www.loc.gov/collections/world-digital-library/about-this-collection/', category: 'study', region: 'Global', official: true },
    { name: 'Administración.gob.es', description: 'Punto de acceso oficial a trámites e información de las administraciones públicas.', url: 'https://administracion.gob.es/', category: 'public', region: 'España', official: true },
    { name: 'Gob.mx', description: 'Portal oficial de trámites, servicios e información del Gobierno de México.', url: 'https://www.gob.mx/', category: 'public', region: 'México', official: true },
    { name: 'Argentina.gob.ar', description: 'Portal oficial de trámites, servicios y programas públicos de Argentina.', url: 'https://www.argentina.gob.ar/', category: 'public', region: 'Argentina', official: true },
    { name: 'OPS', description: 'Información sanitaria y recursos de la Organización Panamericana de la Salud.', url: 'https://www.paho.org/es', category: 'health', region: 'Américas', official: true },
    { name: 'MedlinePlus en Español', description: 'Información confiable sobre salud, medicamentos y bienestar.', url: 'https://medlineplus.gov/spanish/', category: 'health', region: 'Global', official: true },
    { name: 'Ministerio de Sanidad', description: 'Información oficial sobre salud pública y el sistema sanitario español.', url: 'https://www.sanidad.gob.es/', category: 'health', region: 'España', official: true },
    { name: 'ChatGPT', description: 'Asistente de IA para escribir, estudiar, planificar y resolver problemas en español.', url: 'https://chatgpt.com/', category: 'ai', region: 'Global' },
    { name: 'Google Gemini', description: 'Asistente de Google para investigación, escritura y tareas multimodales.', url: 'https://gemini.google.com/', category: 'ai', region: 'Global' },
    { name: 'NotebookLM', description: 'Asistente de estudio e investigación basado en las fuentes que proporcionas.', url: 'https://notebooklm.google.com/', category: 'ai', region: 'Global' }
  ]
};

const copy = {
  en: {
    title: 'Free resources in English', subtitle: 'Curated links for English-speaking regions and global services.',
    back: 'Back to tools', placeholder: 'Search by name, topic or region...', count: 'resources found',
    empty: 'No resources found. Try a broader term or another category.', external: 'External resource',
    official: 'Official source', open: 'Open resource', region: 'Region',
    categories: { all: 'All', business: 'Business', study: 'Study', public: 'Public services', health: 'Health', ai: 'Artificial intelligence' }
  },
  es: {
    title: 'Recursos gratuitos en español', subtitle: 'Enlaces seleccionados para España, América Latina y servicios globales.',
    back: 'Volver a herramientas', placeholder: 'Busca por nombre, tema o región...', count: 'recursos encontrados',
    empty: 'No encontramos recursos. Prueba un término más amplio u otra categoría.', external: 'Recurso externo',
    official: 'Fuente oficial', open: 'Abrir recurso', region: 'Región',
    categories: { all: 'Todos', business: 'Negocios', study: 'Estudios', public: 'Servicios públicos', health: 'Salud', ai: 'Inteligencia artificial' }
  }
} as const;

export function InternationalResourceSearch({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const categories = Object.keys(t.categories) as Category[];
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    return resources[locale].filter((resource) => {
      const matchesCategory = category === 'all' || resource.category === category;
      const haystack = `${resource.name} ${resource.description} ${resource.region}`.toLocaleLowerCase(locale);
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [category, locale, query]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href={`/${locale}`}><Logo variant="marketing" className="h-12 sm:h-14" /></Link>
          <LocaleSwitcher locale={locale} label={locale === 'en' ? 'Language' : 'Idioma'} paths={{ 'pt-BR': '/busca', en: '/en/tools/resource-search', es: '/es/tools/resource-search' }} />
        </div>
      </header>
      <main>
        <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-4 py-12 text-white sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <Link href={`/${locale}/tools`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-300"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
            <h1 className="precisoutapronto-display mt-7 text-4xl font-extrabold tracking-tight sm:text-5xl">{t.title}</h1>
            <p className="mt-3 text-lg text-slate-300">{t.subtitle}</p>
            <label className="relative mt-7 block max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.placeholder} className="h-14 bg-white pl-12 text-base text-slate-950" />
            </label>
          </div>
        </section>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-bold ${category === item ? 'border-sky-700 bg-sky-700 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>{t.categories[item]}</button>)}
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-600">{results.length} {t.count}</p>
          {results.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((resource) => (
                <article key={resource.url} className="flex flex-col rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{t.external}</span>
                    {resource.official ? <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800"><ShieldCheck className="h-3 w-3" />{t.official}</span> : null}
                  </div>
                  <h2 className="mt-4 text-lg font-extrabold">{resource.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{resource.description}</p>
                  <p className="mt-4 text-xs font-bold text-slate-500">{t.region}: {resource.region}</p>
                  <Link href={resource.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-sky-700">{t.open}<ExternalLink className="h-4 w-4" /></Link>
                </article>
              ))}
            </div>
          ) : <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">{t.empty}</p>}
        </div>
      </main>
    </div>
  );
}
