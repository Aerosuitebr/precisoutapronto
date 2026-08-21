import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import {
  environmentContextKeyProvider,
  type ContextKeyProvider
} from './key-provider';

const MAGIC = Buffer.from('RJCTX');
const ENVELOPE_VERSION = 1;
const KEY_VERSION_LENGTH_BYTES = 1;
const NONCE_BYTES = 12;
const TAG_BYTES = 16;

export interface ContextEncryptionScope {
  entity: 'user_business_profile' | 'customer';
  recordId: string;
  ownerUserId: string;
  field: string;
}

export interface EncryptedContextValue {
  ciphertext: Buffer;
  keyVersion: string;
}

function associatedData(scope: ContextEncryptionScope) {
  return Buffer.from([
    'resolva-jato-context-v1',
    scope.entity,
    scope.recordId,
    scope.ownerUserId,
    scope.field
  ].join('\u001f'), 'utf8');
}

export function encryptContextValue(
  plaintext: string,
  scope: ContextEncryptionScope,
  provider: ContextKeyProvider = environmentContextKeyProvider
): EncryptedContextValue | null {
  const active = provider.active();
  if (!active || !plaintext) return null;
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv('aes-256-gcm', active.key, nonce);
  cipher.setAAD(associatedData(scope));
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const keyVersion = Buffer.from(active.version, 'utf8');
  if (keyVersion.length < 1 || keyVersion.length > 32) return null;
  return {
    ciphertext: Buffer.concat([
      MAGIC,
      Buffer.from([ENVELOPE_VERSION, keyVersion.length]),
      keyVersion,
      nonce,
      tag,
      encrypted
    ]),
    keyVersion: active.version
  };
}

export function decryptContextValue(
  envelope: Buffer,
  scope: ContextEncryptionScope,
  provider: ContextKeyProvider = environmentContextKeyProvider
) {
  try {
    const minimum = MAGIC.length + 1 + KEY_VERSION_LENGTH_BYTES + 1 + NONCE_BYTES + TAG_BYTES;
    if (envelope.length < minimum || !envelope.subarray(0, MAGIC.length).equals(MAGIC)) return null;
    if (envelope[MAGIC.length] !== ENVELOPE_VERSION) return null;
    const versionLength = envelope[MAGIC.length + 1];
    if (!versionLength || versionLength > 32) return null;
    const versionStart = MAGIC.length + 2;
    const versionEnd = versionStart + versionLength;
    if (envelope.length < versionEnd + NONCE_BYTES + TAG_BYTES) return null;
    const keyVersion = envelope.subarray(versionStart, versionEnd).toString('utf8');
    const key = provider.byVersion(keyVersion);
    if (!key) return null;
    const nonceStart = versionEnd;
    const tagStart = nonceStart + NONCE_BYTES;
    const dataStart = tagStart + TAG_BYTES;
    const decipher = createDecipheriv('aes-256-gcm', key.key, envelope.subarray(nonceStart, tagStart));
    decipher.setAAD(associatedData(scope));
    decipher.setAuthTag(envelope.subarray(tagStart, dataStart));
    return Buffer.concat([decipher.update(envelope.subarray(dataStart)), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}
