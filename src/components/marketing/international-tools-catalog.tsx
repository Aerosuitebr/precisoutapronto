import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Calculator,
  CalendarDays,
  ClipboardList,
  FileText,
  Gavel,
  GraduationCap,
  LockKeyhole,
  Receipt,
  Scale,
  Search,
  Sparkles,
  Wallet
} from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Button } from '@/components/ui/button';
import { internationalCopy, type InternationalLocale } from '@/lib/i18n';

const catalog = {
  en: {
    eyebrow: 'Public tool catalog',
    title: 'Find the right tool and get it done.',
    description:
      'Explore every resource without creating an account. Editing, saving and exporting may require a free account.',
    notice:
      'We are translating the editors gradually. Tools marked below currently open in Brazilian Portuguese.',
    back: 'Back to home',
    open: 'Explore tool',
    account: 'Create free account',
    portuguese: 'Editor currently in Portuguese',
    categories: [
      {
        title: 'Business and payments',
        description: 'Quotes, Pix payments, proposals and receipts.',
        icon: Briefcase,
        tools: [
          ['Quote + client approval', 'Send a mobile approval link before collecting payment.', '/orcamento-com-pix', ClipboardList],
          ['Pix payment', 'Generate a QR code and copy-and-paste Pix payment code.', '/ferramentas/pix', Wallet],
          ['Business proposal', 'Present scope, pricing and terms with an agency-style PDF.', '/gerador-de-proposta-comercial', FileText],
          ['Receipt', 'Create a receipt with the amount written out automatically.', '/gerador-de-recibo', Receipt],
          ['Freelance pricing', 'Calculate an hourly rate and a sustainable project price.', '/calculadora-de-preco-freelancer', Calculator]
        ]
      },
      {
        title: 'Legal and accounting',
        description: 'Everyday documents for service providers and small offices.',
        icon: Gavel,
        tools: [
          ['Contracts', 'Editable service, rental and sales agreement templates.', '/gerador-de-contrato', Scale],
          ['Legal documents', 'Powers of attorney, notices and practical legal templates.', '/documentos-juridicos-online', Gavel],
          ['Accounting documents', 'Tax and administrative documents for daily operations.', '/documentos-contabeis-online', Calculator],
          ['Termination calculator', 'Estimate salary balance, vacation and severance amounts.', '/calculadora-de-rescisao', Calculator]
        ]
      },
      {
        title: 'Career and organization',
        description: 'Documents and resources for work, study and deadlines.',
        icon: GraduationCap,
        tools: [
          ['Professional résumé', 'Build a clear résumé and export it as a PDF.', '/gerador-de-curriculo', GraduationCap],
          ['Academic cover page', 'Create Brazilian ABNT-style school and university covers.', '/ferramentas/trabalhos', BookOpen],
          ['Agenda', 'Organize appointments, reminders and weekly deadlines.', '/ferramentas/agenda', CalendarDays],
          ['Free resource search', 'Browse a curated collection of useful links.', '/busca', Search]
        ]
      }
    ]
  },
  es: {
    eyebrow: 'Catálogo público de herramientas',
    title: 'Encuentra la herramienta correcta y resuélvelo.',
    description:
      'Explora cada recurso sin crear una cuenta. Para editar, guardar o exportar puede ser necesaria una cuenta gratuita.',
    notice:
      'Estamos traduciendo los editores gradualmente. Las herramientas indicadas todavía se abren en portugués de Brasil.',
    back: 'Volver al inicio',
    open: 'Explorar herramienta',
    account: 'Crear cuenta gratis',
    portuguese: 'Editor disponible actualmente en portugués',
    categories: [
      {
        title: 'Negocios y cobros',
        description: 'Presupuestos, Pix, propuestas y recibos.',
        icon: Briefcase,
        tools: [
          ['Presupuesto + aprobación', 'Envía un enlace para que el cliente apruebe desde su celular.', '/orcamento-com-pix', ClipboardList],
          ['Cobro con Pix', 'Genera un código QR y un código Pix para copiar y pegar.', '/ferramentas/pix', Wallet],
          ['Propuesta comercial', 'Presenta alcance, precios y condiciones con un PDF profesional.', '/gerador-de-proposta-comercial', FileText],
          ['Recibo', 'Crea un recibo con el valor escrito automáticamente.', '/gerador-de-recibo', Receipt],
          ['Precio para freelancers', 'Calcula una tarifa por hora y un precio sostenible por proyecto.', '/calculadora-de-preco-freelancer', Calculator]
        ]
      },
      {
        title: 'Jurídico y contabilidad',
        description: 'Documentos cotidianos para profesionales y pequeños despachos.',
        icon: Gavel,
        tools: [
          ['Contratos', 'Modelos editables para servicios, alquiler y compraventa.', '/gerador-de-contrato', Scale],
          ['Documentos jurídicos', 'Poderes, notificaciones y modelos jurídicos prácticos.', '/documentos-juridicos-online', Gavel],
          ['Documentos contables', 'Documentos fiscales y administrativos para la rutina diaria.', '/documentos-contabeis-online', Calculator],
          ['Calculadora de liquidación', 'Calcula salario, vacaciones e indemnizaciones laborales.', '/calculadora-de-rescisao', Calculator]
        ]
      },
      {
        title: 'Carrera y organización',
        description: 'Documentos y recursos para trabajar, estudiar y cumplir plazos.',
        icon: GraduationCap,
        tools: [
          ['Currículum profesional', 'Crea un currículum claro y expórtalo en PDF.', '/gerador-de-curriculo', GraduationCap],
          ['Portada académica', 'Crea portadas escolares y universitarias con el estándar ABNT.', '/ferramentas/trabalhos', BookOpen],
          ['Agenda', 'Organiza compromisos, recordatorios y plazos semanales.', '/ferramentas/agenda', CalendarDays],
          ['Buscador de recursos', 'Explora una selección de enlaces útiles y gratuitos.', '/busca', Search]
        ]
      }
    ]
  }
} as const;

export function InternationalToolsCatalog({ locale }: { locale: InternationalLocale }) {
  const copy = catalog[locale];
  const nav = internationalCopy[locale].navigation;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href={`/${locale}`} aria-label="Resolva Jato">
            <Logo variant="marketing" className="h-12 sm:h-14" />
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher
              locale={locale}
              label={nav.language}
              paths={{ 'pt-BR': '/recursos', en: '/en/tools', es: '/es/tools' }}
            />
            <Button asChild className="hidden sm:inline-flex">
              <Link href={`/${locale}/cadastro`}>{copy.account}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700">
              <ArrowLeft className="h-4 w-4" />
              {copy.back}
            </Link>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">{copy.eyebrow}</p>
            <h1 className="rj-display mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">{copy.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{copy.description}</p>
            <div className="mt-7 flex max-w-3xl items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              {copy.notice}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-14 px-4 py-14 sm:px-6 sm:py-20">
          {copy.categories.map((category) => (
            <section key={category.title}>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sky-800">
                  <category.icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold">{category.title}</h2>
                  <p className="text-sm text-slate-500">{category.description}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.tools.map(([name, description, href, Icon]) => (
                  <article key={name} className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                    <Icon className="h-6 w-6 text-sky-700" />
                    <h3 className="mt-4 text-lg font-extrabold">{name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
                    {href === '/orcamento-com-pix' || href === '/ferramentas/pix' || href === '/ferramentas/agenda' || href === '/gerador-de-recibo' || href === '/gerador-de-proposta-comercial' || href === '/gerador-de-curriculo' || href === '/gerador-de-contrato' || href === '/calculadora-de-preco-freelancer' || href === '/calculadora-de-rescisao' || href === '/ferramentas/trabalhos' || href === '/documentos-juridicos-online' || href === '/documentos-contabeis-online' || href === '/busca' ? (
                      <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <Sparkles className="h-3.5 w-3.5" />
                        {locale === 'en' ? 'Available in English' : 'Disponible en español'}
                      </p>
                    ) : (
                      <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                        <LockKeyhole className="h-3.5 w-3.5" />
                        {copy.portuguese}
                      </p>
                    )}
                    <Link href={href === '/orcamento-com-pix' ? `/${locale}/tools/quote-pix` : href === '/ferramentas/pix' ? `/${locale}/tools/pix` : href === '/ferramentas/agenda' ? `/${locale}/tools/agenda` : href === '/gerador-de-recibo' ? `/${locale}/tools/receipt` : href === '/gerador-de-proposta-comercial' ? `/${locale}/tools/proposal` : href === '/gerador-de-curriculo' ? `/${locale}/tools/resume` : href === '/gerador-de-contrato' ? `/${locale}/tools/service-contract` : href === '/calculadora-de-preco-freelancer' ? `/${locale}/tools/freelance-pricing` : href === '/calculadora-de-rescisao' ? `/${locale}/tools/severance` : href === '/ferramentas/trabalhos' ? `/${locale}/tools/academic-cover` : href === '/documentos-juridicos-online' ? `/${locale}/tools/legal-documents` : href === '/documentos-contabeis-online' ? `/${locale}/tools/accounting-documents` : href === '/busca' ? `/${locale}/tools/resource-search` : href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-900">
                      {copy.open}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
