export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { ConfidenceAssessmentEngine } from '@clasptek/domain-prediction-engine';

/**
 * GET /api/v1/readiness/confidence
 * Retrieve detailed explainable confidence report
 */

export async function GET(req: NextRequest) {
  try {
    const ctx = await getPredictionEngineContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') ?? session.userId;
    const profileId = searchParams.get('profileId') ?? '00000000-0000-0000-0000-000000000101';

    const stability = await ctx.getPredictionStability.execute(studentId, profileId);
    const score = stability?.stabilityScore?.score ?? 85;

    const engine = new ConfidenceAssessmentEngine();
    const report = engine.assessConfidence({
      studentId,
      profileId,
      stabilityScore: score,
      mockExamCount: 3,
      completedPracticeQuestions: 140,
      lastEvaluationScore: 78,
    });

    return NextResponse.json({ report });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
