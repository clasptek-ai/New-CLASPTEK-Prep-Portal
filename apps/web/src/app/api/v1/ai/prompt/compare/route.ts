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
    const { experimentName, baselineVersionId, candidateVersionId, triggerReason, samples } = body;

    if (
      !experimentName ||
      !baselineVersionId ||
      !candidateVersionId ||
      !triggerReason ||
      !samples
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const experimentId = await ctx.comparePromptVersions.execute({
      tenantId: session.tenantId ?? '00000000-0000-0000-0000-000000000000',
      experimentName,
      baselineVersionId,
      candidateVersionId,
      triggerReason,
      createdBy: session.userId,
      samples,
    });

    return NextResponse.json({ success: true, experimentId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
