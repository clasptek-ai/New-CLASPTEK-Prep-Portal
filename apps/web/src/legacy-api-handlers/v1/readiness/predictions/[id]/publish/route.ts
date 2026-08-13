export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';

/**
 * POST /api/v1/readiness/predictions/[id]/publish
 * Publish a readiness prediction.
 */

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const ctx = await getPredictionEngineContext();
    await ctx.publishPrediction.execute({ predictionId: params.id });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
