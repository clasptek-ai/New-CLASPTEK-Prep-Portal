export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/readiness/stability
 * Retrieve student prediction stability indices and trend flags
 */

export async function GET(req: NextRequest) {
  try {
    const ctx = await getPredictionEngineContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') ?? session.userId;
    const profileId = searchParams.get('profileId') ?? '00000000-0000-0000-0000-000000000101';

    // Trigger update handler to recalculate stability from mock data first
    await ctx.updatePredictionStability.execute({
      tenantId: '00000000-0000-0000-0000-000000000000',
      studentId,
      profileId,
      recentScores: [72, 75, 78, 77, 80],
      learningVelocity: 1.5,
      mockScores: [7.5],
      practiceCount: 120,
    });

    const stability = await ctx.getPredictionStability.execute(studentId, profileId);
    return NextResponse.json({ stability });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
