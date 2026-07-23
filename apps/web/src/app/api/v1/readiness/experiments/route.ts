export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';

/**
 * GET /api/v1/readiness/experiments
 * Fetch the active experiment if any.
 *
 * POST /api/v1/readiness/experiments
 * Create a new experiment.
 * Body: { experimentCode, displayName, controlModelVersionId, challengerModelVersionId, trafficSplitPercentage }
 */

export async function GET(_req: NextRequest) {
  try {
    const ctx = await getPredictionEngineContext();
    const active = await ctx.getActiveExperiment.execute();
    return NextResponse.json({ active });
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
    const body = await req.json();
    const {
      experimentCode,
      displayName,
      controlModelVersionId,
      challengerModelVersionId,
      trafficSplitPercentage,
    } = body;

    if (
      !experimentCode ||
      !controlModelVersionId ||
      !challengerModelVersionId ||
      trafficSplitPercentage === undefined
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await ctx.createExperiment.execute({
      experimentCode,
      displayName,
      controlModelVersionId,
      challengerModelVersionId,
      trafficSplitPercentage,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
