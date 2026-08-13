export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';

/**
 * GET /api/v1/readiness/features
 * Retrieve all registered features in the catalogue.
 *
 * POST /api/v1/readiness/features
 * Register a new predictive feature in the catalogue.
 * Body: { featureCode, displayName, sourceDomain, normalizationMethod, defaultWeight, version, description }
 */

export async function GET(req: NextRequest) {
  try {
    const ctx = await getPredictionEngineContext();
    const list = await ctx.getFeatureCatalogue.execute();
    return NextResponse.json({ features: list, count: list.length });
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
      featureCode,
      displayName,
      sourceDomain,
      normalizationMethod,
      defaultWeight,
      version,
      description,
    } = body;

    if (
      !featureCode ||
      !displayName ||
      !sourceDomain ||
      !normalizationMethod ||
      defaultWeight === undefined ||
      !version
    ) {
      return NextResponse.json({ error: 'Missing required catalogue fields' }, { status: 400 });
    }

    const result = await ctx.registerFeatureInCatalogue.execute({
      featureCode,
      displayName,
      sourceDomain,
      normalizationMethod,
      defaultWeight: parseFloat(defaultWeight),
      version,
      description,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
