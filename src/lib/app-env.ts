/**
 * Ambiente da aplicação (produção vs staging/homolog).
 * Staging: APP_ENV=staging ou host staging.* / APP_URL contendo staging.
 */

export type AppEnv = 'production' | 'staging' | 'development';

export function getAppEnv(): AppEnv {
  const explicit = (process.env.APP_ENV || '').trim().toLowerCase();
  if (explicit === 'staging' || explicit === 'homolog' || explicit === 'homologacao') {
    return 'staging';
  }
  if (explicit === 'production' || explicit === 'prod') {
    return 'production';
  }

  const url = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || '').toLowerCase();
  if (url.includes('staging.') || url.includes('homolog.') || url.includes('localhost')) {
    if (url.includes('staging.') || url.includes('homolog.')) return 'staging';
  }

  if (process.env.NODE_ENV !== 'production') return 'development';
  return 'production';
}

export function isStagingEnv(): boolean {
  return getAppEnv() === 'staging';
}

/** Staging nunca deve ser indexado. */
export function stagingRobots(): { index: false; follow: false } {
  return { index: false, follow: false };
}
