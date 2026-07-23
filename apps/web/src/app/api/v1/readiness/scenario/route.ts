export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/readiness/scenario
 * Retrieve student scenario simulation forecasts
 *
 * POST /api/v1/readiness/scenario
 * Simulate and persist scenario inputs
 */

export async function GET(req: NextRequest) {
  try {
    const ctx = await getPredictionEngineContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') ?? session.userId;

    const projections = await ctx.scenarioOrchestrator.getProjections(studentId);
    return NextResponse.json({ projections });
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
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const body = await req.json();
    const { scenarioName, scenarioCode, currentReadiness, hoursSimulated, notes } = body;

    if (!scenarioName || !scenarioCode) {
      return NextResponse.json(
        { error: 'Missing required fields: scenarioName, scenarioCode' },
        { status: 400 }
      );
    }

    const scenarioId = await ctx.generateScenario.execute({
      tenantId: '00000000-0000-0000-0000-000000000000',
      studentId: session.userId,
      scenarioName,
      scenarioCode,
      currentReadiness: currentReadiness ?? 70,
      hoursSimulated: hoursSimulated ?? 5,
      notes: notes ?? undefined,
    });

    const projections = await ctx.scenarioOrchestrator.getProjections(session.userId);

    return NextResponse.json({ success: true, scenarioId, projections });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
