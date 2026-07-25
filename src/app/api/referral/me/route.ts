import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isDatabaseConfigured } from '@/lib/db';
import { getReferralDashboard } from '@/lib/referral';

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco de dados não configurado.' }, { status: 503 });
    }

    const session = await getValidSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const dashboard = await getReferralDashboard(session.sub);
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('[referral/me]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao carregar indicações.' },
      { status: 500 }
    );
  }
}
