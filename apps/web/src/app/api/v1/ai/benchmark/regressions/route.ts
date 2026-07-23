export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getAiEvaluationContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const tenantId = session.tenantId ?? '00000000-0000-0000-0000-000000000000';
    const regressions = await ctx.getRegressionHistory.execute(tenantId);

    return NextResponse.json({
      success: true,
      regressions: regressions.map((r) => ({
        id: r.id,
        runId: r.runId,
        baselineRunId: r.baselineRunId,
        regressionType: r.regressionType,
        severity: r.severity,
        currentValue: r.currentValue,
        baselineValue: r.baselineValue,
        thresholdValue: r.thresholdValue,
        delta: r.delta,
        deltaPercent: r.deltaPercent,
        description: r.description,
        isResolved: r.isResolved,
        detectedAt: r.detectedAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
