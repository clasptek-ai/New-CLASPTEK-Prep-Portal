export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/readiness/latest
 * Fetch the latest published prediction for a student.
 * Query: ?profileId=
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

    const prediction = await ctx.getLatestPrediction.execute({ studentId, profileId });
    if (!prediction) {
      return NextResponse.json(
        { error: 'No published readiness predictions found' },
        { status: 404 }
      );
    }

    return NextResponse.json(prediction);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
