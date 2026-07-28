import { getSession } from './auth';
import { getPlan, type PlanId } from './plans';
import type { BillableAction, BillableContext, BillableToolId } from './billing-server';
import {
  consumeGuestTrial,
  hasGuestTrialAvailable
} from './guest-trial';

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
 * Marca Resolva Jato no PDF/WhatsApp?
 * Premium: não. Guest na 1ª geração: não. Conta grátis: sim.
 */
export function shouldBrandDocuments(): boolean {
  if (cachedProgress.unlimited) return false;
  if (!getSession() && hasGuestTrialAvailable()) return false;
  if (!getSession()) return false;
  return true;
}

export function canUseTool(): UsageDecision {
  if (!getSession()) {
    if (hasGuestTrialAvailable()) {
      return { allowed: true, reason: 'Degustação gratuita: uma geração completa sem marca.' };
    }
    return {
      allowed: false,
      accountRequired: true,
      reason:
        'Crie uma conta gratuita para continuar gerando documentos. A geração segue grátis, com a marca Resolva Jato.'
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
 * Guest: 1 geração completa sem marca; depois pede conta.
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
        window.dispatchEvent(
          new CustomEvent('rj-billable-success', {
            detail: {
              message: 'Documento gerado sem marca. Crie uma conta grátis para continuar.',
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
      const labels: Record<BillableAction, string> = {
        manual_save: 'Documento salvo com sucesso.',
        download: 'Download concluído.'
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
