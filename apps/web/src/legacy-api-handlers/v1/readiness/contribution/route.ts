export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/readiness/contribution
 * Retrieve skill contribution breakdown and prioritize focus advice
 */

export async function GET(req: NextRequest) {
  try {
    const ctx = await getPredictionEngineContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') ?? session.userId;
    const profileId = searchParams.get('profileId') ?? '00000000-0000-0000-0000-000000000101';

    // Retrieve timeline snapshot to pull competency maps
    const timeline = await ctx.getTimeline.execute(studentId, profileId);
    if (!timeline || timeline.snapshots.length === 0) {
      return NextResponse.json({
        hasData: false,
        skillContributions: [
          { skill: 'Reading', contribution: 25, status: 'INITIALIZING' },
          { skill: 'Listening', contribution: 25, status: 'INITIALIZING' },
          { skill: 'Writing', contribution: 25, status: 'INITIALIZING' },
          { skill: 'Speaking', contribution: 25, status: 'INITIALIZING' },
        ],
      });
    }

    const latestSnap = timeline.snapshots[timeline.snapshots.length - 1];
    const data = await ctx.getSkillContribution.execute(latestSnap.id);

    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
