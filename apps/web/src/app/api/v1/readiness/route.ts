export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/readiness
 * Search predictions — student-scoped or general.
 * Query: ?studentId=&profileId=&status=&limit=&offset=
 *
 * POST /api/v1/readiness
 * Generate a new readiness prediction.
 * Body: { profileId, learnerState, latestEvaluationSummaries, practiceStatistics,
 *         studyStreak, competencyMastery, forecastWindow, profileCode }
 */

export async function GET(req: NextRequest) {
  try {
    const ctx = await getPredictionEngineContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    const studentId = session.userId;

    const { searchParams } = new URL(req.url);
    const list = await ctx.searchPredictions.execute({
      studentId,
      profileId: searchParams.get('profileId') ?? undefined,
      status: (searchParams.get('status') as 'DRAFT' | 'PUBLISHED' | null) ?? undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    });

    return NextResponse.json({ predictions: list, count: list.length });
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
    const studentId = session.userId;

    const body = await req.json();
    const {
      profileId,
      learnerState,
      latestEvaluationSummaries,
      practiceStatistics,
      studyStreak,
      competencyMastery,
      forecastWindow,
      profileCode,
    } = body;

    if (!profileId || !profileCode) {
      return NextResponse.json(
        { error: 'Missing required fields: profileId, profileCode' },
        { status: 400 }
      );
    }

    const result = await ctx.generatePrediction.execute({
      studentId,
      profileId,
      learnerState: learnerState ?? {},
      latestEvaluationSummaries: latestEvaluationSummaries ?? {},
      practiceStatistics: practiceStatistics ?? {},
      studyStreak: studyStreak ?? {},
      competencyMastery: competencyMastery ?? {},
      forecastWindow: forecastWindow ?? '30D',
      profileCode,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
