export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * POST /api/v1/readiness/predictions/[id]/outcome
 * Record actual student score against predicted score to evaluate accuracy and drift.
 * Body: { actualScore }
 */

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const ctx = await getPredictionEngineContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    const studentId = session.userId;

    const body = await req.json();
    const { actualScore } = body;

    if (actualScore === undefined) {
      return NextResponse.json({ error: 'Missing actualScore parameter' }, { status: 400 });
    }

    const result = await ctx.recordPredictionOutcome.execute({
      predictionId: params.id,
      studentId,
      actualScore: parseFloat(actualScore),
    });

    return NextResponse.json({ success: true, outcomeId: result.outcomeId });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
