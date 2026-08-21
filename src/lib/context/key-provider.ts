export interface ContextEncryptionKey {
  version: string;
  key: Buffer;
}

export interface ContextKeyProvider {
  active(): ContextEncryptionKey | null;
  byVersion(version: string): ContextEncryptionKey | null;
}

const KEY_VERSION = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,31}$/;

function decodeKey(version: string, encoded: unknown): ContextEncryptionKey | null {
  if (!KEY_VERSION.test(version) || typeof encoded !== 'string' || !encoded) return null;
  try {
    const key = Buffer.from(encoded, 'base64');
    if (key.length !== 32 || key.toString('base64').replace(/=+$/, '') !== encoded.replace(/=+$/, '')) return null;
    return { version, key };
  } catch {
    return null;
  }
}

export function createEnvironmentContextKeyProvider(
  environment: Record<string, string | undefined> = process.env
): ContextKeyProvider {
  function keyring() {
    const keys = new Map<string, ContextEncryptionKey>();
    const raw = (environment.CONTEXT_ENCRYPTION_KEYS_JSON || '').trim();
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return keys;
        const entries = Object.entries(parsed);
        if (entries.length > 8) return keys;
        for (const [version, encoded] of entries) {
          const decoded = decodeKey(version, encoded);
          if (!decoded) return new Map<string, ContextEncryptionKey>();
          keys.set(version, decoded);
        }
        return keys;
      } catch {
        return keys;
      }
    }

    const legacyVersion = (environment.CONTEXT_ENCRYPTION_KEY_VERSION || '').trim();
    const legacy = decodeKey(legacyVersion, (environment.CONTEXT_ENCRYPTION_KEY_BASE64 || '').trim());
    if (legacy) keys.set(legacy.version, legacy);
    return keys;
  }

  return {
    active() {
      const keys = keyring();
      const activeVersion = (
        environment.CONTEXT_ENCRYPTION_ACTIVE_VERSION
        || environment.CONTEXT_ENCRYPTION_KEY_VERSION
        || ''
      ).trim();
      const active = keys.get(activeVersion);
      return active ? { version: active.version, key: Buffer.from(active.key) } : null;
    },
    byVersion(version) {
      const selected = keyring().get(version);
      return selected ? { version: selected.version, key: Buffer.from(selected.key) } : null;
    }
  };
}

export const environmentContextKeyProvider = createEnvironmentContextKeyProvider();
