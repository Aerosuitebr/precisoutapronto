'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Gift, LockKeyhole, Sparkles, X } from 'lucide-react';
import type { AuthRequiredVariant } from '@/components/auth/auth-required-provider';
import { Button } from '@/components/ui/button';
import { localeFromPathname, type Locale } from '@/lib/i18n-locale';
import { toolsCatalog } from '@/lib/tools-catalog';
import { PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';

const modalCopy = {
  'pt-BR': {
    close: 'Fechar',
    badgeTrial: 'Continue grátis',
    badgeDefault: 'Acesso com conta',
    titleTrial: 'Gostou? Continue gerando de graça.',
    titleDefault: 'Falta pouco para continuar',
    bodyTrialBefore: 'Crie uma conta grátis para seguir usando',
    bodyTrialAfter: '. A geração de documentos continua gratuita.',
    bodyDefaultBefore: 'Crie uma conta gratuita ou faça login para continuar usando',
    bodyDefaultAfter: '.',
    tipTrialBefore:
      "No plano gratuito, PDFs e WhatsApp saem com marca d'água e referências ao Resolva Jato. Para retirar tudo, assine o Premium por",
    tipDefault: 'Depois do cadastro ou login, você volta para a ferramenta e continua de onde parou.',
    signup: 'Criar conta grátis',
    login: 'Já tenho conta. Fazer login',
    dismissTrial: 'Fechar por agora',
    dismissDefault: 'Continuar navegando',
    fallbackTool: 'o recurso que você escolheu',
    fallbackTools: 'as ferramentas do Resolva Jato',
    fallbackAccount: 'sua conta'
  },
  en: {
    close: 'Close',
    badgeTrial: 'Keep going free',
    badgeDefault: 'Account required',
    titleTrial: 'Liked it? Keep generating for free.',
    titleDefault: 'Almost there',
    bodyTrialBefore: 'Create a free account to keep using',
    bodyTrialAfter: '. Document generation stays free.',
    bodyDefaultBefore: 'Create a free account or sign in to keep using',
    bodyDefaultAfter: '.',
    tipTrialBefore:
      'On the free plan, PDFs and WhatsApp include a watermark and Resolva Jato references. To remove them, get Premium for',
    tipDefault: 'After signup or login, you return to the tool and continue where you left off.',
    signup: 'Create free account',
    login: 'I already have an account. Sign in',
    dismissTrial: 'Close for now',
    dismissDefault: 'Keep browsing',
    fallbackTool: 'the tool you chose',
    fallbackTools: 'Resolva Jato tools',
    fallbackAccount: 'your account'
  },
  es: {
    close: 'Cerrar',
    badgeTrial: 'Sigue gratis',
    badgeDefault: 'Acceso con cuenta',
    titleTrial: 'Te gusto? Sigue generando gratis.',
    titleDefault: 'Falta poco para continuar',
    bodyTrialBefore: 'Crea una cuenta gratis para seguir usando',
    bodyTrialAfter: '. La generacion de documentos sigue siendo gratuita.',
    bodyDefaultBefore: 'Crea una cuenta gratuita o inicia sesion para seguir usando',
    bodyDefaultAfter: '.',
    tipTrialBefore:
      'En el plan gratuito, los PDF y WhatsApp salen con marca de agua y referencias a Resolva Jato. Para quitarlas, suscribete al Premium por',
    tipDefault: 'Despues del registro o inicio de sesion, vuelves a la herramienta y continuas donde lo dejaste.',
    signup: 'Crear cuenta gratis',
    login: 'Ya tengo cuenta. Iniciar sesion',
    dismissTrial: 'Cerrar por ahora',
    dismissDefault: 'Seguir navegando',
    fallbackTool: 'el recurso que elegiste',
    fallbackTools: 'las herramientas de Resolva Jato',
    fallbackAccount: 'tu cuenta'
  }
} as const;

function authPaths(locale: Locale) {
  if (locale === 'en') return { login: '/en/login', signup: '/en/cadastro' };
  if (locale === 'es') return { login: '/es/login', signup: '/es/cadastro' };
  return { login: '/login', signup: '/cadastro' };
}

const internationalToolNames: Record<string, Record<'en' | 'es', string>> = {
  'quote-pix': { en: 'Quote + Pix', es: 'Presupuesto + Pix' },
  resume: { en: 'Resume builder', es: 'Generador de curriculum' },
  receipt: { en: 'Receipt', es: 'Recibo' },
  proposal: { en: 'Proposal', es: 'Propuesta' },
  'service-contract': { en: 'Service contract', es: 'Contrato de servicio' },
  pix: { en: 'Pix charge', es: 'Cobro Pix' },
  severance: { en: 'Severance calculator', es: 'Calculadora de liquidacion' },
  'freelance-pricing': { en: 'Freelance pricing', es: 'Precio freelance' },
  'legal-documents': { en: 'Legal documents', es: 'Documentos legales' },
  'accounting-documents': { en: 'Accounting documents', es: 'Documentos contables' },
  'academic-cover': { en: 'Academic cover page', es: 'Portada academica' },
  agenda: { en: 'Agenda', es: 'Agenda' },
  'resource-search': { en: 'Resource search', es: 'Busqueda de recursos' },
  'email-signature': { en: 'Email signature', es: 'Firma de email' },
  'delivery-schedule': { en: 'Delivery schedule', es: 'Cronograma de entregas' },
  'bill-splitter': { en: 'Bill splitter', es: 'Divisor de cuenta' },
  'study-schedule': { en: 'Study schedule', es: 'Cronograma de estudios' },
  'background-remover': { en: 'Background remover', es: 'Quitar fondo' },
  'pdf-editor': { en: 'PDF editor', es: 'Editor de PDF' },
  'mei-vs-employment': { en: 'MEI vs employment', es: 'MEI vs empleo' },
  'enem-essay': { en: 'ENEM essay helper', es: 'Redaccion ENEM' },
  'abnt-references': { en: 'ABNT references', es: 'Referencias ABNT' },
  'lattes-cv': { en: 'Lattes CV helper', es: 'Curriculum Lattes' }
};

export function describeAuthDestination(nextHref: string, locale: Locale = 'pt-BR') {
  const t = modalCopy[locale];
  const path = nextHref.split('?')[0] || '/ferramentas';
  const tool = toolsCatalog.find((item) => path === item.href || path.startsWith(`${item.href}/`));
  if (tool) return tool.name;

  const intlMatch = path.match(/\/(?:en|es)\/tools\/([^/]+)/);
  if (intlMatch && (locale === 'en' || locale === 'es')) {
    const slug = intlMatch[1];
    const named = internationalToolNames[slug]?.[locale];
    if (named) return named;
  }

  if (path.includes('/tools') || path.startsWith('/ferramentas')) return t.fallbackTools;
  if (path.includes('/account') || path.startsWith('/conta')) return t.fallbackAccount;
  return t.fallbackTool;
}

interface AuthRequiredModalProps {
  open: boolean;
  nextHref: string;
  variant?: AuthRequiredVariant;
  onClose: () => void;
}

export function AuthRequiredModal({
  open,
  nextHref,
  variant = 'default',
  onClose
}: AuthRequiredModalProps) {
  const locale = localeFromPathname(nextHref || (typeof window !== 'undefined' ? window.location.pathname : '/'));
  const t = modalCopy[locale];
  const destination = describeAuthDestination(nextHref, locale);
  const paths = authPaths(locale);
  const loginHref = `${paths.login}?next=${encodeURIComponent(nextHref)}`;
  const signupHref = `${paths.signup}?next=${encodeURIComponent(nextHref)}`;
  const trialDone = variant === 'guest_trial_done';
  const premiumPrice = PLANS.premium.priceLabel;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-required-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        aria-label={t.close}
        onClick={onClose}
      />

      <div
        className={cn(
          'relative z-10 w-full max-w-md overflow-hidden rounded-t-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]',
          'sm:rounded-[28px]'
        )}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 pb-5 pt-6 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 70% 60% at 15% 0%, rgba(56,189,248,0.35), transparent 55%)'
            }}
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label={t.close}
          >
            <X className="h-4 w-4" />
          </button>

          <span className="relative inline-flex items-center gap-2 rounded-lg bg-sky-400/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-200">
            {trialDone ? <Gift className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
            {trialDone ? t.badgeTrial : t.badgeDefault}
          </span>
          <h2 id="auth-required-title" className="rj-display relative mt-4 text-2xl font-extrabold tracking-tight">
            {trialDone ? t.titleTrial : t.titleDefault}
          </h2>
          <p className="relative mt-2 text-sm leading-6 text-slate-300">
            {trialDone ? (
              <>
                {t.bodyTrialBefore}{' '}
                <strong className="font-semibold text-white">{destination}</strong>
                {t.bodyTrialAfter}
              </>
            ) : (
              <>
                {t.bodyDefaultBefore}{' '}
                <strong className="font-semibold text-white">{destination}</strong>
                {t.bodyDefaultAfter}
              </>
            )}
          </p>
        </div>

        <div className="space-y-3 px-6 py-6">
          <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm leading-6 text-slate-700">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <p>
              {trialDone ? (
                <>
                  {t.tipTrialBefore} <strong>{premiumPrice}</strong>.
                </>
              ) : (
                t.tipDefault
              )}
            </p>
          </div>

          <Button asChild size="lg" className="h-12 w-full text-base">
            <Link href={signupHref} onClick={onClose}>
              {t.signup}
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="h-12 w-full text-base">
            <Link href={loginHref} onClick={onClose}>
              {t.login}
            </Link>
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-center text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
          >
            {trialDone ? t.dismissTrial : t.dismissDefault}
          </button>
        </div>
      </div>
    </div>
  );
}
