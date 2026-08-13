export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/readiness/history
 * Fetch prediction history (time-series) for a student.
 * Query: ?profileId=&limit=
 */

export async function GET(req: NextRequest) {
  try {
    const ctx = await getPredictionEngineContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    const studentId = session.userId;

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('profileId');
    if (!profileId) return NextResponse.json({ error: 'Missing profile ID' }, { status: 400 });

    const limitVal = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const list = await ctx.getPredictionHistory.execute({ studentId, profileId, limit: limitVal });
    return NextResponse.json({ history: list, count: list.length });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
