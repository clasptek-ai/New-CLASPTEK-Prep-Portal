import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';

/**
 * GET /api/v1/readiness/metrics
 * Fetch latest lifecycle performance metrics for a model version.
 * 
 * POST /api/v1/readiness/metrics
 * Calculate and save latest lifecycle performance metrics for a model version.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelVersionId = searchParams.get('modelVersionId');

    if (!modelVersionId) {
      return NextResponse.json({ error: 'modelVersionId query parameter is required' }, { status: 400 });
    }

    const ctx = await getPredictionEngineContext();
    const metrics = await ctx.getPredictionLifecycleMetrics.execute({ modelVersionId });

    return NextResponse.json({ metrics });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modelVersionId } = body;

    if (!modelVersionId) {
      return NextResponse.json({ error: 'modelVersionId is required' }, { status: 400 });
    }

    const ctx = await getPredictionEngineContext();
    const result = await ctx.calculatePredictionLifecycleMetrics.execute({ modelVersionId });

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
