export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function POST(req: NextRequest) {
  try {
    const ctx = getAiEvaluationContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const body = await req.json();
    const {
      datasetId,
      triggerType,
      promptVersionId,
      rubricVersion,
      modelVersion,
      modelCode,
      provider,
    } = body;

    if (!datasetId || !triggerType) {
      return NextResponse.json({ error: 'Missing datasetId or triggerType' }, { status: 400 });
    }

    const runId = await ctx.runBenchmark.execute({
      tenantId: session.tenantId ?? '00000000-0000-0000-0000-000000000000',
      datasetId,
      triggerType,
      createdBy: session.userId,
      promptVersionId,
      rubricVersion,
      modelVersion,
      modelCode,
      provider,
    });

    // Run regression detection
    await ctx.detectRegression.execute({
      tenantId: session.tenantId ?? '00000000-0000-0000-0000-000000000000',
      runId,
    });

    // Generate deployment decision
    const decision = await ctx.approveDeployment.execute({
      tenantId: session.tenantId ?? '00000000-0000-0000-0000-000000000000',
      runId,
    });

    return NextResponse.json({
      success: true,
      runId,
      verdict: decision.verdict,
      reason: decision.decisionReason,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
