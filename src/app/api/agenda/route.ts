import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import type { AgendaEventPriority, AgendaEventStatus } from '@/lib/agenda/types';

const priorities = new Set<AgendaEventPriority>(['normal', 'high', 'critical']);
const statuses = new Set<AgendaEventStatus>(['confirmed', 'tentative', 'done']);
const text = (value: unknown, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

function parseEvent(body: Record<string, unknown>) {
  const id = text(body.id, 100);
  const title = text(body.title, 160);
  const date = text(body.date, 10);
  const startTime = text(body.startTime, 5);
  const endTime = text(body.endTime, 5);
  const priority = text(body.priority, 20) as AgendaEventPriority;
  const status = text(body.status, 20) as AgendaEventStatus;
  if (!id || !title || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) return null;
  return {
    id,
    title,
    client: text(body.client, 160),
    date,
    startTime,
    endTime,
    location: text(body.location, 240),
    notes: text(body.notes, 3000),
    alertMinutes: Math.max(0, Math.min(43200, Number(body.alertMinutes) || 0)),
    priority: priorities.has(priority) ? priority : 'normal',
    status: statuses.has(status) ? status : 'confirmed'
  };
}

async function userId() {
  if (!isDatabaseConfigured()) return null;
  return (await getValidSessionFromCookies())?.sub ?? null;
}

export async function GET() {
  try {
    const ownerId = await userId();
    if (!ownerId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const events = await getPrisma().agendaEvent.findMany({
      where: { userId: ownerId },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });
    return NextResponse.json({ events });
  } catch (error) {
    console.error('[agenda:get]', error);
    return NextResponse.json({ error: 'Could not load agenda.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ownerId = await userId();
    if (!ownerId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const event = parseEvent(await request.json() as Record<string, unknown>);
    if (!event) return NextResponse.json({ error: 'Invalid event.' }, { status: 400 });
    const prisma = getPrisma();
    const existing = await prisma.agendaEvent.findUnique({ where: { id: event.id }, select: { userId: true } });
    if (existing && existing.userId !== ownerId) {
      return NextResponse.json({ error: 'Event belongs to another user.' }, { status: 403 });
    }
    const saved = await prisma.agendaEvent.upsert({
      where: { id: event.id },
      create: { ...event, userId: ownerId },
      update: event
    });
    return NextResponse.json({ event: saved });
  } catch (error) {
    console.error('[agenda:post]', error);
    return NextResponse.json({ error: 'Could not save event.' }, { status: 500 });
  }
}
