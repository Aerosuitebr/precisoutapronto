import { createHmac, timingSafeEqual } from 'node:crypto';

interface NextActionTrackingPayload {
  sourceToolKey: string;
  targetToolKey: string;
  variant: string;
  rank: number;
  issuedAt: number;
}

function validSecret(secret: string) {
  return secret.length >= 32;
}

export function createNextActionTrackingToken(
  payload: NextActionTrackingPayload,
  secret = process.env.NBA_TRACKING_SECRET || ''
) {
  if (!validSecret(secret)) return null;
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function readNextActionTrackingToken(
  token: string,
  secret = process.env.NBA_TRACKING_SECRET || '',
  now = Date.now()
): NextActionTrackingPayload | null {
  if (!validSecret(secret)) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = createHmac('sha256', secret).update(body).digest('base64url');
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as NextActionTrackingPayload;
    if (
      !payload.sourceToolKey || !payload.targetToolKey || payload.variant !== 'rules_v1' ||
      !Number.isInteger(payload.rank) || payload.rank < 1 || payload.rank > 3 ||
      !Number.isInteger(payload.issuedAt) || payload.issuedAt > now || payload.issuedAt < now - 86_400_000
    ) return null;
    return payload;
  } catch {
    return null;
  }
}
