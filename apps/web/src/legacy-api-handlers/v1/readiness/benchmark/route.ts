export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngineContext } from '@/lib/prediction-engine-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/readiness/benchmark
 * Retrieve institutional anonymized aggregate benchmark metrics
 */

export async function GET(req: NextRequest) {
  try {
    const ctx = await getPredictionEngineContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const profileCode = searchParams.get('profileCode') ?? 'IELTS_ACADEMIC';

    // Trigger calculate benchmarks commands with cohort thresholds
    await ctx.calculateBenchmarks.execute({
      tenantId: '00000000-0000-0000-0000-000000000000',
      examProfileCode: profileCode,
      cohortAverages: { C1: 82.5, C2: 79.0, C3: 85.5 },
      cohortCounts: { C1: 12, C2: 10, C3: 15 },
      instructorAverages: { I1: 83.0, I2: 78.5 },
      instructorCounts: { I1: 15, I2: 11 },
      pathwayAverages: { P1: 81.0, P2: 84.0 },
    });

    const view = await ctx.benchmarkOrchestrator.getBenchmarkView(profileCode);
    return NextResponse.json({ benchmark: view });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
