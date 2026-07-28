import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';

type RouteProps = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteProps) {
  try {
    if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
    const session = await getValidSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    const { id } = await params;
    const result = await getPrisma().agendaEvent.deleteMany({ where: { id, userId: session.sub } });
    if (!result.count) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('[agenda:delete]', error);
    return NextResponse.json({ error: 'Could not delete event.' }, { status: 500 });
  }
}
