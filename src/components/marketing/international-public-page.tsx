import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Mail, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Button } from '@/components/ui/button';
import type { InternationalLocale } from '@/lib/i18n';

export type InternationalPublicPageId = 'about' | 'contact' | 'terms' | 'privacy';

const shared = {
  en: { language: 'Language', back: 'Back to home', questions: 'Questions?', contact: 'Contact us', updated: 'Last updated: July 21, 2026.' },
  es: { language: 'Idioma', back: 'Volver al inicio', questions: '¿Tienes preguntas?', contact: 'Contáctanos', updated: 'Última actualización: 21 de julio de 2026.' }
} as const;

const content = {
  en: {
    about: {
      title: 'About Precisou, Tá Pronto', subtitle: 'Practical tools without bureaucracy',
      paragraphs: [
        'Precisou, Tá Pronto is a Brazilian platform operated by Aerosuite. It brings together tools for independent professionals, students and small businesses, including résumés, receipts, contracts, proposals and more.',
        'You can start without providing a credit card. International tools are adapted to their language and clearly identify features or standards that are specific to Brazil.',
        'Our guides and templates are written for practical use and reviewed before publication. Legal, employment, tax and accounting materials include limitations whenever individual professional advice may be required.'
      ]
    },
    contact: {
      title: 'Contact', subtitle: 'Support, security and privacy',
      paragraphs: [
        'Precisou, Tá Pronto is a product operated by Aerosuite.',
        'For product support, security reports, privacy requests or corrections, email contato@resolvajato.com.br.',
        'Official website: https://resolvajato.com.br'
      ]
    },
    terms: {
      title: 'Terms of use', subtitle: 'Clear rules for using Precisou, Tá Pronto',
      paragraphs: [
        'By creating an account, you agree to use the platform in good faith and not for spam, fraud, social engineering or attempts to bypass security limits.',
        'Free tools may have usage allowances. Documents and information you generate remain your legal and professional responsibility. Precisou, Tá Pronto provides templates and productivity tools, not individualized legal, tax, accounting or employment advice.',
        'We may suspend accounts that violate these terms or put other users at risk. The service may evolve, and we will communicate material changes whenever reasonably possible.'
      ]
    },
    privacy: {
      title: 'Privacy', subtitle: 'Transparency about your data',
      paragraphs: [
        'Precisou, Tá Pronto is operated by Aerosuite. We collect the data needed to create and protect your account, including name, email, password hash and security signals such as IP address, device and audit logs.',
        'We do not sell personal data. Content created in our tools may be associated with your account so the service can save and restore it. You may request account deletion through our contact email.',
        'We use essential session and device cookies and Cloudflare Turnstile to protect against automated abuse. Optional analytics are used only with consent. We do not use third-party advertising pixels on this site.'
      ]
    }
  },
  es: {
    about: {
      title: 'Acerca de Precisou, Tá Pronto', subtitle: 'Herramientas prácticas sin burocracia',
      paragraphs: [
        'Precisou, Tá Pronto es una plataforma brasileña operada por Aerosuite. Reúne herramientas para profesionales independientes, estudiantes y pequeños negocios, como currículums, recibos, contratos y propuestas.',
        'Puedes comenzar sin proporcionar una tarjeta. Las herramientas internacionales se adaptan a su idioma e identifican claramente las funciones o normas específicas de Brasil.',
        'Nuestros contenidos y modelos se preparan para un uso práctico y se revisan antes de publicarse. Los materiales jurídicos, laborales, fiscales y contables indican sus límites cuando puede ser necesaria una consulta profesional individual.'
      ]
    },
    contact: {
      title: 'Contacto', subtitle: 'Soporte, seguridad y privacidad',
      paragraphs: [
        'Precisou, Tá Pronto es un producto operado por Aerosuite.',
        'Para soporte, informes de seguridad, solicitudes de privacidad o correcciones, escribe a contato@resolvajato.com.br.',
        'Sitio oficial: https://resolvajato.com.br'
      ]
    },
    terms: {
      title: 'Términos de uso', subtitle: 'Reglas claras para utilizar Precisou, Tá Pronto',
      paragraphs: [
        'Al crear una cuenta, aceptas utilizar la plataforma de buena fe y no emplearla para spam, fraude, ingeniería social ni intentos de eludir límites de seguridad.',
        'Las herramientas gratuitas pueden tener límites de uso. Los documentos y datos que generes son de tu responsabilidad jurídica y profesional. Precisou, Tá Pronto ofrece modelos y productividad, no asesoramiento jurídico, fiscal, contable o laboral individual.',
        'Podemos suspender cuentas que incumplan estos términos o pongan en riesgo a otros usuarios. El servicio puede evolucionar y comunicaremos los cambios importantes cuando sea razonablemente posible.'
      ]
    },
    privacy: {
      title: 'Privacidad', subtitle: 'Transparencia sobre tus datos',
      paragraphs: [
        'Precisou, Tá Pronto es operado por Aerosuite. Recopilamos los datos necesarios para crear y proteger tu cuenta, como nombre, correo, hash de contraseña y señales de seguridad como dirección IP, dispositivo y registros de auditoría.',
        'No vendemos datos personales. El contenido creado en las herramientas puede asociarse a tu cuenta para guardarlo y restaurarlo. Puedes solicitar la eliminación de tu cuenta mediante nuestro correo de contacto.',
        'Utilizamos cookies esenciales de sesión y dispositivo y Cloudflare Turnstile para evitar abusos automatizados. Los análisis opcionales solo se utilizan con consentimiento. No usamos píxeles publicitarios de terceros.'
      ]
    }
  }
} as const;

function Header({ locale, path }: { locale: InternationalLocale; path: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href={`/${locale}`}><Logo variant="marketing" className="h-12 sm:h-14" /></Link>
        <LocaleSwitcher locale={locale} label={shared[locale].language} paths={{ 'pt-BR': `/${path === 'about' ? 'sobre' : path === 'contact' ? 'contato' : path === 'terms' ? 'termos' : path === 'privacy' ? 'privacidade' : 'planos'}`, en: `/en/${path}`, es: `/es/${path}` }} />
      </div>
    </header>
  );
}

export function InternationalPublicPage({ locale, page }: { locale: InternationalLocale; page: InternationalPublicPageId }) {
  const t = content[locale][page];
  const s = shared[locale];
  return (
    <div className="min-h-screen bg-slate-50">
      <Header locale={locale} path={page} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700"><ArrowLeft className="h-4 w-4" />{s.back}</Link>
        <article className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">{t.subtitle}</p>
          <h1 className="rj-display mt-3 text-3xl font-extrabold text-slate-950 sm:text-4xl">{t.title}</h1>
          <div className="mt-7 space-y-5 text-base leading-8 text-slate-700">
            {t.paragraphs.map((paragraph) => paragraph.includes('contato@') ? <p key={paragraph}><Mail className="mr-2 inline h-4 w-4" /><a className="font-bold text-sky-700" href="mailto:contato@resolvajato.com.br">{paragraph}</a></p> : <p key={paragraph}>{paragraph}</p>)}
            {page === 'terms' || page === 'privacy' ? <p className="text-sm text-slate-500">{s.updated}</p> : null}
          </div>
          <p className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-500">{s.questions} <Link className="font-bold text-sky-700" href={`/${locale}/contact`}>{s.contact}</Link>.</p>
        </article>
      </main>
    </div>
  );
}

export function InternationalPlansPage({ locale }: { locale: InternationalLocale }) {
  const en = locale === 'en';
  const t = en ? {
    title: 'Start free. Remove the brand when you need to.', subtitle: 'Free trial · Optional Premium',
    description: 'Free PDFs include a discreet Precisou, Tá Pronto footer. Premium removes the logo and footer for 30 days.',
    free: 'Free', freeNote: 'Try the service with no card', create: 'Start with free tools',
    premiumNote: 'Clean documents without Precisou, Tá Pronto references', period: 'for 30 days',
    price: 'US$6.00', payment: 'International checkout securely processed by Stripe.',
    buy: 'Continue securely with Stripe',
    freeItems: ['Professional PDF documents', 'Save and download without a usage limit', 'Precisou, Tá Pronto footer and logo', 'Public resource search'],
    paidItems: ['PDF without footer or logo', 'WhatsApp and email without brand references', '30 days of Premium access', 'One-time payment without automatic renewal']
  } : {
    title: 'Comienza gratis. Elimina la marca cuando lo necesites.', subtitle: 'Prueba gratis · Premium opcional',
    description: 'Los PDF gratuitos incluyen un pie discreto de Precisou, Tá Pronto. Premium elimina el logotipo y el pie durante 30 días.',
    free: 'Gratis', freeNote: 'Prueba el servicio sin tarjeta', create: 'Empezar con herramientas gratis',
    premiumNote: 'Documentos limpios sin referencias a Precisou, Tá Pronto', period: 'por 30 días',
    price: 'US$6,00', payment: 'Checkout internacional procesado de forma segura por Stripe.',
    buy: 'Continuar de forma segura con Stripe',
    freeItems: ['Documentos profesionales en PDF', 'Guardado y descargas sin límite de uso', 'Pie y logotipo de Precisou, Tá Pronto', 'Buscador público de recursos'],
    paidItems: ['PDF sin pie ni logotipo', 'WhatsApp y correo sin referencias de marca', '30 días de acceso Premium', 'Pago único sin renovación automática']
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <Header locale={locale} path="plans" />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-700">{t.subtitle}</p><h1 className="rj-display mt-3 text-4xl font-extrabold">{t.title}</h1><p className="mt-4 leading-7 text-slate-600">{t.description}</p></div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <PlanCard title={t.free} note={t.freeNote} price={en ? '$0' : 'US$0'} items={t.freeItems}><Button asChild className="w-full" variant="outline"><Link href={`/${locale}/tools`}>{t.create}</Link></Button></PlanCard>
          <PlanCard dark title="Premium" note={t.premiumNote} price={`${t.price} ${t.period}`} items={t.paidItems}><p className="mb-4 rounded-xl bg-emerald-300/10 p-3 text-xs leading-5 text-emerald-100">{t.payment}</p><Button asChild className="w-full bg-white text-slate-950 hover:bg-slate-100"><Link href={`/${locale}/checkout`}>{t.buy}<ArrowRight className="h-4 w-4" /></Link></Button></PlanCard>
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500"><ShieldCheck className="h-4 w-4" />{en ? 'No automatic renewal.' : 'Sin renovación automática.'}</p>
      </main>
    </div>
  );
}

function PlanCard({ title, note, price, items, dark = false, children }: { title: string; note: string; price: string; items: readonly string[]; dark?: boolean; children: React.ReactNode }) {
  return <article className={`rounded-[28px] border p-8 shadow-sm ${dark ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-950'}`}><h2 className="text-2xl font-extrabold">{title}</h2><p className={`mt-1 text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{note}</p><p className="rj-display mt-6 text-4xl font-extrabold">{price}</p><ul className="my-7 space-y-3 text-sm">{items.map((item) => <li key={item} className="flex gap-2"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? 'text-amber-300' : 'text-sky-600'}`} />{item}</li>)}</ul>{children}</article>;
}
