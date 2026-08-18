import { getSession } from './auth';
import { getPlan, type PlanId } from './plans';
import type { BillableAction, BillableContext, BillableToolId } from './billing-server';
import {
  consumeGuestTrial,
  hasGuestTrialAvailable
} from './guest-trial';
import { localeFromPathname, type Locale } from './i18n-locale';

const guestCopy = {
  'pt-BR': {
    trialAvailable: 'Acesso livre: duas gerações completas sem marca.',
    accountRequired:
      'Crie uma conta gratuita para continuar gerando documentos. A geração segue grátis, com a marca Precisou, Tá Pronto.',
    guestSuccess: 'Documento gerado sem marca. Você ainda pode gerar de novo sem conta.',
    guestSuccessLast: 'Documento gerado sem marca. Para continuar, crie uma conta grátis.',
    saved: 'Documento salvo com sucesso.',
    downloaded: 'Download concluído.',
    analyzed: 'Análise concluída.'
  },
  en: {
    trialAvailable: 'Free access: two full generations without branding.',
    accountRequired:
      'Create a free account to keep generating documents. Generation stays free, with the Precisou, Tá Pronto brand.',
    guestSuccess: 'Document generated without branding. You can generate again without an account.',
    guestSuccessLast: 'Document generated without branding. Create a free account to continue.',
    saved: 'Document saved successfully.',
    downloaded: 'Download complete.',
    analyzed: 'Analysis complete.'
  },
  es: {
    trialAvailable: 'Acceso libre: dos generaciones completas sin marca.',
    accountRequired:
      'Crea una cuenta gratuita para seguir generando documentos. La generacion sigue gratis, con la marca Precisou, Tá Pronto.',
    guestSuccess: 'Documento generado sin marca. Todavia puedes generar otra vez sin cuenta.',
    guestSuccessLast: 'Documento generado sin marca. Para continuar, crea una cuenta gratis.',
    saved: 'Documento guardado con exito.',
    downloaded: 'Descarga concluida.',
    analyzed: 'Analisis concluido.'
  }
} as const;

function billingLocale(): Locale {
  if (typeof window === 'undefined') return 'pt-BR';
  return localeFromPathname(window.location.pathname || '/');
}

export type { BillableAction, BillableContext, BillableToolId };

export interface UsageAuditEntry {
  id: string;
  toolId: BillableToolId;
  artifactId: string;
  action: BillableAction;
  occurredAt: string;
}

export interface UsageState {
  availableUses: number;
  totalConsumed: number;
  exhaustedAt: string | null;
  nextReleaseAt: string | null;
  recentActions: UsageAuditEntry[];
}

export interface SubscriptionState {
  planId: 'premium';
  startedAt: string;
  expiresAt: string;
}

export interface UsageDecision {
  allowed: boolean;
  accountRequired?: boolean;
  upgradeRequired?: boolean;
  emailVerificationRequired?: boolean;
  reason?: string;
}

export interface ToolUsageProgress {
  current: number;
  limit: number | null;
  unlimited: boolean;
  remaining: number | null;
  ratio: number;
  exhaustedAt: string | null;
  nextReleaseAt: string | null;
  premiumExpiresAt: string | null;
}

/** Cache em memória sincronizado por useAuth via /api/auth/me */
let cachedProgress: ToolUsageProgress = {
  current: 0,
  limit: null,
  unlimited: false,
  remaining: null,
  ratio: 0,
  exhaustedAt: null,
  nextReleaseAt: null,
  premiumExpiresAt: null
};

let cachedPlanId: PlanId = 'gratis';

export function hydrateBillingFromServer(input: {
  planId?: PlanId | string | null;
  usage?: Partial<ToolUsageProgress> | null;
}) {
  if (input.planId === 'premium' || input.planId === 'gratis') {
    cachedPlanId = input.planId;
  }
  if (input.usage) {
    cachedProgress = {
      current: Number(input.usage.current) || 0,
      limit: input.usage.limit ?? null,
      unlimited: Boolean(input.usage.unlimited),
      remaining: input.usage.remaining ?? null,
      ratio: Number(input.usage.ratio) || 0,
      exhaustedAt: input.usage.exhaustedAt ?? null,
      nextReleaseAt: input.usage.nextReleaseAt ?? null,
      premiumExpiresAt: input.usage.premiumExpiresAt ?? null
    };
  }
}

export function getSubscriptionState(): SubscriptionState | null {
  if (!cachedProgress.premiumExpiresAt) return null;
  return {
    planId: 'premium',
    startedAt: '',
    expiresAt: cachedProgress.premiumExpiresAt
  };
}

/** @deprecated Liberação manual removida: use /api/billing/confirm após pagamento. */
export async function grantPremiumMonth(): Promise<SubscriptionState | null> {
  throw new Error(
    'Liberação manual de Premium desativada. Conclua o pagamento no Mercado Pago.'
  );
}

export function cancelPremium() {
  cachedPlanId = 'gratis';
  cachedProgress = {
    ...cachedProgress,
    unlimited: false,
    remaining: null,
    limit: null,
    exhaustedAt: null,
    nextReleaseAt: null,
    premiumExpiresAt: null
  };
}

export function getCurrentPlanId(): PlanId {
  return cachedPlanId;
}

export function getCurrentPlan() {
  return getPlan(getCurrentPlanId());
}

export function setCurrentPlanId(planId: PlanId) {
  if (planId === 'premium') {
    // Premium só no servidor, após confirmação de pagamento.
    return;
  }
  cancelPremium();
}

export function getUsageState(): UsageState {
  return {
    availableUses: cachedProgress.remaining ?? Number.POSITIVE_INFINITY,
    totalConsumed: cachedProgress.current,
    exhaustedAt: cachedProgress.exhaustedAt,
    nextReleaseAt: cachedProgress.nextReleaseAt,
    recentActions: []
  };
}

export function getToolUsageProgress(): ToolUsageProgress {
  return { ...cachedProgress };
}

/**
 * Marca Precisou, Tá Pronto no PDF/WhatsApp?
 * Premium: não. Guest nas gerações livres: não. Conta grátis: sim.
 */
export function shouldBrandDocuments(): boolean {
  if (cachedProgress.unlimited) return false;
  if (!getSession() && hasGuestTrialAvailable()) return false;
  if (!getSession()) return false;
  return true;
}

export function canUseTool(): UsageDecision {
  const copy = guestCopy[billingLocale()];
  if (!getSession()) {
    if (hasGuestTrialAvailable()) {
      return { allowed: true, reason: copy.trialAvailable };
    }
    return {
      allowed: false,
      accountRequired: true,
      reason: copy.accountRequired
    };
  }
  return { allowed: true };
}

const inFlightBillableKeys = new Set<string>();

function billableContextKey(context: BillableContext) {
  return `${context.toolId}|${context.artifactId}|${context.action}`;
}

/**
 * Executa a ação e só registra o consumo no servidor após sucesso.
 * Guest: 2 gerações completas sem marca; depois pede conta.
 */
export async function performBillableAction<T>(context: BillableContext, effect: () => Promise<T> | T) {
  const access = canUseTool();
  if (!access.allowed) {
    if (access.accountRequired && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('rj-account-required', {
          detail: {
            nextHref: window.location.pathname || '/ferramentas',
            variant: 'guest_trial_done'
          }
        })
      );
    }
    return { ...access, result: undefined as T | undefined, charged: false };
  }

  const isGuest = !getSession();
  const key = billableContextKey(context);
  if (inFlightBillableKeys.has(key)) {
    return { allowed: true, result: undefined as T | undefined, charged: false };
  }

  inFlightBillableKeys.add(key);
  try {
    const result = await effect();

    if (isGuest) {
      consumeGuestTrial({
        nextHref: typeof window !== 'undefined' ? window.location.pathname : '/ferramentas'
      });
      if (typeof window !== 'undefined') {
        const copy = guestCopy[billingLocale()];
        const stillHasTrial = hasGuestTrialAvailable();
        window.dispatchEvent(
          new CustomEvent('rj-billable-success', {
            detail: {
              message: stillHasTrial ? copy.guestSuccess : copy.guestSuccessLast,
              toolId: context.toolId,
              action: context.action,
              charged: false,
              guestTrial: true
            }
          })
        );
      }
      return { allowed: true, result, charged: false, guestTrial: true };
    }

    const consumeRes = await fetch('/api/billing/consume', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context)
    });
    const consumeData = await consumeRes.json().catch(() => ({}));

    if (!consumeRes.ok && consumeRes.status !== 402) {
      console.warn('[billing] consume failed', consumeData);
    }

    if (consumeData.usage) {
      hydrateBillingFromServer({ usage: consumeData.usage, planId: cachedPlanId });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('resolva-jato-auth-change'));
      }
    }

    if (consumeRes.status === 402) {
      return {
        allowed: false,
        upgradeRequired: Boolean(consumeData.upgradeRequired),
        emailVerificationRequired: Boolean(consumeData.emailVerificationRequired),
        reason: consumeData.reason || consumeData.error,
        result: undefined as T | undefined,
        charged: false
      };
    }

    const charged = Boolean(consumeData.charged);
    if (typeof window !== 'undefined') {
      const copy = guestCopy[billingLocale()];
      const labels: Record<BillableAction, string> = {
        manual_save: copy.saved,
        download: copy.downloaded,
        analyze: copy.analyzed
      };
      window.dispatchEvent(
        new CustomEvent('rj-billable-success', {
          detail: {
            message: labels[context.action],
            toolId: context.toolId,
            action: context.action,
            charged
          }
        })
      );
    }
    return { allowed: true, result, charged };
  } finally {
    inFlightBillableKeys.delete(key);
  }
}

export function trackToolUse() {
  return getUsageState();
}

export function formatToolUsageLabel() {
  const progress = getToolUsageProgress();
  if (progress.unlimited) return 'Ilimitado · sem marca';
  return 'Ferramentas liberadas';
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}
