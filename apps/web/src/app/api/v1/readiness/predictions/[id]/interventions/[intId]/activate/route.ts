import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';

/**
 * POST /api/v1/readiness/predictions/[id]/interventions/[intId]/activate
 * Activate an intervention.
 */

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string; intId: string }> }
) {
  try {
    const params = await props.params;
    const ctx = await getPredictionEngineContext();
    await ctx.triggerIntervention.execute({ predictionId: params.id, interventionId: params.intId });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
