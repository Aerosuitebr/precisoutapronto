import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getGrowthSegment } from '@/lib/growth/segments';

async function auth() {
  if (!isDatabaseConfigured()) return null;
  return getValidSessionFromCookies();
}
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ profile: null }, { status: 401 });
  const profile = await getPrisma().userProfile.findUnique({ where: { userId: session.sub } });
  return NextResponse.json({ profile });
}
export async function PUT(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { segment?: string; companyName?: string; occupation?: string; logoDataUrl?: string };
  if (!body.segment || !getGrowthSegment(body.segment)) return NextResponse.json({ error: 'Invalid segment.' }, { status: 400 });
  const logoDataUrl = body.logoDataUrl?.trim() || null;
  if (logoDataUrl && (!/^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(logoDataUrl) || logoDataUrl.length > 550_000)) {
    return NextResponse.json({ error: 'Logo inválido ou maior que 400 KB.' }, { status: 400 });
  }
  const profile = await getPrisma().userProfile.upsert({
    where: { userId: session.sub },
    create: { userId: session.sub, segment: body.segment, companyName: body.companyName?.slice(0, 120), occupation: body.occupation?.slice(0, 120), logoDataUrl },
    update: { segment: body.segment, companyName: body.companyName?.slice(0, 120), occupation: body.occupation?.slice(0, 120), logoDataUrl: body.logoDataUrl === undefined ? undefined : logoDataUrl }
  });
  return NextResponse.json({ profile });
}
