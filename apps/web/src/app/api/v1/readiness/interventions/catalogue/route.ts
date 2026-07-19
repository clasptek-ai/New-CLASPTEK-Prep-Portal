import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';

/**
 * GET /api/v1/readiness/interventions/catalogue
 * Fetch all standard intervention templates from the catalogue.
 */

export async function GET(req: NextRequest) {
  try {
    const ctx = await getPredictionEngineContext();
    const list = await ctx.getInterventionCatalogue.execute();
    return NextResponse.json({ templates: list, count: list.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
