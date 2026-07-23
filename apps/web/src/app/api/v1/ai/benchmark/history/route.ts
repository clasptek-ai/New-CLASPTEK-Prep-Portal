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
    const runs = await ctx.getBenchmarkRuns.execute(tenantId);

    return NextResponse.json({
      success: true,
      runs: runs.map((r) => ({
        id: r.id,
        datasetId: r.datasetId,
        experimentId: r.experimentId,
        promptVersionId: r.promptVersionId,
        rubricVersion: r.rubricVersion,
        modelVersion: r.modelVersion,
        modelCode: r.modelCode,
        provider: r.provider,
        triggerType: r.triggerType,
        status: r.status,
        totalItems: r.totalItems,
        processedItems: r.processedItems,
        failedItems: r.failedItems,
        agreementRate: r.agreementRate?.rate,
        calibrationAccuracy: r.calibrationAccuracy?.value,
        avgScoreDifference: r.avgScoreDifference,
        falsePositiveRate: r.falsePositiveRate,
        falseNegativeRate: r.falseNegativeRate,
        avgLatencyMs: r.averageLatency?.avgMs,
        totalCostUsd: r.evaluationCost?.totalUsd,
        createdBy: r.createdBy,
        createdAt: r.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
