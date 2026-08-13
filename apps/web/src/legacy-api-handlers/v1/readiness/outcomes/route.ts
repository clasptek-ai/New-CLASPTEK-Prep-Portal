export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';

/**
 * POST /api/v1/readiness/outcomes
 * Record actual outcomes to track prediction accuracy and calibration.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { predictionId, studentId, actualScore } = body;

    if (!predictionId || !studentId || actualScore === undefined) {
      return NextResponse.json(
        { error: 'predictionId, studentId, and actualScore are required' },
        { status: 400 }
      );
    }

    const ctx = await getPredictionEngineContext();
    const result = await ctx.recordPredictionOutcome.execute({
      predictionId,
      studentId,
      actualScore,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
