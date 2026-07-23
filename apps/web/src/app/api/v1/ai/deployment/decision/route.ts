export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getAiEvaluationContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const runId = searchParams.get('runId');

    if (!runId) {
      return NextResponse.json({ error: 'Missing runId parameter' }, { status: 400 });
    }

    const decision = await ctx.getDeploymentDecision.execute(runId);
    if (!decision) {
      return NextResponse.json({ error: 'Deployment decision not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      decision: {
        id: decision.id,
        runId: decision.runId,
        experimentId: decision.experimentId,
        verdict: decision.verdict,
        agreementRate: decision.agreementRate,
        calibrationAccuracy: decision.calibrationAccuracy,
        regressionCount: decision.regressionCount,
        criticalRegressions: decision.criticalRegressions,
        decisionReason: decision.decisionReason,
        thresholdsApplied: decision.thresholdsApplied,
        decidedBy: decision.decidedBy,
        decidedAt: decision.decidedAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
