export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR'];

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = session.roles.some((r) => ADMIN_ROLES.includes(r));
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({
      dailyCostUsd: 12.45,
      monthlyCostUsd: 340.5,
      monthlyLimitUsd: 3000.0,
      currency: 'USD',
      breakdownByProvider: {
        OpenAI: 8.2,
        Anthropic: 4.25,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
