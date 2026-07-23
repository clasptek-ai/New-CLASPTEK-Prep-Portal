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

    const results = await ctx.getBenchmarkResults.execute(runId);

    return NextResponse.json({
      success: true,
      results: results.map((r) => ({
        id: r.id,
        runId: r.runId,
        datasetItemId: r.datasetItemId,
        aiScore: r.aiScore,
        humanScore: r.humanScore,
        scoreDifference: r.scoreDifference,
        agreesWithHuman: r.agreesWithHuman,
        confidence: r.confidence,
        latencyMs: r.latencyMs,
        costUsd: r.costUsd,
        isFalsePositive: r.isFalsePositive,
        isFalseNegative: r.isFalseNegative,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
