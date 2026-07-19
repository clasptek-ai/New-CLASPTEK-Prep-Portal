import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';

/**
 * POST /api/v1/readiness/experiments/[id]/complete
 * Complete a prediction experiment.
 */

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const ctx = await getPredictionEngineContext();
    await ctx.completeExperiment.execute({ experimentId: params.id });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
