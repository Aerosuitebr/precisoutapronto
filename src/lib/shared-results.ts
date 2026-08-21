import { getPrisma, isDatabaseConfigured } from '@/lib/db';

export interface SharedResultLine {
  label: string;
  value: string;
  emphasis?: boolean;
}

export const SHARED_RESULT_TOOLS: Record<string, { path: string; cta: string }> = {
  divisor_conta: { path: '/divisor-de-conta', cta: 'Criar a minha divisão' },
  mei_clt: { path: '/mei-ou-clt', cta: 'Comparar meu salário' },
  precificacao: { path: '/calculadora-de-preco-freelancer', cta: 'Calcular meu preço' },
  enem: { path: '/corretor-de-redacao-enem', cta: 'Corrigir minha redação' }
};

export function sanitizeSharedResultLines(value: unknown): SharedResultLine[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const raw = item as Record<string, unknown>;
    const label = typeof raw.label === 'string' ? raw.label.trim().slice(0, 60) : '';
    const lineValue = typeof raw.value === 'string' ? raw.value.trim().slice(0, 80) : '';
    if (!label || !lineValue) return [];
    return [{ label, value: lineValue, emphasis: raw.emphasis === true }];
  });
}

export async function loadSharedResult(token: string) {
  if (!isDatabaseConfigured() || !/^[A-Za-z0-9_-]{6,24}$/.test(token)) return null;
  const result = await getPrisma().sharedResult.findUnique({ where: { token } });
  return result && result.expiresAt > new Date() ? result : null;
}
