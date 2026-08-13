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
    const experimentId = searchParams.get('experimentId');

    if (!experimentId) {
      return NextResponse.json({ error: 'Missing experimentId parameter' }, { status: 400 });
    }

    const performance = await ctx.getPromptPerformance.execute(experimentId);
    if (!performance) {
      return NextResponse.json({ error: 'Performance metrics not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      performance: {
        id: performance.id,
        experimentId: performance.experimentId,
        promptVersionId: performance.promptVersionId,
        sampleCount: performance.sampleCount,
        agreementRate: performance.agreementRate?.rate,
        calibrationAccuracy: performance.calibrationAccuracy?.value,
        instructorOverrideRate: performance.instructorOverrideRate,
        avgScoreDifference: performance.avgScoreDifference,
        scoreDrift: performance.scoreDrift?.delta,
        falsePositiveRate: performance.falsePositiveRate,
        falseNegativeRate: performance.falseNegativeRate,
        confidenceDistribution: performance.confidenceDistribution
          ? {
              mean: performance.confidenceDistribution.mean,
              stddev: performance.confidenceDistribution.stddev,
              p10: performance.confidenceDistribution.p10,
              p90: performance.confidenceDistribution.p90,
            }
          : null,
        averageLatency: performance.averageLatency?.avgMs,
        evaluationCost: performance.evaluationCost?.perSampleUsd,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
