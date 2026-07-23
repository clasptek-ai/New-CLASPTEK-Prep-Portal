export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/readiness/timeline
 * Retrieve student timeline and calculated trend states
 *
 * POST /api/v1/readiness/timeline
 * Record a new timeline state snapshot
 */

export async function GET(req: NextRequest) {
  try {
    const ctx = await getPredictionEngineContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') ?? session.userId;
    const profileId = searchParams.get('profileId') ?? '00000000-0000-0000-0000-000000000101';

    const timeline = await ctx.getTimeline.execute(studentId, profileId);
    if (!timeline) return NextResponse.json({ timeline: null, trend: null });

    // Extract trends or trigger analysis orchestrator
    const trend = await ctx.timelineOrchestrator.processTimelineAnalytics(studentId, profileId);

    return NextResponse.json({ timeline, trend });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getPredictionEngineContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const body = await req.json();
    const {
      profileId,
      readinessScore,
      competencyMastery,
      learnerState,
      practiceStatistics,
      studyStreak,
    } = body;

    const snapId = await ctx.recordReadinessSnapshot.execute({
      tenantId: '00000000-0000-0000-0000-000000000000',
      studentId: session.userId,
      profileId: profileId ?? '00000000-0000-0000-0000-000000000101',
      readinessScore: readinessScore ?? 75,
      competencyMastery: competencyMastery ?? {},
      learnerState: learnerState ?? {},
      practiceStatistics: practiceStatistics ?? {},
      studyStreak: studyStreak ?? {},
      createdBy: session.userId,
    });

    return NextResponse.json({ success: true, snapshotId: snapId });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
