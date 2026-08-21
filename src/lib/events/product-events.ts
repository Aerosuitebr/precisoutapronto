import type { Prisma } from '@prisma/client';
import { getPrisma } from '@/lib/db';

export const PRODUCT_EVENT_SCHEMA_VERSION = 1;
export const MAX_EVENT_BATCH_SIZE = 20;
export const MAX_EVENT_PROPERTIES = 32;

const EVENT_NAMES = new Set([
  'discovery.page_view',
  'discovery.search',
  'discovery.tool_selected',
  'task.started',
  'task.first_value',
  'task.completed',
  'outcome.downloaded',
  'outcome.copied',
  'outcome.shared',
  'outcome.approved',
  'outcome.pix_viewed',
  'continuity.saved',
  'continuity.duplicated',
  'continuity.customer_reused',
  'continuity.history_opened',
  'growth.share_opened',
  'growth.recipient_action',
  'growth.template_forked',
  'growth.recipient_activated',
  'recommendation.shown',
  'recommendation.clicked',
  'recommendation.completed',
  'experiment.exposed',
  'feedback.helpfulness',
  'request.resolution_gap',
  'ai.route_requested',
  'ai.route_accepted',
  'ai.prefill_shown',
  'ai.prefill_accepted'
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ID_RE = /^[A-Za-z0-9._:-]{1,128}$/;
const SAFE_KEY_RE = /^[a-z][a-z0-9_]{0,63}$/;
const FORBIDDEN_PROPERTY_KEY_RE = /(cpf|cnpj|tax.?id|email|phone|whatsapp|address|bank|pix|prompt|document.?text|customer.?name|client.?name)/i;
const EMAIL_VALUE_RE = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/;

type EventProperty = string | number | boolean | null;

export interface IncomingProductEvent {
  eventId: string;
  eventName: string;
  occurredAt: string;
  schemaVersion: number;
  anonymousId: string;
  sessionId: string;
  toolKey?: string;
  taskId?: string;
  artifactId?: string;
  properties: Record<string, EventProperty>;
}

export interface ValidatedProductEvent extends IncomingProductEvent {
  occurredAt: string;
}

export type ProductEventValidation =
  | { ok: true; event: ValidatedProductEvent }
  | { ok: false; error: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateProperties(value: unknown): value is Record<string, EventProperty> {
  if (!isPlainObject(value) || Object.keys(value).length > MAX_EVENT_PROPERTIES) return false;
  return Object.entries(value).every(([key, property]) => {
    if (!SAFE_KEY_RE.test(key) || FORBIDDEN_PROPERTY_KEY_RE.test(key)) return false;
    if (property === null || typeof property === 'boolean') return true;
    if (typeof property === 'number') return Number.isFinite(property);
    return typeof property === 'string' && property.length <= 240 && !EMAIL_VALUE_RE.test(property);
  });
}

export function validateProductEvent(value: unknown, now = new Date()): ProductEventValidation {
  if (!isPlainObject(value)) return { ok: false, error: 'event must be an object' };
  if (value.userId !== undefined) return { ok: false, error: 'userId is server-managed' };
  if (typeof value.eventId !== 'string' || !UUID_RE.test(value.eventId)) {
    return { ok: false, error: 'invalid eventId' };
  }
  if (typeof value.eventName !== 'string' || !EVENT_NAMES.has(value.eventName)) {
    return { ok: false, error: 'unsupported eventName' };
  }
  if (value.schemaVersion !== PRODUCT_EVENT_SCHEMA_VERSION) {
    return { ok: false, error: 'unsupported schemaVersion' };
  }
  if (typeof value.anonymousId !== 'string' || !SAFE_ID_RE.test(value.anonymousId)) {
    return { ok: false, error: 'invalid anonymousId' };
  }
  if (typeof value.sessionId !== 'string' || !SAFE_ID_RE.test(value.sessionId)) {
    return { ok: false, error: 'invalid sessionId' };
  }
  if (value.toolKey !== undefined && (typeof value.toolKey !== 'string' || !SAFE_ID_RE.test(value.toolKey))) {
    return { ok: false, error: 'invalid toolKey' };
  }
  for (const key of ['taskId', 'artifactId'] as const) {
    const id = value[key];
    if (id !== undefined && (typeof id !== 'string' || !UUID_RE.test(id))) {
      return { ok: false, error: `invalid ${key}` };
    }
  }
  if (typeof value.occurredAt !== 'string') return { ok: false, error: 'invalid occurredAt' };
  const occurredAt = new Date(value.occurredAt);
  if (!Number.isFinite(occurredAt.getTime())) return { ok: false, error: 'invalid occurredAt' };
  if (occurredAt.getTime() > now.getTime() + 5 * 60 * 1000) {
    return { ok: false, error: 'occurredAt is in the future' };
  }
  if (occurredAt.getTime() < now.getTime() - 7 * 24 * 60 * 60 * 1000) {
    return { ok: false, error: 'occurredAt is too old' };
  }
  if (!validateProperties(value.properties)) return { ok: false, error: 'invalid or sensitive properties' };

  return {
    ok: true,
    event: {
      eventId: value.eventId,
      eventName: value.eventName,
      occurredAt: occurredAt.toISOString(),
      schemaVersion: value.schemaVersion,
      anonymousId: value.anonymousId,
      sessionId: value.sessionId,
      ...(typeof value.toolKey === 'string' ? { toolKey: value.toolKey } : {}),
      ...(typeof value.taskId === 'string' ? { taskId: value.taskId } : {}),
      ...(typeof value.artifactId === 'string' ? { artifactId: value.artifactId } : {}),
      properties: value.properties as Record<string, EventProperty>
    }
  };
}

export async function persistProductEvents(events: ValidatedProductEvent[], userId?: string) {
  const data: Prisma.ProductEventCreateManyInput[] = events.map((event) => ({
    id: event.eventId,
    eventName: event.eventName,
    occurredAt: new Date(event.occurredAt),
    userId: userId || null,
    anonymousId: event.anonymousId,
    sessionId: event.sessionId,
    toolKey: event.toolKey || null,
    taskId: event.taskId || null,
    artifactId: event.artifactId || null,
    properties: event.properties,
    schemaVersion: event.schemaVersion
  }));
  return getPrisma().productEvent.createMany({ data, skipDuplicates: true });
}
